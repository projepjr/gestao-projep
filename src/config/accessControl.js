export const ACCESS_MODULES = [
  {
    key: 'presidencia',
    label: 'Presidência',
    icon: 'crown',
    path: '/presidencia',
    available: true,
    subareas: [
      { key: 'presidencia.seguranca', label: 'Segurança', path: '/presidencia/seguranca', icon: 'shield' },
    ],
  },
  {
    key: 'adminFinanceiro',
    label: 'Adm e Fin',
    icon: 'calculator',
    path: null,
    available: false,
    subareas: [],
  },
  {
    key: 'comercial',
    label: 'Comercial',
    icon: 'trending-up',
    path: '/comercial',
    available: true,
    subareas: [
      { key: 'comercial.dashboard', label: 'Dashboard', path: '/comercial', icon: 'dashboard' },
      { key: 'comercial.pipeline', label: 'Pipeline', path: '/comercial/pipeline', icon: 'kanban' },
      { key: 'comercial.calendario', label: 'Calendário', path: '/comercial/calendario', icon: 'calendar' },
      { key: 'comercial.ranking', label: 'Ranking', path: '/comercial/ranking', icon: 'trophy' },
      { key: 'comercial.contratos', label: 'Contratos', path: '/comercial/contratos', icon: 'file-text' },
      { key: 'comercial.equipe', label: 'Equipe', path: '/comercial/equipe', icon: 'users' },
    ],
  },
  {
    key: 'projetos',
    label: 'Projetos',
    icon: 'folder-kanban',
    path: '/projetos',
    available: true,
    subareas: [
      { key: 'projetos.baseConhecimento', label: 'Base de Conhecimento', path: '/projetos/base', icon: 'file-text' },
    ],
  },
  {
    key: 'marketing',
    label: 'Marketing',
    icon: 'megaphone',
    path: null,
    available: false,
    subareas: [],
  },
  {
    key: 'gestaoPessoas',
    label: 'Gestão de Pessoas',
    icon: 'users',
    path: '/gp',
    available: true,
    subareas: [
      { key: 'gestaoPessoas.dashboard', label: 'Dashboard', path: '/gp', icon: 'dashboard' },
      { key: 'gestaoPessoas.membros', label: 'Membros', path: '/gp/membros', icon: 'users' },
      { key: 'gestaoPessoas.processo', label: 'Processo Seletivo', path: '/gp/processo', icon: 'file-text' },
      { key: 'gestaoPessoas.aprovacoes', label: 'Aprovações', path: '/gp/aprovacoes', icon: 'user-check' },
    ],
  },
  {
    key: 'chat',
    label: 'Chat',
    icon: 'message-square',
    path: '/chat',
    available: true,
    subareas: [],
  },
]

export const ACCESS_MODULE_MAP = Object.fromEntries(ACCESS_MODULES.map(module => [module.key, module]))

const ROUTE_ACCESS = new Map()
ACCESS_MODULES.forEach(module => {
  if (module.path && module.subareas.length === 0) {
    ROUTE_ACCESS.set(module.path, { moduleKey: module.key, subareaKey: null })
  }
  module.subareas.forEach(subarea => {
    ROUTE_ACCESS.set(subarea.path, { moduleKey: module.key, subareaKey: subarea.key })
  })
})

export function normalizePermissions(rawPermissions = {}, role = '') {
  const raw = rawPermissions || {}
  const isPresident = role === 'presidente'
  const normalized = { subareas: {} }

  ACCESS_MODULES.forEach(module => {
    normalized[module.key] = isPresident ? true : (raw[module.key] ?? false)

    module.subareas.forEach(subarea => {
      const explicit = raw.subareas?.[subarea.key]
      normalized.subareas[subarea.key] = isPresident
        ? true
        : (typeof explicit === 'boolean' ? explicit : Boolean(normalized[module.key]))
    })
  })

  return normalized
}

export function hasModuleAccess(user, moduleKey) {
  if (!user) return false
  const permissions = normalizePermissions(user.permissoes, user.role)
  return Boolean(user.role === 'presidente' || permissions[moduleKey])
}

export function hasSubareaAccess(user, subareaKey) {
  if (!user) return false
  const moduleKey = subareaKey.split('.')[0]
  const permissions = normalizePermissions(user.permissoes, user.role)
  return Boolean(
    user.role === 'presidente' ||
    (permissions[moduleKey] && permissions.subareas[subareaKey])
  )
}

export function hasPathAccess(user, pathname) {
  if (!user) return false
  if (pathname === '/perfil') return true
  if (pathname === '/comercial/leads') return hasSubareaAccess(user, 'comercial.dashboard')
  const access = ROUTE_ACCESS.get(pathname)
  if (!access) return false
  return access.subareaKey
    ? hasSubareaAccess(user, access.subareaKey)
    : hasModuleAccess(user, access.moduleKey)
}

export function getDefaultPath(user) {
  if (!user) return '/login'

  for (const module of ACCESS_MODULES) {
    if (!module.available || !hasModuleAccess(user, module.key)) continue
    const firstSubarea = module.subareas.find(subarea => hasSubareaAccess(user, subarea.key))
    if (firstSubarea) return firstSubarea.path
    if (module.path && module.subareas.length === 0) return module.path
  }

  return '/perfil'
}

export function setModulePermission(rawPermissions, role, moduleKey, enabled) {
  const permissions = normalizePermissions(rawPermissions, role)
  permissions[moduleKey] = enabled
  ACCESS_MODULE_MAP[moduleKey]?.subareas.forEach(subarea => {
    permissions.subareas[subarea.key] = enabled
  })
  return permissions
}

export function setSubareaPermission(rawPermissions, role, subareaKey, enabled) {
  const permissions = normalizePermissions(rawPermissions, role)
  const moduleKey = subareaKey.split('.')[0]
  permissions.subareas[subareaKey] = enabled

  const module = ACCESS_MODULE_MAP[moduleKey]
  if (module) {
    permissions[moduleKey] = module.subareas.some(subarea => permissions.subareas[subarea.key])
  }

  return permissions
}
