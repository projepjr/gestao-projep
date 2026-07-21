import { Fragment, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
  Shield, UserCheck, UserX, Clock, CheckCircle, XCircle,
  Info, ChevronDown, ChevronRight, LockKeyhole,
} from 'lucide-react'
import {
  ACCESS_MODULES,
  normalizePermissions,
  setModulePermission,
  setSubareaPermission,
} from '../../config/accessControl'
import UserAvatar from '../../components/UserAvatar'
import { getSuggestedRolePreset, ROLE_PRESETS } from '../../config/rolePresets'

const PALETTE = ['#CE7028', '#B5611F', '#3D5A80', '#2A6B69', '#7B2D8B', '#044947', '#1565C0', '#2E7D32']
const idsEqual = (a, b) => String(a ?? '') === String(b ?? '')
const avatarBg = id => {
  const hash = String(id ?? '')
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return PALETTE[hash % PALETTE.length]
}

function Toggle({ checked, onChange, disabled, title }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      title={title || (checked ? 'Remover acesso' : 'Conceder acesso')}
      aria-pressed={checked}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-200 flex-shrink-0 ${
        checked ? 'bg-[#046B67]' : 'bg-[#2A2A2A]'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#CE7028]/30'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full shadow-sm transition-transform duration-200 ${
        checked ? 'translate-x-[18px] bg-emerald-400' : 'translate-x-0.5 bg-gray-500'
      }`} />
    </button>
  )
}

export default function Seguranca() {
  const { user, users, updateUserPermissoes, approveUser, rejectUser } = useAuth()
  const [expanded, setExpanded] = useState(new Set())
  const [roleSelect, setRoleSelect] = useState({})
  const [actions, setActions] = useState([])
  const [actionError, setActionError] = useState('')

  const activeUsers = users.filter(member => member.status === 'ativo')
  const pendingUsers = users.filter(member => member.status === 'pendente')

  const toggleExpanded = memberId => {
    setExpanded(current => {
      const next = new Set(current)
      if (next.has(memberId)) next.delete(memberId)
      else next.add(memberId)
      return next
    })
  }

  const handleModuleToggle = (member, moduleKey, enabled) => {
    const protectedSelf = idsEqual(member.id, user?.id) && moduleKey === 'presidencia'
    if (protectedSelf) return
    updateUserPermissoes(
      member.id,
      setModulePermission(member.permissoes, member.role, moduleKey, enabled)
    )
  }

  const handleSubareaToggle = (member, subareaKey, enabled) => {
    const protectedSelf = idsEqual(member.id, user?.id) && subareaKey === 'presidencia.seguranca'
    if (protectedSelf) return
    updateUserPermissoes(
      member.id,
      setSubareaPermission(member.permissoes, member.role, subareaKey, enabled)
    )
  }

  const handleApprove = member => {
    setActionError('')
    const suggested = getSuggestedRolePreset(user, member)
    const preset = ROLE_PRESETS.find(item => item.value === (roleSelect[member.id] || suggested?.value))
    const result = approveUser(member.id, preset?.permissions || {}, preset?.role || 'membro')
    if (!result.success) return setActionError(result.error)
    setActions(current => [...current, { id: member.id, type: 'approved', name: member.nome }])
  }

  const handleReject = member => {
    setActionError('')
    const result = rejectUser(member.id)
    if (!result.success) return setActionError(result.error)
    setActions(current => [...current, { id: member.id, type: 'rejected', name: member.nome }])
  }

  return (
    <div className="space-y-8 max-w-[1500px]">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
          <Shield className="w-6 h-6 text-[#CE7028]" />
          Segurança e Permissões
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Controle o acesso de cada membro aos módulos e às subáreas do sistema
        </p>
      </div>

      {pendingUsers.length > 0 && (
        <section className="bg-[#111111] border border-yellow-900/30 rounded-md overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-yellow-900/20 bg-yellow-950/10">
            <Clock className="w-4 h-4 text-yellow-400" />
            <h2 className="text-white font-semibold text-sm">Cadastros Pendentes</h2>
            <span className="ml-auto bg-yellow-950/50 border border-yellow-900/30 text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingUsers.length}
            </span>
          </div>
          <div className="divide-y divide-[#1E1E1E]">
            {pendingUsers.map(member => (
              <div key={member.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <UserAvatar user={member} size={36} fallbackColor={avatarBg(member.id)} textClassName="text-xs" />
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm">{member.nome}</p>
                    <p className="text-gray-500 text-xs truncate">{member.email}</p>
                    <p className="text-gray-600 text-xs">{[member.cargo, member.setor].filter(Boolean).join(' · ')}</p>
                  </div>
                </div>
                <select
                  value={roleSelect[member.id] || getSuggestedRolePreset(user, member)?.value}
                  onChange={event => setRoleSelect(current => ({ ...current, [member.id]: event.target.value }))}
                  className="bg-[#0D0D0D] border border-[#2A2A2A] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#CE7028]"
                >
                  {ROLE_PRESETS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <div className="flex gap-2">
                  <button onClick={() => handleReject(member)} className="flex items-center gap-1.5 px-3 py-2 rounded border border-red-900/50 text-red-400 hover:bg-red-950/30 text-xs font-semibold">
                    <UserX className="w-3.5 h-3.5" /> Rejeitar
                  </button>
                  <button onClick={() => handleApprove(member)} className="flex items-center gap-1.5 px-3 py-2 rounded bg-[#044947] hover:bg-[#033835] text-white text-xs font-semibold">
                    <UserCheck className="w-3.5 h-3.5" /> Aprovar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {actions.length > 0 && (
        <div className="space-y-2">
          {actions.slice(-3).map(action => (
            <div key={`${action.id}-${action.type}`} className={`flex items-center gap-2 px-4 py-3 rounded border text-xs ${
              action.type === 'approved'
                ? 'bg-green-950/30 border-green-900/30 text-green-400'
                : 'bg-red-950/30 border-red-900/30 text-red-400'
            }`}>
              {action.type === 'approved' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              <strong>{action.name}</strong> {action.type === 'approved' ? 'foi aprovado' : 'teve o cadastro rejeitado'}.
            </div>
          ))}
        </div>
      )}

      {actionError && (
        <div className="bg-red-950/30 border border-red-900/30 text-red-400 text-sm px-4 py-3 rounded">
          {actionError}
        </div>
      )}

      <section className="bg-[#111111] border border-[#1E1E1E] rounded-md overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#1E1E1E]">
          <div>
            <h2 className="text-white font-semibold text-sm">Permissões por Membro</h2>
            <p className="text-gray-600 text-xs mt-0.5">Clique no nome para configurar as subáreas</p>
          </div>
          <span className="ml-auto text-gray-600 text-xs tabular-nums">{activeUsers.length} membros ativos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[1150px]">
            <thead>
              <tr className="border-b border-[#1E1E1E] bg-[#0D0D0D]">
                <th className="text-left text-gray-500 font-semibold px-6 py-3 w-64">Membro</th>
                {ACCESS_MODULES.map(module => (
                  <th key={module.key} className="text-center text-gray-500 font-semibold px-3 py-3 whitespace-nowrap">
                    {module.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeUsers.map(member => {
                const permissions = normalizePermissions(member.permissoes, member.role)
                const isExpanded = expanded.has(member.id)
                const isSelf = idsEqual(member.id, user?.id)

                return (
                  <Fragment key={member.id}>
                    <tr className={`border-b border-[#1E1E1E] ${isSelf ? 'bg-[#CE7028]/[0.03]' : 'hover:bg-[#161616]'}`}>
                      <td className="px-6 py-3.5">
                        <button onClick={() => toggleExpanded(member.id)} className="w-full flex items-center gap-3 text-left group">
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-[#CE7028]" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-[#CE7028]" />}
                          <UserAvatar user={member} size={36} fallbackColor={avatarBg(member.id)} textClassName="text-xs" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-white font-semibold truncate">{member.nome}</p>
                              {isSelf && <span className="text-[9px] bg-[#CE7028]/20 text-[#FF882D] border border-[#CE7028]/30 px-1 py-0.5 rounded font-bold">VOCÊ</span>}
                            </div>
                            <p className="text-gray-600 truncate mt-0.5">{member.cargo}</p>
                          </div>
                        </button>
                      </td>
                      {ACCESS_MODULES.map(module => {
                        const protectedSelf = member.role === 'presidente'
                        return (
                          <td key={module.key} className="text-center px-3 py-3.5">
                            <div className="flex justify-center">
                              <Toggle
                                checked={Boolean(permissions[module.key])}
                                disabled={protectedSelf}
                                onChange={enabled => handleModuleToggle(member, module.key, enabled)}
                                title={protectedSelf ? 'O cargo Presidente possui acesso integral' : undefined}
                              />
                            </div>
                          </td>
                        )
                      })}
                    </tr>

                    {isExpanded && (
                      <tr className="border-b border-[#1E1E1E] bg-[#0A0A0A]">
                        <td colSpan={ACCESS_MODULES.length + 1} className="px-6 py-5">
                          <div className="flex items-center gap-2 mb-4">
                            <LockKeyhole className="w-4 h-4 text-[#CE7028]" />
                            <p className="text-white text-xs font-semibold">Acessos detalhados de {member.nome}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                            {ACCESS_MODULES.filter(module => module.subareas.length > 0).map(module => (
                              <div key={module.key} className="bg-[#111111] border border-[#1E1E1E] rounded p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <p className="text-gray-300 text-xs font-bold uppercase tracking-wider">{module.label}</p>
                                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${permissions[module.key] ? 'bg-green-950/40 text-green-400' : 'bg-gray-900 text-gray-600'}`}>
                                    {permissions[module.key] ? 'MÓDULO ATIVO' : 'MÓDULO INATIVO'}
                                  </span>
                                </div>
                                <div className="space-y-2.5">
                                  {module.subareas.map(subarea => {
                                    const protectedSelf = member.role === 'presidente'
                                    return (
                                      <div key={subarea.key} className="flex items-center justify-between gap-3 p-2.5 bg-[#0D0D0D] border border-[#1E1E1E] rounded">
                                        <div>
                                          <p className="text-gray-300 text-xs font-medium">{subarea.label}</p>
                                          <p className="text-gray-700 text-[10px] mt-0.5">{subarea.path}</p>
                                        </div>
                                        <Toggle
                                          checked={Boolean(permissions.subareas[subarea.key])}
                                          disabled={protectedSelf}
                                          onChange={enabled => handleSubareaToggle(member, subarea.key, enabled)}
                                        />
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-[#1E1E1E] flex flex-wrap items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#046B67]" />Acesso ativo</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#2A2A2A]" />Sem acesso</div>
          <div className="flex items-center gap-1.5 ml-auto"><Info className="w-3 h-3" />Alterações aplicadas em tempo real em todas as telas</div>
        </div>
      </section>
    </div>
  )
}
