import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { ACCESS_MODULES, normalizePermissions } from '../config/accessControl'
import { SETORES, resolveSetor } from '../data/setores'

const NS = {
  user: '8001',
  meeting: '8002',
  message: '8003',
  notification: '8004',
}
const COMMERCIAL_CONFIG_ROW_ID = 'commercial-team-links'
const COMMERCIAL_CONFIG_SOURCE = 'app_config'
const MODULE_PERMISSION_KEY = '__module__'
const REMOVED_DEMO_EMAILS = [
  'ana.silva@projep.com.br',
  'bruno.costa@projep.com.br',
  'daniela.rocha@projep.com.br',
  'eduardo.nunes@projep.com.br',
  'fernanda.pires@projep.com.br',
  'gustavo.mendes@projep.com.br',
  'helena.cardoso@projep.com.br',
]

const appIdToUuid = (id, namespace) => {
  const raw = `${id || ''}`
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw)) return raw
  let hex = ''
  for (const char of raw) hex += char.charCodeAt(0).toString(16).padStart(2, '0')
  hex = hex.slice(-12).padStart(12, '0')
  return `00000000-0000-4000-${namespace}-${hex}`
}

const stableUuid = (id, namespace) => {
  const raw = `${id || ''}`
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw)) return raw

  let hash = 1469598103934665603n
  for (const char of raw) {
    hash ^= BigInt(char.charCodeAt(0))
    hash = (hash * 1099511628211n) & ((1n << 48n) - 1n)
  }
  const hex = `ff${hash.toString(16).padStart(12, '0').slice(-10)}`
  return `00000000-0000-4000-${namespace}-${hex}`
}

const uuidToAppId = (uuid, namespace) => {
  const value = `${uuid || ''}`
  if (!value.includes(`-${namespace}-`)) return null
  const hex = value.split('-').at(-1)
  if (!hex) return null

  const decoded = (hex.match(/.{1,2}/g) || [])
    .map(part => String.fromCharCode(Number.parseInt(part, 16)))
    .join('')
    .replace(/^\0+/, '')

  if (decoded && /^[\x20-\x7E]+$/.test(decoded)) return decoded

  return null
}

const dateOnly = value => value ? String(value).split('T')[0] : null
const timeOnly = value => value ? String(value).slice(0, 5) : null
const idsEqual = (a, b) => String(a ?? '') === String(b ?? '')
const normalizeEmail = email => `${email || ''}`.trim().toLowerCase()

const logRemoteError = (action, error) => {
  if (error) console.warn(`[Supabase] ${action}:`, error.message || error)
}

