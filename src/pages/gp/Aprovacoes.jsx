import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import { UserCheck, UserX, Clock, CheckCircle, XCircle, Users, Calendar, Mail, Briefcase, Building } from 'lucide-react'

const ROLE_OPTIONS = [
  { value: 'comercial',  label: 'Comercial'         },
  { value: 'gp',         label: 'Gestão de Pessoas' },
  { value: 'presidente', label: 'Presidente'         },
]

function fmtDate(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) }
  catch { return iso }
}

const AVATAR_COLORS = ['#3D5A80','#2A6B69','#7B2D8B','#1A3A5C','#5C3A1A','#4A5C1A']
const avatarColor = (id) => AVATAR_COLORS[Number(id) % AVATAR_COLORS.length]

export default function Aprovacoes() {
  const { getPendingUsers, approveUser, rejectUser } = useAuth()
  const { addMember } = useData()

  const [roles,      setRoles]      = useState({}) // { userId: 'comercial' }
  const [confirmed,  setConfirmed]  = useState([]) // ids recently acted on

  const pending = getPendingUsers()
  const actedOn = confirmed.length

  const handleApprove = (u) => {
    const role = roles[u.id] || 'comercial'
    approveUser(u.id, role)
    // Add to member directory
    addMember({
      id:          u.id,
      name:        u.name,
      role:        u.jobTitle || ROLE_OPTIONS.find(r => r.value === role)?.label || role,
      department:  u.department || '',
      email:       u.email,
      phone:       '',
      status:      'ativo',
      joinDate:    new Date().toISOString().split('T')[0],
      skills:      [],
      avatar:      u.avatar,
      projects:    0,
      performance: 0,
    })
    setConfirmed(prev => [...prev, { id: u.id, action: 'approved', name: u.name }])
    // Dispatch notification
    window.dispatchEvent(new CustomEvent('ej:notification', {
      detail: {
        id: Date.now(), type: 'system', read: false,
        title: 'Cadastro aprovado',
        desc:  `${u.name} agora tem acesso ao sistema como ${ROLE_OPTIONS.find(r => r.value === role)?.label}`,
        time:  new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      }
    }))
  }

  const handleReject = (u) => {
    rejectUser(u.id)
    setConfirmed(prev => [...prev, { id: u.id, action: 'rejected', name: u.name }])
  }

  const visiblePending = pending.filter(u => !confirmed.find(c => c.id === u.id))

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <UserCheck className="w-6 h-6 text-[#CE7028]" />
            Aprovações de Cadastro
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Gerencie solicitações de acesso ao sistema</p>
        </div>
        {visiblePending.length > 0 && (
          <div className="flex items-center gap-2 bg-yellow-950/30 border border-yellow-900/30 text-yellow-400 text-sm font-semibold px-3 py-1.5 rounded">
            <Clock className="w-4 h-4" />
            {visiblePending.length} pendente{visiblePending.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Recent actions feedback */}
      {confirmed.length > 0 && (
        <div className="space-y-2">
          {confirmed.slice(-3).map(c => (
            <div key={c.id} className={`flex items-center gap-3 px-4 py-3 rounded border text-sm ${c.action === 'approved' ? 'bg-green-950/30 border-green-900/30 text-green-400' : 'bg-red-950/30 border-red-900/30 text-red-400'}`}>
              {c.action === 'approved'
                ? <><CheckCircle className="w-4 h-4 flex-shrink-0" /> <strong>{c.name}</strong> foi aprovado e já tem acesso ao sistema.</>
                : <><XCircle className="w-4 h-4 flex-shrink-0" /> <strong>{c.name}</strong> foi reprovado.</>
              }
            </div>
          ))}
        </div>
      )}

      {/* Pending list */}
      {visiblePending.length === 0 ? (
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-md flex flex-col items-center justify-center py-20 text-center">
          <Users className="w-12 h-12 text-gray-700 mb-4" />
          <p className="text-gray-500 font-semibold">Nenhuma solicitação pendente</p>
          <p className="text-gray-700 text-sm mt-1">Novos cadastros aparecerão aqui para aprovação</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visiblePending.map(u => (
            <div key={u.id} className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5 hover:border-[#CE7028]/20 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                {/* Avatar + info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                    style={{ background: avatarColor(u.id) }}
                  >
                    {u.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold text-base truncate">{u.name}</h3>
                      <span className="text-[10px] font-semibold bg-yellow-950/40 border border-yellow-900/30 text-yellow-400 px-1.5 py-0.5 rounded flex-shrink-0">
                        Pendente
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Mail className="w-3 h-3" /> {u.email}
                      </div>
                      {u.department && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Building className="w-3 h-3" /> {u.department}
                          {u.jobTitle && <span className="text-gray-700">·</span>}
                          {u.jobTitle && <span>{u.jobTitle}</span>}
                        </div>
                      )}
                      {u.createdAt && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Calendar className="w-3 h-3" /> Solicitado em {fmtDate(u.createdAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:items-end gap-3 flex-shrink-0">
                  <div>
                    <label className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold block mb-1.5">Cargo no sistema</label>
                    <select
                      value={roles[u.id] || 'comercial'}
                      onChange={e => setRoles(prev => ({ ...prev, [u.id]: e.target.value }))}
                      className="bg-[#0D0D0D] border border-[#2A2A2A] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#CE7028] transition-colors"
                    >
                      {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReject(u)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded border border-red-900/50 text-red-400 hover:bg-red-950/30 text-xs font-semibold transition-colors"
                    >
                      <UserX className="w-3.5 h-3.5" /> Reprovar
                    </button>
                    <button
                      onClick={() => handleApprove(u)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#044947] hover:bg-[#044947]/80 text-white text-xs font-semibold transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Aprovar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
