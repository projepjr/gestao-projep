import { createContext, useContext, useEffect, useState } from 'react'
import db from '../data/db'
import { normalizePermissions } from '../config/accessControl'
import { resolveSetor } from '../data/setores'
import {
  canApproveUsers,
  canDeleteMember,
  canManagePermissions,
} from '../config/authorization'
import {
  createSupabaseAuthAccount,
  deleteUserFromSupabase,
  pullUsersFromSupabase,
  sendSupabasePasswordReset,
  signInWithSupabaseAuth,
  signOutFromSupabase,
  syncCommercialTeamConfig,
  syncNotificationToSupabase,
  syncUsersToSupabase,
  updateSupabaseAuthPassword,
} from '../services/supabaseBridge'

const AuthContext = createContext(null)
const SESSION_KEY = 'ej_user'
const idsEqual = (a, b) => String(a ?? '') === String(b ?? '')
const normalizeEmail = email => `${email || ''}`.trim().toLowerCase()
const appIdToUuid = id => {
  const raw = `${id || ''}`
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw)) return raw
  let hex = ''
  for (const char of raw) hex += char.charCodeAt(0).toString(16).padStart(2, '0')
  hex = hex.slice(-12).padStart(12, '0')
  return `00000000-0000-4000-8001-${hex}`
}

function sessionKeyFor(user) {
  if (!user) return null
  if (user.supabaseId) return `supabase:${user.supabaseId}`
  if (user.email) return `email:${normalizeEmail(user.email)}`
  if (user.id != null) return `id:${user.id}`
  return null
}

function safeUser(user) {
  if (!user) return null
  const safe = { ...user }
  delete safe.senha
  safe._sessionKey = sessionKeyFor(user)
  return safe
}

function findSessionUser(users, session) {
  if (!session) return null
  const storedKey = session._sessionKey || session.sessionKey
  if (storedKey) {
    return users.find(item => sessionKeyFor(item) === storedKey) || null
  }
  if (session.supabaseId) return users.find(item => idsEqual(item.supabaseId, session.supabaseId)) || null
  if (session.email) return users.find(item => normalizeEmail(item.email) === normalizeEmail(session.email)) || null
  if (session.id != null) return users.find(item => idsEqual(item.id, session.id)) || null
  return null
}

function persistSession(user) {
  const safe = safeUser(user)
  if (!safe) {
    sessionStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(SESSION_KEY)
    return null
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(safe))
  localStorage.removeItem(SESSION_KEY)
  return safe
}

function readSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY)
    const session = raw ? JSON.parse(raw) : null
    if (!session?.id) return null
    const current = findSessionUser(db.get('usuarios'), session)
    if (!current || current.status !== 'ativo') return null
    return persistSession(current)
  } catch {
    return null
  }
}

function matchesEmail(user, email) {
  const normalized = normalizeEmail(email)
  return normalizeEmail(user.email) === normalized ||
    (user.emailAliases || []).some(alias => normalizeEmail(alias) === normalized)
}

function sameUserIdentity(a, b) {
  if (!a || !b) return false
  return idsEqual(a.id, b.id) ||
    idsEqual(a.supabaseId, b.supabaseId) ||
    idsEqual(a.supabaseId, b.id) ||
    idsEqual(a.id, b.supabaseId) ||
    appIdToUuid(a.id) === appIdToUuid(b.id) ||
    (a.email && b.email && normalizeEmail(a.email) === normalizeEmail(b.email))
}

function findUserByIdentity(users, identity) {
  return users.find(item =>
    sameUserIdentity(item, identity) ||
    idsEqual(item.id, identity) ||
    idsEqual(item.supabaseId, identity)
  )
}

