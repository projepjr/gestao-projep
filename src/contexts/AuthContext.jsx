import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// ── Default login users ───────────────────────────────────────
const DEFAULT_USERS = [
  { id: 1, name: 'Ana Silva',     email: 'comercial@gestaoej.com',      password: '123456', role: 'comercial',  avatar: 'AS', status: 'active', department: 'Comercial',          jobTitle: 'Diretora Comercial' },
  { id: 2, name: 'Bruno Costa',   email: 'gp@gestaoej.com',             password: '123456', role: 'gp',         avatar: 'BC', status: 'active', department: 'Gestão de Pessoas',   jobTitle: 'Diretor de GP'      },
  { id: 3, name: 'Felipe Daniel', email: 'felipedaniel.wk@gmail.com',   password: '123456', role: 'presidente', avatar: 'FD', status: 'active', department: 'Diretoria',           jobTitle: 'Presidente'         },
]

const USERS_KEY  = 'ej_users_v2'
const RESET_KEY  = 'ej_reset_code'

function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || DEFAULT_USERS }
  catch { return DEFAULT_USERS }
}

function saveUsers(list) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(list)) } catch {}
}

function loadPhoto(userId) {
  try {
    const raw = localStorage.getItem(`ej_profile_${userId}`)
    return raw ? (JSON.parse(raw).photo || null) : null
  } catch { return null }
}

export function AuthProvider({ children }) {
  const [users, setUsers]     = useState(loadUsers)
  const [user,  setUser]      = useState(() => {
    try { return JSON.parse(localStorage.getItem('ej_user')) } catch { return null }
  })
  const [userPhoto, setUserPhoto] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('ej_user'))
      return u ? loadPhoto(u.id) : null
    } catch { return null }
  })

  // ── Helpers ──────────────────────────────────────────────────
  const persist = (list) => { setUsers(list); saveUsers(list) }

  // ── Auth ─────────────────────────────────────────────────────
  const login = (email, password) => {
    const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password)
    if (!found) return { success: false, error: 'Email ou senha inválidos' }
    if (found.status === 'pending')  return { success: false, status: 'pending', user: found }
    if (found.status === 'rejected') return { success: false, error: 'Cadastro reprovado pela diretoria. Contate o RH.' }
    const { password: _, ...safe } = found
    setUser(safe)
    setUserPhoto(loadPhoto(safe.id))
    localStorage.setItem('ej_user', JSON.stringify(safe))
    return { success: true, user: safe }
  }

  const logout = () => {
    setUser(null)
    setUserPhoto(null)
    localStorage.removeItem('ej_user')
  }

  // ── Registration ─────────────────────────────────────────────
  const register = ({ name, email, password, department, jobTitle }) => {
    if (users.find(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return { success: false, error: 'Este email já está cadastrado no sistema' }
    }
    const initials = name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
    const newUser = {
      id:         Date.now(),
      name:       name.trim(),
      email:      email.trim().toLowerCase(),
      password,
      role:       'comercial',
      avatar:     initials,
      status:     'pending',
      department: department || '',
      jobTitle:   jobTitle   || '',
      createdAt:  new Date().toISOString(),
    }
    persist([...users, newUser])

    // Save notification to localStorage so admins see it on next login
    const notif = {
      id: Date.now() + 1, type: 'system', read: false,
      title: 'Novo cadastro pendente',
      desc:  `${newUser.name} (${newUser.department}) aguarda aprovação`,
      time:  new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    }
    try {
      const existing = JSON.parse(localStorage.getItem('ej_notifications') || '[]')
      localStorage.setItem('ej_notifications', JSON.stringify([notif, ...(Array.isArray(existing) ? existing : [])]))
    } catch {}
    window.dispatchEvent(new CustomEvent('ej:notification', { detail: notif }))

    return { success: true, user: newUser }
  }

  // ── User management ──────────────────────────────────────────
  const getPendingUsers = () => users.filter(u => u.status === 'pending')

  const approveUser = (userId, role = 'comercial') => {
    const target = users.find(u => u.id === userId)
    const updated = users.map(u => u.id === userId ? { ...u, status: 'active', role } : u)
    persist(updated)
    return target
  }

  const rejectUser = (userId) => {
    persist(users.map(u => u.id === userId ? { ...u, status: 'rejected' } : u))
  }

  const updateCurrentUser = (data) => {
    if (!user) return
    const updated = users.map(u => u.id === user.id ? { ...u, ...data } : u)
    persist(updated)
    const newUser = { ...user, ...data }
    setUser(newUser)
    localStorage.setItem('ej_user', JSON.stringify(newUser))
  }

  const updateUserPhoto = (photo) => {
    setUserPhoto(photo)
    if (!user) return
    try {
      const key = `ej_profile_${user.id}`
      const existing = JSON.parse(localStorage.getItem(key) || '{}')
      localStorage.setItem(key, JSON.stringify({ ...existing, photo }))
    } catch {}
  }

  // ── Password reset ────────────────────────────────────────────
  const generateResetCode = (email) => {
    const exists = users.some(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.status === 'active')
    if (!exists) return { exists: false }
    const code = String(Math.floor(100000 + Math.random() * 900000))
    const expires = Date.now() + 15 * 60 * 1000
    try { localStorage.setItem(RESET_KEY, JSON.stringify({ email: email.trim().toLowerCase(), code, expires })) } catch {}
    return { exists: true, code }
  }

  const verifyResetCode = (email, code) => {
    try {
      const raw = localStorage.getItem(RESET_KEY)
      if (!raw) return false
      const data = JSON.parse(raw)
      return data.email === email.trim().toLowerCase() && data.code === String(code) && Date.now() < data.expires
    } catch { return false }
  }

  const resetPassword = (email, newPassword) => {
    persist(users.map(u => u.email.toLowerCase() === email.trim().toLowerCase() ? { ...u, password: newPassword } : u))
    try { localStorage.removeItem(RESET_KEY) } catch {}
  }

  return (
    <AuthContext.Provider value={{
      user, users, userPhoto,
      login, logout,
      register,
      getPendingUsers, approveUser, rejectUser,
      updateCurrentUser, updateUserPhoto,
      generateResetCode, verifyResetCode, resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
