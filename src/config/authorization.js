import { hasSubareaAccess } from './accessControl'

export function isPresident(user) {
  return user?.role === 'presidente'
}

export function hasPresidencySecurityAccess(user) {
  return Boolean(user && hasSubareaAccess(user, 'presidencia.seguranca'))
}

export function isPeopleDirector(user) {
  return user?.role === 'diretor' && user?.setorId === 'gestao-pessoas'
}

export function canApproveUsers(user) {
  return Boolean(isPresident(user) || hasPresidencySecurityAccess(user) || (
    user?.role === 'diretor' && hasSubareaAccess(user, 'gestaoPessoas.aprovacoes')
  ))
}

export function canManageMembers(user) {
  return Boolean(isPresident(user) || isPeopleDirector(user))
}

export function canSendFeedback(user) {
  return Boolean(isPresident(user) || (
    user?.setorId === 'gestao-pessoas' && hasSubareaAccess(user, 'gestaoPessoas.membros')
  ))
}

export function canDeleteMember(actor, target) {
  if (!actor || !target || actor.id === target.id) return false
  if (isPresident(actor)) return target.role !== 'presidente'
  if (!isPeopleDirector(actor)) return false
  return target.role !== 'presidente' && target.role !== 'diretor'
}

export function canManagePermissions(user) {
  return Boolean(isPresident(user) || hasPresidencySecurityAccess(user))
}

export function canPostAnnouncements(user) {
  return user?.role === 'presidente' || user?.role === 'diretor'
}
