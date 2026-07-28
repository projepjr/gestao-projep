import { hasPresidencyFullAccess, hasSubareaAccess } from './accessControl'
import db from '../data/db'

const idsEqual = (a, b) => String(a ?? '') === String(b ?? '')
const ACTIVE_STATUSES = new Set(['ativo', 'active'])

export const LAST_PRESIDENT_DELETE_ERROR = 'Esta conta tem acesso de Presidencia. Para exclui-la, cadastre e mantenha pelo menos outro presidente ativo no sistema. Assim a empresa nao perde o controle das permissoes.'

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

export function isPresidencyAccount(user) {
  return hasPresidencyFullAccess(resolveLiveUser(user) || user)
}

export function hasAnotherActivePresident(users = db.get('usuarios'), target) {
  if (!isPresidencyAccount(target)) return true
  return users.some(item => {
    if (!item || idsEqual(item.id, target?.id) || idsEqual(item.supabaseId, target?.supabaseId)) return false
    if (!ACTIVE_STATUSES.has(`${item.status || 'ativo'}`.toLowerCase())) return false
    return hasPresidencyFullAccess(item)
  })
}

export function validatePresidencyDeletion(target, users = db.get('usuarios')) {
  if (!isPresidencyAccount(target)) return { allowed: true }
  if (hasAnotherActivePresident(users, target)) return { allowed: true }
  return { allowed: false, error: LAST_PRESIDENT_DELETE_ERROR }
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

export function getDeleteMemberAuthorization(actor, target, users = db.get('usuarios')) {
  const liveActor = resolveLiveUser(actor)
  if (!liveActor || !target) return { allowed: false, error: 'Nao foi possivel identificar o membro.' }
  if (idsEqual(liveActor.id, target.id) || idsEqual(liveActor.supabaseId, target.supabaseId)) {
    return { allowed: false, error: 'Use a opcao "Excluir minha conta" no seu perfil para remover a propria conta.' }
  }

  const targetHasPresidency = isPresidencyAccount(target)
  if (targetHasPresidency) {
    const presidencyGuard = validatePresidencyDeletion(target, users)
    if (!presidencyGuard.allowed) return presidencyGuard
    if (!hasPresidencyFullAccess(liveActor)) {
      return {
        allowed: false,
        error: 'Contas com acesso de Presidencia so podem ser removidas pela propria Presidencia, e apenas quando ja existe outro presidente ativo.',
      }
    }
    return { allowed: true }
  }

  if (hasPresidencyFullAccess(liveActor)) return { allowed: true }
  if (!isPeopleDirector(liveActor)) return { allowed: false, error: 'Voce nao pode remover este membro.' }
  if (target.role === 'diretor') return { allowed: false, error: 'Diretores so podem ser removidos pela Presidencia.' }
  return { allowed: true }
}

export function canDeleteMember(actor, target) {
  return getDeleteMemberAuthorization(actor, target).allowed
}

export function canManagePermissions(user) {
  return hasPresidencyFullAccess(resolveLiveUser(user))
}

export function canPostAnnouncements(user) {
  const liveUser = resolveLiveUser(user)
  return hasPresidencyFullAccess(liveUser) || liveUser?.role === 'diretor'
}
