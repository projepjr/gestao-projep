import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const normalizeEmail = (email: unknown) => `${email || ''}`.trim().toLowerCase()
const PRESIDENCY_DELETE_ERROR = 'Esta conta tem acesso de Presidencia. Para exclui-la, cadastre e mantenha pelo menos outro presidente ativo no sistema. Assim a empresa nao perde o controle das permissoes.'
const activeStatuses = new Set(['active', 'ativo'])

async function profileHasPresidency(adminClient: ReturnType<typeof createClient>, profile: any) {
  if (!profile) return false
  if (profile.role === 'presidente') return true

  const { data } = await adminClient
    .from('permissions')
    .select('subarea_key,can_access')
    .eq('profile_id', profile.id)
    .eq('module_key', 'presidencia')
    .eq('can_access', true)

  return Boolean(data?.some((row: any) =>
    row.subarea_key === '__module__' ||
    row.subarea_key === 'presidencia.seguranca'
  ))
}

async function hasAnotherActivePresident(adminClient: ReturnType<typeof createClient>, targetProfile: any) {
  if (!targetProfile) return false

  const { data: profiles } = await adminClient
    .from('profiles')
    .select('id,role,status')

  const candidates = (profiles || []).filter((profile: any) => {
    if (profile.id === targetProfile.id) return false
    const status = `${profile.status || 'active'}`.toLowerCase()
    return activeStatuses.has(status)
  })

  if (candidates.some((profile: any) => profile.role === 'presidente')) return true

  const ids = candidates.map((profile: any) => profile.id)
  if (!ids.length) return false

  const { data: permissionRows } = await adminClient
    .from('permissions')
    .select('profile_id,subarea_key,can_access')
    .in('profile_id', ids)
    .eq('module_key', 'presidencia')
    .eq('can_access', true)

  return Boolean(permissionRows?.some((row: any) =>
    row.subarea_key === '__module__' ||
    row.subarea_key === 'presidencia.seguranca'
  ))
}

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Metodo nao permitido.' }, 405)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: 'Edge Function sem configuracao do Supabase.' }, 500)
  }

  const authorization = req.headers.get('Authorization') || ''
  if (!authorization.startsWith('Bearer ')) {
    return json({ error: 'Sessao obrigatoria para excluir usuario.' }, 401)
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  })
  const adminClient = createClient(supabaseUrl, serviceRoleKey)

  const { data: callerData, error: callerError } = await userClient.auth.getUser()
  if (callerError || !callerData?.user) {
    return json({ error: 'Sessao invalida.' }, 401)
  }

  let body: { targetUserId?: string; targetEmail?: string } = {}
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Corpo da requisicao invalido.' }, 400)
  }

  const targetUserId = `${body.targetUserId || ''}`.trim()
  const targetEmail = normalizeEmail(body.targetEmail)
  if (!targetUserId && !targetEmail) {
    return json({ error: 'Informe o usuario a ser excluido.' }, 400)
  }

  const { data: callerProfile } = await adminClient
    .from('profiles')
    .select('id,email,role,status')
    .eq('id', callerData.user.id)
    .maybeSingle()

  let targetProfile = null
  if (targetUserId) {
    const { data } = await adminClient
      .from('profiles')
      .select('id,email,role,status')
      .eq('id', targetUserId)
      .maybeSingle()
    targetProfile = data
  }
  if (!targetProfile && targetEmail) {
    const { data } = await adminClient
      .from('profiles')
      .select('id,email,role,status')
      .eq('email', targetEmail)
      .maybeSingle()
    targetProfile = data
  }

  const targetAuthId = targetProfile?.id || targetUserId
  const targetResolvedEmail = normalizeEmail(targetProfile?.email || targetEmail)
  const isSelf = callerData.user.id === targetAuthId || normalizeEmail(callerData.user.email) === targetResolvedEmail
  const callerHasAdminPower = callerProfile?.role === 'presidente' || callerProfile?.role === 'diretor'
  const callerHasPresidencyPower = await profileHasPresidency(adminClient, callerProfile)
  const targetHasPresidency = await profileHasPresidency(adminClient, targetProfile)

  if (!isSelf && !callerHasAdminPower) {
    return json({ error: 'Voce nao tem permissao para excluir este usuario.' }, 403)
  }

  if (targetHasPresidency) {
    const anotherPresidentExists = await hasAnotherActivePresident(adminClient, targetProfile)
    if (!anotherPresidentExists) return json({ error: PRESIDENCY_DELETE_ERROR }, 403)

    if (!isSelf && !callerHasPresidencyPower) {
      return json({ error: 'Contas com acesso de Presidencia so podem ser removidas pela propria Presidencia, e apenas quando ja existe outro presidente ativo.' }, 403)
    }
  }

  let authDeleted = false
  let authWarning = null
  if (targetAuthId) {
    const { error } = await adminClient.auth.admin.deleteUser(targetAuthId)
    if (error) {
      const message = error.message || String(error)
      if (/not found/i.test(message)) {
        authWarning = 'Usuario nao existia mais no Supabase Auth.'
      } else {
        return json({ error: message }, 500)
      }
    } else {
      authDeleted = true
    }
  }

  if (targetProfile?.id) {
    const { error } = await adminClient.from('profiles').delete().eq('id', targetProfile.id)
    if (error) return json({ error: error.message }, 500)
  }

  return json({
    success: true,
    authDeleted,
    profileDeleted: Boolean(targetProfile?.id),
    warning: authWarning,
  })
})
