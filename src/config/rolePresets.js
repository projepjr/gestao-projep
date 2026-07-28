import { ACCESS_MODULES } from './accessControl'
import { hasPresidentAuthority } from './authorization'

const SECTOR_MODULES = [
  { value: 'presidencia', key: 'presidencia', label: 'Presidência', role: 'presidente', presidentOnly: true },
  { value: 'admin-financeiro', key: 'adminFinanceiro', label: 'Adm e Fin', role: 'membro' },
  { value: 'comercial', key: 'comercial', label: 'Comercial', role: 'membro' },
  { value: 'projetos', key: 'projetos', label: 'Projetos', role: 'membro' },
  { value: 'marketing', key: 'marketing', label: 'Marketing', role: 'membro' },
  { value: 'gestao-pessoas', key: 'gestaoPessoas', label: 'Gestão de Pessoas', role: 'membro' },
]

const subareasFor = moduleKey => Object.fromEntries(
  ACCESS_MODULES
    .find(module => module.key === moduleKey)
    ?.subareas
    .map(subarea => [subarea.key, true]) || []
)

const sectorPermissions = moduleKey => ({
  [moduleKey]: true,
  subareas: subareasFor(moduleKey),
})

export const ROLE_PRESETS = [
  {
    value: 'sem-acesso',
    label: 'Sem acesso',
    role: 'membro',
    permissions: {},
  },
  ...SECTOR_MODULES.map(sector => ({
    value: sector.value,
    label: sector.label,
    role: sector.role,
    permissions: sectorPermissions(sector.key),
    presidentOnly: sector.presidentOnly || false,
  })),
]

export function getAvailableRolePresets(user) {
  const canGrantPresidency = hasPresidentAuthority(user)
  return ROLE_PRESETS.filter(preset => !preset.presidentOnly || canGrantPresidency)
}

export function getSuggestedRolePreset(approver, pendingUser) {
  const options = getAvailableRolePresets(approver)
  return options.find(option => option.value === 'sem-acesso') || options[0] || null
}
