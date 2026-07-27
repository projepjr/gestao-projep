import { hasPresidencyFullAccess, hasSubareaAccess } from './accessControl'

export function isPresident(user) {
  return user?.role === 'presidente'
}

export function hasPresidencySecurityAccess(user) {
  return Boolean(hasPresidencyFullAccess(user) || (user && hasSubareaAccess(user, 'presidencia.seguranca')))
}

export function hasPresidentAuthority(user) {
  return hasPresidencyFullAccess(user)
}

export function isPeopleDirector(user) {
  return user?.role === 'diretor' && user?.setorId === 'gestao-pessoas'
}

export function canApproveUsers(user) {
  return Boolean(hasPresidentAuthority(user) || (
    user?.role === 'diretor' && hasSubareaAccess(user, 'gestaoPessoas.aprovacoes')
  ))
}

export function canManageMembers(user) {
  return Boolean(hasPresidentAuthority(user) || isPeopleDirector(user))
}

export function canSendFeedback(user) {
  return Boolean(hasPresidentAuthority(user) || (
    user?.setorId === 'gestao-pessoas' && hasSubareaAccess(user, 'gestaoPessoas.membros')
  ))
}

export function canDeleteMember(actor, target) {
  if (!actor || !target || actor.id === target.id) return false
  if (hasPresidentAuthority(actor)) return target.role !== 'presidente'
  if (!isPeopleDirector(actor)) return false
  return target.role !== 'presidente' && target.role !== 'diretor'
}

export function canManagePermissions(user) {
  return hasPresidentAuthority(user)
}

export function canPostAnnouncements(user) {
  return hasPresidentAuthority(user) || user?.role === 'diretor'
}
