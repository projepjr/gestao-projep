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
    .select('id,email,role')
    .eq('id', callerData.user.id)
    .maybeSingle()

  let targetProfile = null
  if (targetUserId) {
    const { data } = await adminClient
      .from('profiles')
      .select('id,email,role')
      .eq('id', targetUserId)
      .maybeSingle()
    targetProfile = data
  }
  if (!targetProfile && targetEmail) {
    const { data } = await adminClient
      .from('profiles')
      .select('id,email,role')
      .eq('email', targetEmail)
      .maybeSingle()
    targetProfile = data
  }

  const targetAuthId = targetProfile?.id || targetUserId
  const targetResolvedEmail = normalizeEmail(targetProfile?.email || targetEmail)
  const isSelf = callerData.user.id === targetAuthId || normalizeEmail(callerData.user.email) === targetResolvedEmail
  const callerHasAdminPower = callerProfile?.role === 'presidente' || callerProfile?.role === 'diretor'

  if (!isSelf && !callerHasAdminPower) {
    return json({ error: 'Voce nao tem permissao para excluir este usuario.' }, 403)
  }

  if (!isSelf && targetProfile?.role === 'presidente') {
    return json({ error: 'Contas de Presidencia nao podem ser excluidas por terceiros.' }, 403)
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
