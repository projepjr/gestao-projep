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
  deleteUserFromSupabase,
  pullUsersFromSupabase,
  syncNotificationToSupabase,
  syncUsersToSupabase,
} from '../services/supabaseBridge'

const AuthContext = createContext(null)
const RESET_KEY = 'ej_reset_code'
const idsEqual = (a, b) => String(a ?? '') === String(b ?? '')

function safeUser(user) {
  if (!user) return null
  const safe = { ...user }
  delete safe.senha
  return safe
}

function readSession() {
  try {
    const session = JSON.parse(localStorage.getItem('ej_user'))
    if (!session?.id) return null
    const current = db.get('usuarios').find(item => sameUserIdentity(item, session))
    if (!current || current.status !== 'ativo') return null
    const safe = safeUser(current)
    localStorage.setItem('ej_user', JSON.stringify(safe))
    return safe
  } catch {
    return null
  }
}

function matchesEmail(user, email) {
  const normalized = email.trim().toLowerCase()
  return user.email?.toLowerCase() === normalized ||
    (user.emailAliases || []).some(alias => alias.toLowerCase() === normalized)
}

function sameUserIdentity(a, b) {
  if (!a || !b) return false
  return idsEqual(a.id, b.id) ||
    (a.email && b.email && a.email.toLowerCase() === b.email.toLowerCase())
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
      const fresh = nextUsers.find(item => sameUserIdentity(item, current))
      if (!fresh || fresh.status !== 'ativo') {
        localStorage.removeItem('ej_user')
        return null
      }
      const safe = safeUser(fresh)
      localStorage.setItem('ej_user', JSON.stringify(safe))
      return safe
    })
  }), [])

  const persistUsers = nextUsers => db.set('usuarios', nextUsers)
  const syncUserById = userId => {
    const target = db.get('usuarios').find(item => idsEqual(item.id, userId))
    if (target) void syncUsersToSupabase([target])
  }

  const login = async (email, password) => {
    let currentUsers = db.get('usuarios')
    try {
      currentUsers = await pullUsersFromSupabase(db)
    } catch (error) {
      console.warn('[Supabase] Nao foi possivel sincronizar usuarios antes do login:', error.message || error)
    }
    const found = validateLogin(currentUsers, email, password)

    if (!found) return { success: false, error: 'Email ou senha invalidos' }
    if (found.status === 'pendente') return { success: false, status: 'pendente', user: found }
    if (found.status === 'rejeitado') return { success: false, error: 'Cadastro reprovado pela diretoria. Contate o RH.' }
    if (found.status !== 'ativo') return { success: false, error: 'Conta inativa. Contate o administrador.' }

    const safe = safeUser(found)
    setUser(safe)
    localStorage.setItem('ej_user', JSON.stringify(safe))
    return { success: true, user: safe }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('ej_user')
  }

  const register = ({ name, email, password, department, jobTitle }) => {
    let currentUsers = db.get('usuarios')
    const existing = currentUsers.find(item => matchesEmail(item, email))
    if (existing && existing.status !== 'rejeitado') {
      return { success: false, error: 'Este email já está cadastrado no sistema' }
    }
    if (existing?.status === 'rejeitado') {
      db.removeUser(existing.id)
      currentUsers = db.get('usuarios')
    }

    const initials = name.trim().split(/\s+/).map(word => word[0]).join('').slice(0, 2).toUpperCase()
    const setor = resolveSetor(department)
    const newUser = {
      id: db.createId(),
      nome: name.trim(),
      email: email.trim().toLowerCase(),
      senha: password,
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

    persistUsers([...currentUsers, newUser])
    void syncUsersToSupabase([newUser])

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

  const approveUser = (userId, permissionChanges = {}, role = null) => {
    if (!canApproveUsers(user)) {
      return { success: false, error: 'Você não tem permissão para aprovar usuários.' }
    }
    if (role === 'presidente' && user.role !== 'presidente') {
      return { success: false, error: 'Somente o presidente pode conceder esse cargo.' }
    }

    let approved = null
    const updated = db.get('usuarios').map(item => {
      if (!idsEqual(item.id, userId)) return item
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
    persistUsers(updated)
    void syncUsersToSupabase([approved])
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
    db.update('usuarios', null, userId, { status: 'rejeitado' })
    syncUserById(userId)
    return { success: true }
  }

  const updateUserPermissoes = (userId, permissions) => {
    if (!canManagePermissions(user)) {
      return { success: false, error: 'Somente a presidência pode alterar permissões.' }
    }
    const target = db.get('usuarios').find(item => idsEqual(item.id, userId))
    if (!target) return { success: false, error: 'Usuário não encontrado.' }
    db.update('usuarios', null, userId, {
      permissoes: normalizePermissions(permissions, target.role),
    })
    syncUserById(userId)
    return { success: true }
  }

  const deleteUser = userId => {
    const target = db.get('usuarios').find(item => idsEqual(item.id, userId))
    if (!canDeleteMember(user, target)) {
      return { success: false, error: 'Você não pode remover este membro.' }
    }
    db.removeUser(userId)
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

  const generateResetCode = email => {
    const exists = db.get('usuarios').some(item => matchesEmail(item, email) && item.status === 'ativo')
    if (!exists) return { exists: false }

    const code = String(Math.floor(100000 + Math.random() * 900000))
    const expires = Date.now() + 15 * 60 * 1000
    localStorage.setItem(RESET_KEY, JSON.stringify({
      email: email.trim().toLowerCase(),
      code,
      expires,
    }))
    return { exists: true, code }
  }

  const verifyResetCode = (email, code) => {
    try {
      const data = JSON.parse(localStorage.getItem(RESET_KEY))
      return Boolean(
        data &&
        data.email === email.trim().toLowerCase() &&
        data.code === String(code) &&
        Date.now() < data.expires
      )
    } catch {
      return false
    }
  }

  const resetPassword = (email, newPassword) => {
    const target = db.get('usuarios').find(item => matchesEmail(item, email))
    if (!target) return { success: false, error: 'Não foi possível redefinir a senha.' }
    if (newPassword.length < 6) return { success: false, error: 'A nova senha deve ter pelo menos 6 caracteres.' }
    db.update('usuarios', null, target.id, { senha: newPassword })
    localStorage.removeItem(RESET_KEY)
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
      generateResetCode,
      verifyResetCode,
      resetPassword,
      changePassword,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