const userUuid = userId => appIdToUuid(userId, NS.user)
const remoteUserId = user => user?.supabaseId || userUuid(user?.id)
const meetingUuid = meetingId => stableUuid(meetingId, NS.meeting)
const messageUuid = messageId => stableUuid(messageId, NS.message)
const notificationUuid = notificationId => stableUuid(notificationId, NS.notification)
const defaultEmailFromName = name => {
  const slug = `${name || 'membro'}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 32) || 'membro'
  return `${slug}@projep.com`
}
const isLegacyTemporaryEmail = email => `${email || ''}`.toLowerCase().endsWith('@temporario.projep')

const findUserByAnyId = (users = [], id) => users.find(user =>
  idsEqual(user.id, id) ||
  idsEqual(user.supabaseId, id) ||
  idsEqual(userUuid(user.id), id)
)

const sameUserIdentity = (a, b) => {
  if (!a || !b) return false
  return idsEqual(a.id, b.id) ||
    idsEqual(a.supabaseId, b.supabaseId) ||
    idsEqual(a.supabaseId, b.id) ||
    idsEqual(a.id, b.supabaseId) ||
    userUuid(a.id) === userUuid(b.id) ||
    (a.email && b.email && normalizeEmail(a.email) === normalizeEmail(b.email))
}

function profileIdToUserIdMap(users = []) {
  const map = new Map()
  users.forEach(user => {
    if (!user?.id) return
    map.set(userUuid(user.id), user.id)
    if (user.supabaseId) map.set(user.supabaseId, user.id)
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(user.id))) {
      map.set(user.id, user.id)
    }
  })
  return map
}

async function getRemoteProfileIdsByEmail(users = []) {
  if (!isSupabaseConfigured || !supabase) return new Map()
  const emails = [...new Set(users.map(user => normalizeEmail(user?.email)).filter(Boolean))]
  if (!emails.length) return new Map()

  const { data, error } = await supabase
    .from('profiles')
    .select('id,email')
    .in('email', emails)
  logRemoteError('resolve profiles by email', error)

  return new Map((data || []).map(profile => [normalizeEmail(profile.email), profile.id]))
}

function profileFromUser(user, profileId = remoteUserId(user)) {
  const sector = resolveSetor(user.setorId || user.setor)
  return {
    id: profileId,
    name: user.nome,
    initials: user.avatar || user.nome?.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase(),
    email: user.email,
    phone: user.telefone || null,
    role: user.role || 'membro',
    position: user.cargo || null,
    sector_id: sector?.id || user.setorId || null,
    avatar_url: user.fotoPerfil || null,
    status: user.status === 'ativo' ? 'active' : user.status === 'pendente' ? 'pending' : user.status || 'active',
    updated_at: new Date().toISOString(),
  }
}

function userFromProfile(profile, currentUsers = []) {
  const localId = uuidToAppId(profile.id, NS.user)
  const existing = currentUsers.find(user =>
    (localId && idsEqual(user.id, localId)) ||
    idsEqual(user.supabaseId, profile.id) ||
    idsEqual(userUuid(user.id), profile.id) ||
    normalizeEmail(user.email) === normalizeEmail(profile.email)
  )
  const sector = resolveSetor(profile.sector_id)
  const id = localId || profile.id
  return {
    ...existing,
    id,
    supabaseId: profile.id,
    nome: profile.name,
    email: isLegacyTemporaryEmail(profile.email) ? defaultEmailFromName(profile.name) : profile.email,
    cargo: profile.position || existing?.cargo || '',
    setorId: sector?.id || profile.sector_id || existing?.setorId || null,
    setor: sector?.nome || existing?.setor || '',
    telefone: profile.phone || existing?.telefone || '',
    fotoPerfil: profile.avatar_url || existing?.fotoPerfil || null,
    avatar: profile.initials || existing?.avatar || profile.name?.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase(),
    status: profile.status === 'active' ? 'ativo' : profile.status === 'pending' ? 'pendente' : profile.status || existing?.status || 'ativo',
    role: profile.role || existing?.role || 'membro',
    senha: existing?.senha && !isLegacyTemporaryEmail(existing.email) ? existing.senha : '123456',
    dataCadastro: existing?.dataCadastro || dateOnly(profile.created_at) || new Date().toISOString().split('T')[0],
    preferenciasNotificacao: existing?.preferenciasNotificacao || {
      email: true,
      system: true,
      whatsapp: false,
      weekly_report: true,
    },
    precisaAtualizarDados: existing?.precisaAtualizarDados ?? isLegacyTemporaryEmail(profile.email),
    emailTemporario: existing?.emailTemporario ?? isLegacyTemporaryEmail(profile.email),
    precisaSincronizarFoto: Boolean(existing?.fotoPerfil && !profile.avatar_url),
    permissoes: existing?.permissoes || normalizePermissions({}, profile.role || 'membro'),
  }
}

function permissionRowsFromUser(user, profileId = remoteUserId(user)) {
  const permissions = normalizePermissions(user.permissoes, user.role)
  const rows = []
  ACCESS_MODULES.forEach(module => {
    rows.push({
      profile_id: profileId,
      module_key: module.key,
      subarea_key: MODULE_PERMISSION_KEY,
      can_access: Boolean(permissions[module.key]),
    })
    module.subareas.forEach(subarea => {
      rows.push({
        profile_id: profileId,
        module_key: module.key,
        subarea_key: subarea.key,
        can_access: Boolean(permissions.subareas?.[subarea.key]),
      })
    })
  })
  return rows
}

function applyRemotePermissions(users, permissionRows = []) {
  const byProfile = new Map()
  permissionRows.forEach(row => {
    if (!byProfile.has(row.profile_id)) byProfile.set(row.profile_id, { subareas: {} })
    const target = byProfile.get(row.profile_id)
    if (row.subarea_key && row.subarea_key !== MODULE_PERMISSION_KEY) target.subareas[row.subarea_key] = row.can_access
    else target[row.module_key] = row.can_access
  })
  return users.map(user => {
    const raw = byProfile.get(remoteUserId(user)) || byProfile.get(userUuid(user.id)) || byProfile.get(user.id)
    return raw ? { ...user, permissoes: normalizePermissions(raw, user.role) } : user
  })
}

function meetingFromRemote(row, responsibleRows = [], profileIdToUserId = new Map()) {
  const appId = uuidToAppId(row.id, NS.meeting) || row.id
  const responsibleIds = responsibleRows
    .filter(item => item.meeting_id === row.id)
    .map(item => profileIdToUserId.get(item.profile_id))
    .filter(Boolean)

  return {
    id: appId,
    empresa: row.company,
    contato: row.contact_name || '',
    titulo: row.title || '',
    data: row.meeting_date,
    horaInicio: timeOnly(row.start_time),
    horaFim: timeOnly(row.end_time),
    status: row.status || 'agendada',
    tipo: row.type || 'diagnostico',
    canal: row.channel || 'Google Meet',
    prioridade: row.priority || 'media',
    valorEstimado: Number(row.estimated_value || 0),
    pauta: row.agenda || '',
    proximoPasso: row.next_step || '',
    observacoes: row.notes || '',
    responsavelIds: responsibleIds,
    responsavelId: responsibleIds[0] || null,
  }
}

function meetingToRemote(meeting, currentUserId = null) {
  return {
    id: meetingUuid(meeting.id),
    company: meeting.empresa,
    contact_name: meeting.contato || null,
    title: meeting.titulo || null,
    meeting_date: meeting.data,
    start_time: meeting.horaInicio || null,
    end_time: meeting.horaFim || null,
    status: meeting.status || 'agendada',
    type: meeting.tipo || null,
    channel: meeting.canal || null,
    priority: meeting.prioridade || null,
    estimated_value: Number(meeting.valorEstimado || 0),
    agenda: meeting.pauta || null,
    next_step: meeting.proximoPasso || null,
    notes: meeting.observacoes || null,
    created_by: currentUserId ? userUuid(currentUserId) : null,
    updated_at: new Date().toISOString(),
  }
}

function messageToRemote(message, remoteIds = {}) {
  const isChannel = message.tipo === 'aviso_geral' || message.destinatarioId === 'avisos'
  return {
    id: messageUuid(message.id),
    sender_id: remoteIds.senderId || (message.remetenteId ? userUuid(message.remetenteId) : null),
    receiver_id: !isChannel && message.destinatarioId ? (remoteIds.receiverId || userUuid(message.destinatarioId)) : null,
    channel_id: isChannel ? message.destinatarioId : null,
    content: message.texto,
    read_by: (remoteIds.readBy || (message.lidosPor || []).map(id => userUuid(id))),
    created_at: message.timestamp || new Date().toISOString(),
  }
}

function messageFromRemote(row, profileIdToUserId = new Map()) {
  return {
    id: uuidToAppId(row.id, NS.message) || row.id,
    remetenteId: profileIdToUserId.get(row.sender_id) || row.sender_id,
    destinatarioId: row.channel_id || profileIdToUserId.get(row.receiver_id) || row.receiver_id,
    texto: row.content,
    timestamp: row.created_at,
    lida: Boolean(row.receiver_id && (row.read_by || []).includes(row.receiver_id)),
    lidosPor: (row.read_by || []).map(id => profileIdToUserId.get(id) || id).filter(Boolean),
    tipo: row.channel_id ? 'aviso_geral' : 'direta',
  }
}

function notificationToRemote(notification, profileId = null) {
  return {
    id: notificationUuid(notification.id),
    profile_id: profileId || (notification.usuarioId ? userUuid(notification.usuarioId) : null),
    type: notification.tipo || 'sistema',
    title: notification.titulo,
    description: notification.descricao || null,
    link: notification.link || null,
    is_read: Boolean(notification.lida),
    created_at: notification.timestamp || new Date().toISOString(),
  }
}

function notificationFromRemote(row, profileIdToUserId = new Map()) {
  return {
    id: uuidToAppId(row.id, NS.notification) || row.id,
    usuarioId: row.profile_id ? profileIdToUserId.get(row.profile_id) || row.profile_id : null,
    tipo: row.type || 'sistema',
    titulo: row.title,
    descricao: row.description || '',
    link: row.link || null,
    lida: Boolean(row.is_read),
    lidosPor: [],
    timestamp: row.created_at,
  }
}

const mergeById = (local = [], remote = []) => {
  const map = new Map(local.map(item => [String(item.id), item]))
  remote.forEach(item => {
    const key = String(item.id)
    map.set(key, { ...(map.get(key) || {}), ...item })
  })
  return [...map.values()]
}

const normalizeTimestamp = value => {
  const time = new Date(value || 0).getTime()
  return Number.isFinite(time) ? time : String(value || '')
}

const messageMergeKey = message => [
  message.tipo || 'direta',
  message.remetenteId || '',
  message.destinatarioId || '',
  message.texto || '',
  normalizeTimestamp(message.timestamp),
].join('|')

const mergeMessages = (local = [], remote = []) => {
  const items = []
  const indexById = new Map()
  const indexByIdentity = new Map()

  const upsert = (message, preferIncoming = false) => {
    const idKey = String(message.id)
    const identityKey = messageMergeKey(message)
    const existingIndex = indexById.has(idKey)
      ? indexById.get(idKey)
      : indexByIdentity.get(identityKey)

    if (existingIndex != null) {
      const merged = preferIncoming
        ? { ...items[existingIndex], ...message }
        : { ...message, ...items[existingIndex] }
      items[existingIndex] = merged
      indexById.set(String(merged.id), existingIndex)
      indexByIdentity.set(messageMergeKey(merged), existingIndex)
      return
    }

    const nextIndex = items.length
    items.push(message)
    indexById.set(idKey, nextIndex)
    indexByIdentity.set(identityKey, nextIndex)
  }

  local.forEach(message => upsert(message, false))
  remote.forEach(message => upsert(message, true))
  return items.sort((a, b) => normalizeTimestamp(a.timestamp) - normalizeTimestamp(b.timestamp))
}

const notificationMergeKey = notification => [
  notification.tipo || 'sistema',
  notification.usuarioId ?? 'global',
  notification.audiencia || '',
  notification.modulo || '',
  notification.titulo || '',
  notification.descricao || '',
  notification.link || '',
  normalizeTimestamp(notification.timestamp),
].join('|')

const mergeReadLists = (a = [], b = []) => [...new Set([...a, ...b].filter(Boolean))]

const mergeNotifications = (local = [], remote = []) => {
  const items = []
  const indexById = new Map()
  const indexByIdentity = new Map()

  const upsert = (notification, preferIncoming = false) => {
    const idKey = String(notification.id)
    const identityKey = notificationMergeKey(notification)
    const existingIndex = indexById.has(idKey)
      ? indexById.get(idKey)
      : indexByIdentity.get(identityKey)

    if (existingIndex != null) {
      const current = items[existingIndex]
      const merged = preferIncoming
        ? { ...current, ...notification }
        : { ...notification, ...current }

      // Preserve local read state while Supabase catches up, otherwise a pull can
      // resurrect an already-read notification as unread.
      merged.lida = Boolean(current.lida || notification.lida)
      merged.lidosPor = mergeReadLists(current.lidosPor, notification.lidosPor)

      items[existingIndex] = merged
      indexById.set(String(merged.id), existingIndex)
      indexByIdentity.set(notificationMergeKey(merged), existingIndex)
      return
    }

    const nextIndex = items.length
    items.push(notification)
    indexById.set(idKey, nextIndex)
    indexByIdentity.set(identityKey, nextIndex)
  }

  local.forEach(notification => upsert(notification, false))
  remote.forEach(notification => upsert(notification, true))
  return items.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
}

const normalizeCommercialTeamConfig = equipe => ({
  hunters: Array.isArray(equipe?.hunters) ? equipe.hunters : [],
  closers: Array.isArray(equipe?.closers) ? equipe.closers : [],
})

export async function createSupabaseAuthAccount(email, password, metadata = {}) {
  if (!isSupabaseConfigured || !supabase) return { success: false, enabled: false }
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail || !password) return { success: false, error: 'Email e senha são obrigatórios.' }

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: { data: metadata },
  })

  if (error) {
    const message = error.message || ''
    if (/already|registered|exists|exists/i.test(message)) {
      return { success: true, alreadyExists: true, user: null }
    }
    logRemoteError('create auth account', error)
    return { success: false, error: message }
  }

  // O app usa sua própria sessão de aprovação. Não deixamos o signUp trocar a
  // conta ativa do navegador quando um diretor cadastra outro membro.
  await supabase.auth.signOut()
  return { success: true, user: data?.user || null }
}

export async function signInWithSupabaseAuth(email, password) {
  if (!isSupabaseConfigured || !supabase) return { success: false, enabled: false }
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizeEmail(email),
    password,
  })
  if (error) return { success: false, error: error.message }
  return { success: true, user: data?.user || null }
}

export async function sendSupabasePasswordReset(email) {
  if (!isSupabaseConfigured || !supabase) return { success: false, enabled: false }
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const redirectTo = origin ? `${origin}/login` : undefined
  const { error } = await supabase.auth.resetPasswordForEmail(normalizeEmail(email), {
    redirectTo,
  })
  if (error) {
    logRemoteError('send password reset', error)
    return { success: false, error: error.message }
  }
  return { success: true }
}

export async function signOutFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return
  await supabase.auth.signOut().catch(() => {})
}

export async function updateSupabaseAuthPassword(newPassword) {
  if (!isSupabaseConfigured || !supabase) return { success: false, enabled: false }
  let { data: sessionData } = await supabase.auth.getSession()

  if (!sessionData?.session && typeof window !== 'undefined') {
    const code = new URLSearchParams(window.location.search).get('code')
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        logRemoteError('exchange password reset code', error)
        return { success: false, error: error.message }
      }
      const refreshed = await supabase.auth.getSession()
      sessionData = refreshed.data
    }
  }

  if (!sessionData?.session) {
    return { success: false, error: 'Link de recuperação expirado ou inválido.' }
  }
  const { data, error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) {
    logRemoteError('update auth password', error)
    return { success: false, error: error.message }
  }
  return { success: true, user: data?.user || sessionData.session.user || null }
}

export async function syncCommercialTeamConfig(equipe) {
  if (!isSupabaseConfigured || !supabase) return
  const payload = { equipe: normalizeCommercialTeamConfig(equipe), updatedAt: new Date().toISOString() }
  const { error } = await supabase
    .from('notifications')
    .upsert({
      id: notificationUuid(COMMERCIAL_CONFIG_ROW_ID),
      profile_id: null,
      type: COMMERCIAL_CONFIG_SOURCE,
      title: COMMERCIAL_CONFIG_ROW_ID,
      description: JSON.stringify(payload),
      link: null,
      is_read: true,
      created_at: payload.updatedAt,
    }, { onConflict: 'id' })
  logRemoteError('upsert commercial team config', error)
}

export async function pullCommercialTeamConfig(db) {
  if (!isSupabaseConfigured || !supabase) return null

  const { data: notificationConfig, error: notificationError } = await supabase
    .from('notifications')
    .select('description, created_at')
    .eq('id', notificationUuid(COMMERCIAL_CONFIG_ROW_ID))
    .maybeSingle()
  logRemoteError('fetch commercial team config notification', notificationError)

  let remoteEquipe = null
  if (notificationConfig?.description) {
    try {
      remoteEquipe = JSON.parse(notificationConfig.description)?.equipe || null
    } catch (error) {
      console.warn('[Supabase] Configuração comercial inválida:', error.message || error)
    }
  }

  if (!remoteEquipe) {
    const { data, error } = await supabase
      .from('comercial_dashboard_snapshots')
      .select('payload, synced_at')
      .eq('id', COMMERCIAL_CONFIG_ROW_ID)
      .maybeSingle()
    logRemoteError('fetch commercial team config snapshot fallback', error)
    remoteEquipe = data?.payload?.equipe || null
  }

  if (remoteEquipe) {
    const normalized = normalizeCommercialTeamConfig(remoteEquipe)
    db.mutate('comercial', current => ({
      ...current,
      equipe: {
        ...(current.equipe || {}),
        ...normalized,
      },
    }))
    return normalized
  }

  const localEquipe = normalizeCommercialTeamConfig(db.get('comercial')?.equipe)
  if (localEquipe.hunters.length || localEquipe.closers.length) {
    await syncCommercialTeamConfig(localEquipe)
  }
  return localEquipe
}

export async function bootstrapSupabase(db) {
  if (!isSupabaseConfigured || !supabase) return { enabled: false, reason: 'missing-env' }

  const sectorsPayload = SETORES.map(setor => ({ id: setor.id, name: setor.nome }))
  const { error: sectorError } = await supabase.from('sectors').upsert(sectorsPayload, { onConflict: 'id' })
  logRemoteError('sync sectors', sectorError)

  const { error: demoDeleteError } = await supabase
    .from('profiles')
    .delete()
    .in('email', REMOVED_DEMO_EMAILS)
  logRemoteError('delete demo profiles', demoDeleteError)

  const localUsers = db.get('usuarios')
  const { data: existingProfiles, error: existingProfilesError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1)
  logRemoteError('check existing profiles', existingProfilesError)
  if (!existingProfiles?.length) {
    await syncUsersToSupabase(localUsers)
  }

  const mergedUsers = await pullUsersFromSupabase(db)

  const profileIdToUserId = profileIdToUserIdMap(mergedUsers)
  await pullCommercialTeamConfig(db)
  await syncLocalCommunicationToSupabase(db)
  await pullCommunication(db, profileIdToUserId)
  await pullMeetings(db, profileIdToUserId)

  return { enabled: true }
}

export async function pullUsersFromSupabase(db) {
  if (!isSupabaseConfigured || !supabase) return db.get('usuarios')

  const localUsers = db.get('usuarios')
  const [{ data: profiles, error: profilesError }, { data: permissions, error: permissionsError }] = await Promise.all([
    supabase.from('profiles').select('*'),
    supabase.from('permissions').select('*'),
  ])
  logRemoteError('fetch profiles', profilesError)
  logRemoteError('fetch permissions', permissionsError)

  if (!profiles?.length) return localUsers

  const remoteUsers = profiles.map(profile => userFromProfile(profile, localUsers))
  const mergedUsers = applyRemotePermissions(remoteUsers, permissions || [])
  db.set('usuarios', mergedUsers)
  const usersNeedingRemoteUpdate = remoteUsers.filter(user =>
    user.emailTemporario ||
    user.precisaAtualizarDados ||
    user.precisaSincronizarFoto
  )
  if (usersNeedingRemoteUpdate.length) {
    await syncUsersToSupabase(usersNeedingRemoteUpdate)
  }
  return mergedUsers
}

export async function syncUsersToSupabase(users = []) {
  if (!isSupabaseConfigured || !supabase) return { success: true, enabled: false, users }
  const usersWithEmail = users.filter(user => user.email)
  const remoteIdsByEmail = await getRemoteProfileIdsByEmail(usersWithEmail)
  const usersWithRemoteIds = usersWithEmail.map(user => ({
    ...user,
    supabaseId: user.supabaseId || remoteIdsByEmail.get(normalizeEmail(user.email)) || userUuid(user.id),
  }))

  const profiles = usersWithRemoteIds.map(user => profileFromUser(user, user.supabaseId))
  if (!profiles.length) return { success: true, users: [] }

  const { error: profileError } = await supabase.from('profiles').upsert(profiles, { onConflict: 'id' })
  logRemoteError('upsert profiles', profileError)
  if (profileError) return { success: false, error: profileError.message, users: usersWithRemoteIds }

  const permissions = usersWithRemoteIds.flatMap(user => permissionRowsFromUser(user, user.supabaseId))
  if (permissions.length) {
    const { error: permissionError } = await supabase
      .from('permissions')
      .upsert(permissions, { onConflict: 'profile_id,module_key,subarea_key' })
    logRemoteError('upsert permissions', permissionError)
    if (permissionError) return { success: false, error: permissionError.message, users: usersWithRemoteIds }
  }

  return { success: true, users: usersWithRemoteIds }
}

export async function deleteUserFromSupabase(userId) {
  if (!isSupabaseConfigured || !supabase) return
  const { error } = await supabase.from('profiles').delete().eq('id', userUuid(userId))
  logRemoteError('delete profile', error)
}

export async function syncMeetingToSupabase(meeting, currentUserId = null) {
  if (!isSupabaseConfigured || !supabase || !meeting) return
  const payload = meetingToRemote(meeting, currentUserId)
  const { error } = await supabase.from('meetings').upsert(payload, { onConflict: 'id' })
  logRemoteError('upsert meeting', error)

  const meetingId = payload.id
  await supabase.from('meeting_responsibles').delete().eq('meeting_id', meetingId)
  const responsibleRows = (meeting.responsavelIds || [])
    .filter(Boolean)
    .map(profileId => ({
      meeting_id: meetingId,
      profile_id: userUuid(profileId),
    }))
  if (responsibleRows.length) {
    const { error: responsibleError } = await supabase
      .from('meeting_responsibles')
      .upsert(responsibleRows, { onConflict: 'meeting_id,profile_id' })
    logRemoteError('upsert meeting responsibles', responsibleError)
  }
}

export async function deleteMeetingFromSupabase(meetingId) {
  if (!isSupabaseConfigured || !supabase) return
  const { error } = await supabase.from('meetings').delete().eq('id', meetingUuid(meetingId))
  logRemoteError('delete meeting', error)
}

export async function syncMessageToSupabase(message, users = []) {
  if (!isSupabaseConfigured || !supabase || !message) return
  const isChannel = message.tipo === 'aviso_geral' || message.destinatarioId === 'avisos'
  const sender = findUserByAnyId(users, message.remetenteId)
  const receiver = isChannel ? null : findUserByAnyId(users, message.destinatarioId)
  const relatedUsers = [sender, receiver].filter(user => user?.email)
  const syncedUsers = relatedUsers.length ? await syncUsersToSupabase(relatedUsers) : []
  const resolveSynced = user => syncedUsers?.find(synced => sameUserIdentity(synced, user)) || user
  const senderId = sender ? remoteUserId(resolveSynced(sender)) : userUuid(message.remetenteId)
  const receiverId = !isChannel && receiver ? remoteUserId(resolveSynced(receiver)) : (!isChannel && message.destinatarioId ? userUuid(message.destinatarioId) : null)
  const readBy = (message.lidosPor || []).map(id => {
    const reader = findUserByAnyId([...(syncedUsers || []), ...users], id)
    return reader ? remoteUserId(reader) : userUuid(id)
  })

  const { error } = await supabase
    .from('chat_messages')
    .upsert(messageToRemote(message, { senderId, receiverId, readBy }), { onConflict: 'id' })
  logRemoteError('upsert message', error)
}

export async function markRemoteMessageRead(messageId, userId) {
  if (!isSupabaseConfigured || !supabase || !messageId || !userId) return
  const id = messageUuid(messageId)
  const profileId = userUuid(userId)
  const { data, error: fetchError } = await supabase
    .from('chat_messages')
    .select('read_by')
    .eq('id', id)
    .maybeSingle()
  logRemoteError('fetch message read state', fetchError)
  if (fetchError) return

  const readBy = [...new Set([...(data?.read_by || []), profileId])]
  const { error } = await supabase
    .from('chat_messages')
    .update({ read_by: readBy })
    .eq('id', id)
  logRemoteError('mark message read', error)
}

export async function syncNotificationToSupabase(notification, users = []) {
  if (!isSupabaseConfigured || !supabase || !notification) return
  const recipient = notification.usuarioId ? findUserByAnyId(users, notification.usuarioId) : null
  const syncedUsers = recipient?.email ? await syncUsersToSupabase([recipient]) : []
  const syncedRecipient = syncedUsers?.find(item => sameUserIdentity(item, recipient)) || recipient
  const profileId = syncedRecipient ? remoteUserId(syncedRecipient) : null
  const { error } = await supabase
    .from('notifications')
    .upsert(notificationToRemote(notification, profileId), { onConflict: 'id' })
  logRemoteError('upsert notification', error)
}

async function syncLocalCommunicationToSupabase(db) {
  if (!isSupabaseConfigured || !supabase) return
  const users = db.get('usuarios')
  const hasUser = id => users.some(user => findUserByAnyId([user], id))
  const communication = db.get('comunicacao')

  for (const message of communication.mensagens || []) {
    const isChannel = message.tipo === 'aviso_geral' || message.destinatarioId === 'avisos'
    if (!hasUser(message.remetenteId)) continue
    if (!isChannel && !hasUser(message.destinatarioId)) continue
    await syncMessageToSupabase(message, users)
  }
}

export async function markRemoteNotificationRead(notificationId, read = true) {
  if (!isSupabaseConfigured || !supabase) return
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: read })
    .eq('id', notificationUuid(notificationId))
  logRemoteError('mark notification read', error)
}

export async function pullCommunication(db, profileIdToUserId) {
  if (!isSupabaseConfigured || !supabase) return
  const [{ data: remoteMessages, error: messageError }, { data: remoteNotifications, error: notificationError }] = await Promise.all([
    supabase.from('chat_messages').select('*').order('created_at', { ascending: true }),
    supabase.from('notifications').select('*').order('created_at', { ascending: false }),
  ])
  logRemoteError('fetch messages', messageError)
  logRemoteError('fetch notifications', notificationError)

  db.mutate('comunicacao', current => ({
    ...current,
    mensagens: mergeMessages(current.mensagens || [], (remoteMessages || []).map(row => messageFromRemote(row, profileIdToUserId))),
    notificacoes: mergeNotifications(
      current.notificacoes || [],
      (remoteNotifications || [])
        .filter(row => row.type !== COMMERCIAL_CONFIG_SOURCE)
        .map(row => notificationFromRemote(row, profileIdToUserId)),
    ),
  }))
}

export async function pullCommunicationState(db) {
  if (!isSupabaseConfigured || !supabase) return { enabled: false, reason: 'missing-env' }
  const profileIdToUserId = profileIdToUserIdMap(db.get('usuarios'))
  await pullCommunication(db, profileIdToUserId)
  return { enabled: true }
}

export async function pullMeetings(db, profileIdToUserId) {
  if (!isSupabaseConfigured || !supabase) return
  const [{ data: meetings, error: meetingError }, { data: responsibles, error: responsibleError }] = await Promise.all([
    supabase.from('meetings').select('*').order('meeting_date', { ascending: true }),
    supabase.from('meeting_responsibles').select('*'),
  ])
  logRemoteError('fetch meetings', meetingError)
  logRemoteError('fetch meeting responsibles', responsibleError)
  if (!meetings?.length) return

  db.mutate('comercial', current => ({
    ...current,
    reunioes: mergeById(
      current.reunioes || [],
      meetings.map(row => meetingFromRemote(row, responsibles || [], profileIdToUserId)),
    ),
  }))
}

export async function pullRemoteState(db) {
  if (!isSupabaseConfigured || !supabase) return { enabled: false, reason: 'missing-env' }
  const mergedUsers = await pullUsersFromSupabase(db)
  const profileIdToUserId = profileIdToUserIdMap(mergedUsers)
  await Promise.all([
    pullCommercialTeamConfig(db),
    pullCommunication(db, profileIdToUserId),
    pullMeetings(db, profileIdToUserId),
  ])
  return { enabled: true }
}

export function subscribeToSupabaseChanges(db, onChange) {
  if (!isSupabaseConfigured || !supabase) return () => {}

  let syncTimer = null
  const scheduleSync = () => {
    window.clearTimeout(syncTimer)
    syncTimer = window.setTimeout(() => {
      Promise.resolve(onChange ? onChange() : pullRemoteState(db))
        .catch(error => console.warn('[Supabase] Falha ao atualizar dados remotos:', error.message || error))
    }, 250)
  }

  const channel = supabase
    .channel('projep-app-sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, scheduleSync)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'permissions' }, scheduleSync)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, scheduleSync)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, scheduleSync)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'meetings' }, scheduleSync)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'meeting_responsibles' }, scheduleSync)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comercial_dashboard_snapshots' }, scheduleSync)
    .subscribe()

  return () => {
    window.clearTimeout(syncTimer)
    supabase.removeChannel(channel)
  }
}
