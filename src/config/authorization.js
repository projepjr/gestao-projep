import { hasPresidencyFullAccess, hasSubareaAccess } from './accessControl'
import db from '../data/db'

const idsEqual = (a, b) => String(a ?? '') === String(b ?? '')

export function resolveAuthorizedUser(user) {
  if (!user) return null
  return db.get('usuarios').find(item =>
    idsEqual(item.id, user.id) ||
    idsEqual(item.supabaseId, user.supabaseId) ||
    idsEqual(item.id, user.supabaseId) ||
    idsEqual(item.supabaseId, user.id) ||
    (item.email && user.email && item.email.trim().toLowerCase() === user.email.trim().toLowerCase())
  ) || user
}

const resolveLiveUser = resolveAuthorizedUser

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
  const liveUser = resolveLiveUser(user)
  return Boolean(hasPresidencyFullAccess(liveUser) || (
    liveUser?.role === 'diretor' && hasSubareaAccess(liveUser, 'gestaoPessoas.aprovacoes')
  ))
}

export function canManageMembers(user) {
  const liveUser = resolveLiveUser(user)
  return Boolean(hasPresidencyFullAccess(liveUser) || isPeopleDirector(liveUser))
}

export function canSendFeedback(user) {
  const liveUser = resolveLiveUser(user)
  return Boolean(hasPresidencyFullAccess(liveUser) || (
    liveUser?.setorId === 'gestao-pessoas' && hasSubareaAccess(liveUser, 'gestaoPessoas.membros')
  ))
}

export function canDeleteMember(actor, target) {
  const liveActor = resolveLiveUser(actor)
  if (!liveActor || !target || idsEqual(liveActor.id, target.id) || idsEqual(liveActor.supabaseId, target.supabaseId)) return false
  if (hasPresidencyFullAccess(liveActor)) return target.role !== 'presidente'
  if (!isPeopleDirector(liveActor)) return false
  return target.role !== 'presidente' && target.role !== 'diretor'
}

export function canManagePermissions(user) {
  return hasPresidencyFullAccess(resolveLiveUser(user))
}

export function canPostAnnouncements(user) {
  const liveUser = resolveLiveUser(user)
  return hasPresidencyFullAccess(liveUser) || liveUser?.role === 'diretor'
}
