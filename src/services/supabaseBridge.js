import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { ACCESS_MODULES, normalizePermissions } from '../config/accessControl'
import { SETORES, resolveSetor } from '../data/setores'

const NS = {
  user: '8001',
  meeting: '8002',
  message: '8003',
  notification: '8004',
}
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

  const numeric = Number.parseInt(hex, 16)
  return Number.isFinite(numeric) ? String(numeric) : null
}

const dateOnly = value => value ? String(value).split('T')[0] : null
const timeOnly = value => value ? String(value).slice(0, 5) : null
const idsEqual = (a, b) => String(a ?? '') === String(b ?? '')

const logRemoteError = (action, error) => {
  if (error) console.warn(`[Supabase] ${action}:`, error.message || error)
}

const userUuid = userId => appIdToUuid(userId, NS.user)
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

function profileFromUser(user) {
  const sector = resolveSetor(user.setorId || user.setor)
  return {
    id: userUuid(user.id),
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
    idsEqual(userUuid(user.id), profile.id) ||
    user.email?.toLowerCase() === profile.email?.toLowerCase()
  )
  const sector = resolveSetor(profile.sector_id)
  const id = localId || profile.id
  return {
    ...existing,
    id,
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

const sameUserIdentity = (a, b) => {
  if (!a || !b) return false
  return idsEqual(a.id, b.id) ||
    userUuid(a.id) === userUuid(b.id) ||
    (a.email && b.email && a.email.toLowerCase() === b.email.toLowerCase())
}

function permissionRowsFromUser(user) {
  const permissions = normalizePermissions(user.permissoes, user.role)
  const rows = []
  ACCESS_MODULES.forEach(module => {
    rows.push({
      profile_id: userUuid(user.id),
      module_key: module.key,
      subarea_key: MODULE_PERMISSION_KEY,
      can_access: Boolean(permissions[module.key]),
    })
    module.subareas.forEach(subarea => {
      rows.push({
        profile_id: userUuid(user.id),
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
    const raw = byProfile.get(userUuid(user.id))
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

function messageToRemote(message) {
  const isChannel = message.tipo === 'aviso_geral' || message.destinatarioId === 'avisos'
  return {
    id: messageUuid(message.id),
    sender_id: message.remetenteId ? userUuid(message.remetenteId) : null,
    receiver_id: !isChannel && message.destinatarioId ? userUuid(message.destinatarioId) : null,
    channel_id: isChannel ? message.destinatarioId : null,
    content: message.texto,
    read_by: (message.lidosPor || []).map(id => userUuid(id)),
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
    lidosPor: (row.read_by || []).map(id => profileIdToUserId.get(id)).filter(Boolean),
    tipo: row.channel_id ? 'aviso_geral' : 'direta',
  }
}

function notificationToRemote(notification) {
  return {
    id: notificationUuid(notification.id),
    profile_id: notification.usuarioId ? userUuid(notification.usuarioId) : null,
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

  const profileIdToUserId = new Map(mergedUsers.map(user => [userUuid(user.id), user.id]))
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
  const missingLocalUsers = localUsers.filter(localUser =>
    localUser.email &&
    !remoteUsers.some(remoteUser => sameUserIdentity(localUser, remoteUser))
  )
  const mergedUsers = applyRemotePermissions([...remoteUsers, ...missingLocalUsers], permissions || [])
  db.set('usuarios', mergedUsers)
  const usersNeedingRemoteUpdate = remoteUsers.filter(user =>
    user.emailTemporario ||
    user.precisaAtualizarDados ||
    user.precisaSincronizarFoto
  )
  if (missingLocalUsers.length || usersNeedingRemoteUpdate.length) {
    await syncUsersToSupabase([...missingLocalUsers, ...usersNeedingRemoteUpdate])
  }
  return mergedUsers
}

export async function syncUsersToSupabase(users = []) {
  if (!isSupabaseConfigured || !supabase) return
  const profiles = users.filter(user => user.email).map(profileFromUser)
  if (!profiles.length) return

  const { error: profileError } = await supabase.from('profiles').upsert(profiles, { onConflict: 'id' })
  logRemoteError('upsert profiles', profileError)

  const permissions = users.flatMap(permissionRowsFromUser)
  if (permissions.length) {
    const { error: permissionError } = await supabase
      .from('permissions')
      .upsert(permissions, { onConflict: 'profile_id,module_key,subarea_key' })
    logRemoteError('upsert permissions', permissionError)
  }
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
  const relatedUsers = users.filter(user =>
    user?.email &&
    (
      userUuid(user.id) === userUuid(message.remetenteId) ||
      userUuid(user.id) === userUuid(message.destinatarioId)
    )
  )
  if (relatedUsers.length) await syncUsersToSupabase(relatedUsers)
  const { error } = await supabase.from('chat_messages').upsert(messageToRemote(message), { onConflict: 'id' })
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

export async function syncNotificationToSupabase(notification) {
  if (!isSupabaseConfigured || !supabase || !notification) return
  const { error } = await supabase.from('notifications').upsert(notificationToRemote(notification), { onConflict: 'id' })
  logRemoteError('upsert notification', error)
}

async function syncLocalCommunicationToSupabase(db) {
  if (!isSupabaseConfigured || !supabase) return
  const users = db.get('usuarios')
  const hasUser = id => users.some(user => idsEqual(user.id, id))
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
    mensagens: mergeById(current.mensagens || [], (remoteMessages || []).map(row => messageFromRemote(row, profileIdToUserId))),
    notificacoes: mergeById(current.notificacoes || [], (remoteNotifications || []).map(row => notificationFromRemote(row, profileIdToUserId))),
  }))
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
  const profileIdToUserId = new Map(mergedUsers.map(user => [userUuid(user.id), user.id]))
  await Promise.all([
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
    .subscribe()

  return () => {
    window.clearTimeout(syncTimer)
    supabase.removeChannel(channel)
  }
}