function validateLogin(currentUsers, email, password) {
  return currentUsers.find(item => matchesEmail(item, email) && item.senha === password)
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => db.get('usuarios').map(safeUser))
  const [user, setUser] = useState(readSession)

  useEffect(() => db.subscribe('usuarios', nextUsers => {
    setUsers(nextUsers.map(safeUser))
    setUser(current => {
      if (!current) return null
      const fresh = findSessionUser(nextUsers, current)
      if (!fresh || fresh.status !== 'ativo') {
        sessionStorage.removeItem(SESSION_KEY)
        localStorage.removeItem(SESSION_KEY)
        return null
      }
      return persistSession(fresh)
    })
  }), [])

  const persistUsers = nextUsers => db.set('usuarios', nextUsers)
  const syncUserById = userId => {
    const target = findUserByIdentity(db.get('usuarios'), userId)
    if (target) void syncUsersToSupabase([target])
  }

  const login = async (email, password) => {
    const normalizedEmail = normalizeEmail(email)
    let currentUsers = db.get('usuarios')
    try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
      currentUsers = await Promise.race([pullUsersFromSupabase(db), timeout])
    } catch (error) {
      console.warn('[Supabase] Nao foi possivel sincronizar usuarios antes do login:', error.message || error)
    }

    let found = null
    const localMatch = validateLogin(currentUsers, normalizedEmail, password)
    const remoteLogin = await signInWithSupabaseAuth(normalizedEmail, password)
    if (remoteLogin.success) {
      try {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
        currentUsers = await Promise.race([pullUsersFromSupabase(db), timeout])
      } catch (error) {
        console.warn('[Supabase] Nao foi possivel atualizar usuarios apos login:', error.message || error)
      }

      found = currentUsers.find(item =>
        idsEqual(item.supabaseId, remoteLogin.user?.id) ||
        normalizeEmail(item.email) === normalizedEmail ||
        (item.emailAliases || []).some(alias => normalizeEmail(alias) === normalizedEmail)
      )
    }

    if (!found && remoteLogin.enabled === false) {
      found = localMatch
    }

    if (!found && remoteLogin.enabled !== false && localMatch) {
      const migration = await createSupabaseAuthAccount(normalizedEmail, password, {
        name: localMatch.nome,
        status: localMatch.status === 'ativo' ? 'active' : localMatch.status,
        source: 'projep-legacy-login-migration',
      })
      if (migration.success && migration.user?.id) {
        const migrated = {
          ...localMatch,
          supabaseId: migration.user.id,
          senha: null,
        }
        const syncResult = await syncUsersToSupabase([migrated])
        if (syncResult?.success !== false) {
          db.update('usuarios', null, localMatch.id, {
            supabaseId: migrated.supabaseId,
            senha: null,
          })
          found = migrated
        }
      }
    }

    if (!found) return { success: false, error: 'Email ou senha invalidos' }
    if (found.status === 'pendente') return { success: false, status: 'pendente', user: found }
    if (found.status === 'rejeitado') return { success: false, error: 'Cadastro reprovado pela diretoria. Contate o RH.' }
    if (found.status !== 'ativo') return { success: false, error: 'Conta inativa. Contate o administrador.' }

    const safe = persistSession(found)
    setUser(safe)
    return { success: true, user: safe }
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(SESSION_KEY)
    void signOutFromSupabase()
  }

  const register = async ({ name, email, password, department, jobTitle }) => {
    let currentUsers = db.get('usuarios')
    const normalizedEmail = normalizeEmail(email)
    const existing = currentUsers.find(item => matchesEmail(item, normalizedEmail))
    if (existing && existing.status !== 'rejeitado') {
      return { success: false, error: 'Este email já está cadastrado no sistema' }
    }
    if (existing?.status === 'rejeitado') {
      db.removeUser(existing.id)
      currentUsers = db.get('usuarios')
    }

    const initials = name.trim().split(/\s+/).map(word => word[0]).join('').slice(0, 2).toUpperCase()
    const setor = resolveSetor(department)
    const authResult = await createSupabaseAuthAccount(normalizedEmail, password, {
      name: name.trim(),
      status: 'pending',
      source: 'projep-register',
    })
    if (authResult.success === false && authResult.enabled !== false) {
      return {
        success: false,
        error: `Não foi possível criar suas credenciais de acesso: ${authResult.error || 'erro desconhecido'}`,
      }
    }
    const newUser = {
      id: db.createId(),
      supabaseId: authResult.user?.id || undefined,
      nome: name.trim(),
      email: normalizedEmail,
      senha: authResult.enabled === false ? password : null,
      cargo: jobTitle || '',
      setorId: setor?.id || null,
      setor: setor?.nome || department || '',
      dataCadastro: new Date().toISOString().split('T')[0],
      fotoPerfil: null,
      telefone: '',
      avatar: initials,
      skills: [],
      performance: 0,
      projects: 0,
      status: 'pendente',
      role: 'membro',
      preferenciasNotificacao: {
        email: true,
        system: true,
        whatsapp: false,
        weekly_report: true,
      },
      permissoes: normalizePermissions({ chat: false }, 'membro'),
    }

    const syncResult = await syncUsersToSupabase([newUser])
    if (syncResult?.success === false) {
      return {
        success: false,
        error: `Nao foi possivel salvar seu perfil no banco: ${syncResult.error || 'erro desconhecido'}`,
      }
    }

    persistUsers([...currentUsers, newUser])

    const comunicacao = db.get('comunicacao')
    const notification = {
      id: db.createId(),
      usuarioId: null,
      audiencia: 'diretoria',
      titulo: 'Novo cadastro pendente',
      descricao: `${newUser.nome} (${newUser.setor}) aguarda aprovação`,
      timestamp: new Date().toISOString(),
      lida: false,
      lidosPor: [],
      tipo: 'sistema',
      link: '/gp/aprovacoes',
    }
    db.set('comunicacao', {
      ...comunicacao,
      notificacoes: [notification, ...(comunicacao.notificacoes || [])],
    })
    void syncNotificationToSupabase(notification)

    return { success: true, user: newUser }
  }

  const getPendingUsers = () => users.filter(item => item.status === 'pendente')

  const approveUser = async (userId, permissionChanges = {}, role = null) => {
    if (!canApproveUsers(user)) {
      return { success: false, error: 'Você não tem permissão para aprovar usuários.' }
    }
    if (role === 'presidente' && user.role !== 'presidente') {
      return { success: false, error: 'Somente o presidente pode conceder esse cargo.' }
    }

    let approved = null
    const updated = db.get('usuarios').map(item => {
      if (!sameUserIdentity(item, { id: userId, supabaseId: userId })) return item
      const nextRole = role || item.role || 'membro'
      approved = {
        ...item,
        role: nextRole,
        status: 'ativo',
        permissoes: normalizePermissions(permissionChanges, nextRole),
      }
      return approved
    })
    if (!approved) return { success: false, error: 'Usuário não encontrado.' }
    const syncResult = await syncUsersToSupabase([approved])
    if (syncResult?.success === false) {
      return {
        success: false,
        error: `Nao foi possivel salvar a aprovacao no Supabase: ${syncResult.error || 'erro desconhecido'}`,
      }
    }
    persistUsers(updated)
    db.mutate('comunicacao', current => ({
      ...current,
      notificacoes: [{
        id: db.createId(),
        usuarioId: userId,
        titulo: 'Cadastro aprovado',
        descricao: 'Seu acesso à plataforma foi aprovado pela diretoria.',
        timestamp: new Date().toISOString(),
        lida: false,
        lidosPor: [],
        tipo: 'sistema',
        link: '/perfil',
      }, ...(current.notificacoes || [])],
    }))
    return { success: true, user: safeUser(approved) }
  }

  const rejectUser = userId => {
    if (!canApproveUsers(user)) {
      return { success: false, error: 'Você não tem permissão para reprovar usuários.' }
    }
    const target = findUserByIdentity(db.get('usuarios'), userId)
    if (!target) return { success: false, error: 'Usuário não encontrado.' }
    db.update('usuarios', null, target.id, { status: 'rejeitado' })
    syncUserById(target.id)
    return { success: true }
  }

  const updateUserPermissoes = (userId, permissions) => {
    if (!canManagePermissions(user)) {
      return { success: false, error: 'Somente a presidência pode alterar permissões.' }
    }
    const target = findUserByIdentity(db.get('usuarios'), userId)
    if (!target) return { success: false, error: 'Usuário não encontrado.' }
    db.update('usuarios', null, target.id, {
      permissoes: normalizePermissions(permissions, target.role),
    })
    syncUserById(target.id)
    return { success: true }
  }

  const deleteUser = userId => {
    const target = findUserByIdentity(db.get('usuarios'), userId)
    if (!canDeleteMember(user, target)) {
      return { success: false, error: 'Você não pode remover este membro.' }
    }
    db.removeUser(userId)
    void syncCommercialTeamConfig(db.get('comercial')?.equipe)
    void deleteUserFromSupabase(userId)
    return { success: true }
  }

  const updateCurrentUser = data => {
    if (!user) return { success: false, error: 'Usuário não autenticado.' }
    const allowedFields = new Set([
      'nome', 'email', 'telefone', 'fotoPerfil', 'preferenciasNotificacao',
      'precisaAtualizarDados', 'emailTemporario',
    ])
    const sanitized = Object.fromEntries(
      Object.entries(data).filter(([key]) => allowedFields.has(key))
    )

    if (typeof sanitized.nome === 'string') {
      sanitized.nome = sanitized.nome.trim()
      if (sanitized.nome.length < 3) return { success: false, error: 'Informe um nome válido.' }
      sanitized.avatar = sanitized.nome.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()
    }
    if (typeof sanitized.email === 'string') {
      sanitized.email = sanitized.email.trim().toLowerCase()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized.email)) {
        return { success: false, error: 'Informe um email válido.' }
      }
      const duplicate = db.get('usuarios').some(item => !idsEqual(item.id, user.id) && matchesEmail(item, sanitized.email))
      if (duplicate) return { success: false, error: 'Este email já está sendo usado por outro membro.' }
    }
    if (typeof sanitized.telefone === 'string') sanitized.telefone = sanitized.telefone.trim()

    db.update('usuarios', null, user.id, sanitized)
    syncUserById(user.id)
    return { success: true }
  }

  const updateUserPhoto = photo => {
    return updateCurrentUser({ fotoPerfil: photo })
  }

  const requestPasswordReset = async email => {
    const normalizedEmail = normalizeEmail(email)
    const result = await sendSupabasePasswordReset(normalizedEmail)
    if (result.enabled === false) {
      return { success: false, error: 'Recuperação de senha requer Supabase configurado.' }
    }
    if (!result.success) {
      return { success: false, error: result.error || 'Não foi possível enviar o email de recuperação.' }
    }
    return { success: true }
  }

  const confirmPasswordReset = async newPassword => {
    if (newPassword.length < 6) return { success: false, error: 'A nova senha deve ter pelo menos 6 caracteres.' }
    const result = await updateSupabaseAuthPassword(newPassword)
    if (!result.success) return result

    const email = normalizeEmail(result.user?.email)
    const target = db.get('usuarios').find(item => matchesEmail(item, email))
    if (target) {
      db.update('usuarios', null, target.id, { senha: null })
      syncUserById(target.id)
    }
    return { success: true }
  }

  const changePassword = (currentPassword, newPassword) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' }
    const stored = db.get('usuarios').find(item => idsEqual(item.id, user.id))
    if (!stored || stored.senha !== currentPassword) {
      return { success: false, error: 'Senha atual incorreta' }
    }
    if (newPassword.length < 6) return { success: false, error: 'A nova senha deve ter pelo menos 6 caracteres.' }
    if (newPassword === currentPassword) return { success: false, error: 'A nova senha deve ser diferente da senha atual.' }
    db.update('usuarios', null, user.id, { senha: newPassword })
    return { success: true }
  }

  return (
    <AuthContext.Provider value={{
      user,
      users,
      userPhoto: user?.fotoPerfil || null,
      login,
      logout,
      register,
      getPendingUsers,
      approveUser,
      rejectUser,
      updateCurrentUser,
      updateUserPhoto,
      updateUserPermissoes,
      deleteUser,
      requestPasswordReset,
      confirmPasswordReset,
      changePassword,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
