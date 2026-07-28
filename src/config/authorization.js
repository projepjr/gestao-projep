import { hasPresidencyFullAccess, hasSubareaAccess } from './accessControl'
import db from '../data/db'

const idsEqual = (a, b) => String(a ?? '') === String(b ?? '')

function resolveLiveUser(user) {
  if (!user) return null
  return db.get('usuarios').find(item =>
    idsEqual(item.id, user.id) ||
    idsEqual(item.supabaseId, user.supabaseId) ||
    idsEqual(item.id, user.supabaseId) ||
    idsEqual(item.supabaseId, user.id) ||
    (item.email && user.email && item.email.trim().toLowerCase() === user.email.trim().toLowerCase())
  ) || user
}

export function isPresident(user) {
  return hasPresidentAuthority(user)
}

export function hasPresidencySecurityAccess(user) {
  const liveUser = resolveLiveUser(user)
  return Boolean(hasPresidencyFullAccess(liveUser) || (liveUser && hasSubareaAccess(liveUser, 'presidencia.seguranca')))
}

export function hasPresidentAuthority(user) {
  return hasPresidencyFullAccess(resolveLiveUser(user))
}

export function isPeopleDirector(user) {
  const liveUser = resolveLiveUser(user)
  return liveUser?.role === 'diretor' && liveUser?.setorId === 'gestao-pessoas'
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
