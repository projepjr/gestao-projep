import { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useAuth } from '../../contexts/AuthContext'
import UserAvatar from '../../components/UserAvatar'
import { SETORES } from '../../data/setores'
import { canDeleteMember, canManageMembers, canSendFeedback } from '../../config/authorization'
import { Plus, X, Search, Users, Briefcase, Mail, Phone, Trash2, Edit2, MessageSquare, Star } from 'lucide-react'

const EMPTY = { nome: '', cargo: '', setor: '', email: '', senha: '', telefone: '', status: 'ativo', dataCadastro: '', skills: [], avatar: '', projects: 0, performance: 80, usarDadosTemporarios: true }
const INPUT_CLS = "w-full bg-[#0D0D0D] border border-[#1E1E1E] rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#CE7028] transition-colors placeholder-gray-700"
const LABEL_CLS = "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block"
const idsEqual = (a, b) => String(a ?? '') === String(b ?? '')

function Modal({ member, onClose, onSave }) {
  const [form, setForm] = useState(member || EMPTY)
  const [skillInput, setSkillInput] = useState('')
  const [error, setError] = useState('')
  const [temporaryCredentials, setTemporaryCredentials] = useState(null)

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault()
      set('skills', [...(form.skills || []), skillInput.trim()])
      setSkillInput('')
    }
  }
  const removeSkill = (idx) => set('skills', form.skills.filter((_, i) => i !== idx))

  const handleSubmit = (e) => {
    e.preventDefault()
    const avatar = form.nome.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    const result = onSave({ ...form, avatar, projects: Number(form.projects), performance: Number(form.performance) })
    if (result?.success === false) {
      setError(result.error)
      return
    }
    if (result?.temporaryCredentials) {
      setTemporaryCredentials(result.temporaryCredentials)
      return
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-[#1E1E1E] rounded-md w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E1E1E] sticky top-0 bg-[#111111]">
          <h3 className="text-white font-semibold">{member?.id ? 'Editar Membro' : 'Novo Membro'}</h3>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        {temporaryCredentials ? (
          <div className="p-6 space-y-5">
            <div className="rounded border border-[#CE7028]/30 bg-[#CE7028]/10 p-4">
              <p className="text-white font-semibold text-sm">Membro cadastrado com acesso temporário</p>
              <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                Envie estes dados para o membro fazer o primeiro acesso. Depois ele troca email, telefone, foto e senha no perfil.
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <label className={LABEL_CLS}>Email temporário</label>
                <div className="bg-[#0D0D0D] border border-[#1E1E1E] rounded px-3 py-2.5 text-white text-sm font-mono">
                  {temporaryCredentials.email}
                </div>
              </div>
              <div>
                <label className={LABEL_CLS}>Senha temporária</label>
                <div className="bg-[#0D0D0D] border border-[#1E1E1E] rounded px-3 py-2.5 text-white text-sm font-mono">
                  {temporaryCredentials.senha}
                </div>
              </div>
            </div>
            <button type="button" onClick={onClose} className="w-full py-2.5 rounded bg-[#CE7028] hover:bg-[#B5611F] text-white font-semibold text-sm transition-colors">
              Concluir
            </button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={LABEL_CLS}>Nome completo *</label>
              <input required value={form.nome} onChange={e => set('nome', e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Cargo *</label>
              <input required value={form.cargo} onChange={e => set('cargo', e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Área *</label>
              <select value={form.setor} onChange={e => set('setor', e.target.value)} required className={INPUT_CLS}>
                <option value="">Selecionar...</option>
                {SETORES.map(setor => <option key={setor.id} value={setor.nome}>{setor.nome}</option>)}
              </select>
            </div>
            {!member?.id && (
              <div className="col-span-2 rounded border border-[#1E1E1E] bg-[#0D0D0D] p-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(form.usarDadosTemporarios)}
                    onChange={e => set('usarDadosTemporarios', e.target.checked)}
                    className="mt-1 accent-[#CE7028]"
                  />
                  <span>
                    <span className="block text-white text-sm font-semibold">Gerar acesso temporário</span>
                    <span className="block text-gray-500 text-xs mt-0.5">
                      Use para cadastrar o membro agora. Ele troca os dados no próprio perfil depois.
                    </span>
                  </span>
                </label>
              </div>
            )}
            <div>
              <label className={LABEL_CLS}>Email</label>
              <input required={!form.usarDadosTemporarios} disabled={form.usarDadosTemporarios && !member?.id} type="email" value={form.email} onChange={e => set('email', e.target.value)} className={`${INPUT_CLS} ${form.usarDadosTemporarios && !member?.id ? 'opacity-50 cursor-not-allowed' : ''}`} placeholder={form.usarDadosTemporarios && !member?.id ? 'Será gerado automaticamente' : ''} />
            </div>
            {!member?.id && !form.usarDadosTemporarios && (
              <div>
                <label className={LABEL_CLS}>Senha inicial *</label>
                <input required minLength={6} type="password" value={form.senha} onChange={e => set('senha', e.target.value)} className={INPUT_CLS} placeholder="Mínimo de 6 caracteres" />
              </div>
            )}
            <div>
              <label className={LABEL_CLS}>Telefone</label>
              <input value={form.telefone} onChange={e => set('telefone', e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className={INPUT_CLS}>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>Data de entrada</label>
              <input type="date" value={form.dataCadastro} onChange={e => set('dataCadastro', e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Performance (%)</label>
              <input type="number" min="0" max="100" value={form.performance} onChange={e => set('performance', e.target.value)} className={INPUT_CLS} />
            </div>
            <div className="col-span-2">
              <label className={LABEL_CLS}>Habilidades (Enter para adicionar)</label>
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={addSkill} className={INPUT_CLS} placeholder="Digite e pressione Enter..." />
              {form.skills?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.skills.map((s, i) => (
                    <span key={i} className="flex items-center gap-1 bg-blue-900/30 border border-blue-800/30 text-blue-400 text-xs px-2 py-1 rounded">
                      {s}
                      <button type="button" onClick={() => removeSkill(i)} className="hover:text-white"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded border border-[#1E1E1E] text-gray-500 hover:text-white text-sm transition-all">Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 rounded bg-[#CE7028] hover:bg-[#B5611F] text-white font-semibold text-sm transition-colors">{member?.id ? 'Salvar' : 'Adicionar'}</button>
          </div>
        </form>
        )}
      </div>
    </div>
  )
}

function DeleteModal({ member, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-red-900/40 rounded-md w-full max-w-sm shadow-2xl p-6">
        <h3 className="text-white font-semibold">Remover membro?</h3>
        <p className="text-gray-500 text-sm mt-2 leading-relaxed">
          <strong className="text-gray-300">{member.nome}</strong> será removido também de conversas, avaliações, projetos e responsabilidades.
        </p>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded border border-[#2A2A2A] text-gray-400 text-sm">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded bg-red-700 hover:bg-red-600 text-white font-semibold text-sm">Remover</button>
        </div>
      </div>
    </div>
  )
}

function FeedbackModal({ member, onClose, onSave }) {
  const [text, setText] = useState('')
  const [stars, setStars] = useState(5)

  const handleSubmit = event => {
    event.preventDefault()
    if (!text.trim()) return
    onSave({ text: text.trim(), stars })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-[#111111] border border-[#1E1E1E] rounded-md w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E1E1E]">
          <div>
            <h3 className="text-white font-semibold text-sm">Enviar feedback</h3>
            <p className="text-gray-600 text-xs mt-0.5">Para {member.nome}</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-600 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <label className={LABEL_CLS}>Avaliação</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(value => (
                <button key={value} type="button" onClick={() => setStars(value)} className="p-0.5">
                  <Star className={`w-5 h-5 ${value <= stars ? 'fill-[#CE7028] text-[#CE7028]' : 'text-gray-700'}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={LABEL_CLS}>Feedback *</label>
            <textarea required rows={5} value={text} onChange={event => setText(event.target.value)} className={`${INPUT_CLS} resize-none`} placeholder="Descreva pontos fortes e oportunidades de desenvolvimento..." />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded border border-[#1E1E1E] text-gray-500 hover:text-white text-sm">Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 rounded bg-[#CE7028] hover:bg-[#B5611F] text-white font-semibold text-sm">Enviar</button>
          </div>
        </div>
      </form>
    </div>
  )
}

const STATUS_STYLE = {
  ativo: 'bg-green-500/10 text-green-400 border-green-700/30',
  inativo: 'bg-gray-500/10 text-gray-400 border-gray-600/30',
  afastado: 'bg-yellow-500/10 text-yellow-400 border-yellow-700/30',
}

export default function Membros() {
  const { user } = useAuth()
  const { members, addMember, updateMember, deleteMember, addFeedback } = useData()
  const [showModal, setShowModal] = useState(false)
  const [editMember, setEditMember] = useState(null)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('todos')
  const [feedbackMember, setFeedbackMember] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const canManage = canManageMembers(user)
  const canFeedback = canSendFeedback(user)

  const directoryMembers = members.filter(member => ['ativo', 'inativo', 'afastado'].includes(member.status))
  const filtered = directoryMembers.filter(m => {
    const matchSearch = !search || m.nome?.toLowerCase().includes(search.toLowerCase()) || m.cargo?.toLowerCase().includes(search.toLowerCase())
    const matchDept = deptFilter === 'todos' || m.setor === deptFilter
    return matchSearch && matchDept
  })

  const handleSave = (data) => {
    return data.id ? updateMember(data.id, data) : addMember(data)
  }

  const allDepts = [...new Set(directoryMembers.map(m => m.setor))].filter(Boolean)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Membros</h1>
          <p className="text-gray-500 text-sm mt-1">{members.filter(m => m.status === 'ativo').length} membros ativos</p>
        </div>
        {canManage && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#CE7028] hover:bg-[#B5611F] text-white font-semibold px-4 py-2.5 rounded text-sm transition-colors">
            <Plus className="w-4 h-4" /> Novo Membro
          </button>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar membro..." className="w-full bg-[#111111] border border-[#1E1E1E] rounded pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#CE7028] transition-colors placeholder-gray-700" />
        </div>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="bg-[#111111] border border-[#1E1E1E] rounded px-3 py-2.5 text-gray-400 text-sm focus:outline-none focus:border-[#CE7028] transition-colors">
          <option value="todos">Todas as áreas</option>
          {allDepts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(member => (
          <div key={member.id} className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5 hover:border-[#2A2A2A] transition-colors group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <UserAvatar user={member} size={44} fallbackColor="#1E3A5F" textClassName="text-sm" />
                <div>
                  <p className="text-white font-semibold text-sm">{member.nome}</p>
                  <p className="text-gray-600 text-xs mt-0.5">{member.cargo}</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                {canFeedback && !idsEqual(member.id, user.id) && (
                  <button onClick={() => setFeedbackMember(member)} className="p-1.5 rounded text-gray-600 hover:text-blue-400 hover:bg-blue-500/10 transition-all" title="Enviar feedback">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                )}
                {canManage && (user.role === 'presidente' || !['presidente', 'diretor'].includes(member.role)) && (
                  <button onClick={() => { setEditMember(member); setShowModal(true) }} className="p-1.5 rounded text-gray-600 hover:text-[#FF882D] hover:bg-[#CE7028]/10 transition-all" title="Editar membro">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {canDeleteMember(user, member) && (
                  <button onClick={() => setDeleteTarget(member)} className="p-1.5 rounded text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Remover membro">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-gray-600 mb-4">
              <div className="flex items-center gap-2"><Briefcase className="w-3 h-3" />{member.setor}</div>
              {member.email && <div className="flex items-center gap-2"><Mail className="w-3 h-3" />{member.email}</div>}
              {member.telefone && <div className="flex items-center gap-2"><Phone className="w-3 h-3" />{member.telefone}</div>}
            </div>

            {member.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {member.skills.slice(0, 3).map((s, i) => (
                  <span key={i} className="bg-blue-900/20 border border-blue-800/20 text-blue-400 text-xs px-2 py-0.5 rounded">{s}</span>
                ))}
                {member.skills.length > 3 && (
                  <span className="text-gray-600 text-xs px-1">+{member.skills.length - 3}</span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold border ${STATUS_STYLE[member.status] || STATUS_STYLE.ativo}`}>
                {member.status === 'ativo' ? 'Ativo' : member.status === 'inativo' ? 'Inativo' : 'Afastado'}
              </span>
              {member.performance !== undefined && (
                <div className="flex items-center gap-2">
                  <div className="w-14 h-1.5 bg-[#1E1E1E] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${member.performance >= 90 ? 'bg-green-500' : member.performance >= 75 ? 'bg-[#CE7028]' : 'bg-red-500'}`} style={{ width: `${member.performance}%` }} />
                  </div>
                  <span className="text-white text-xs font-bold tabular-nums">{member.performance}%</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center py-16 text-gray-700">
            <Users className="w-10 h-10 mb-3 opacity-30" />
            <p>Nenhum membro encontrado</p>
          </div>
        )}
      </div>

      {showModal && (
        <Modal member={editMember} onClose={() => { setShowModal(false); setEditMember(null) }} onSave={handleSave} />
      )}
      {feedbackMember && (
        <FeedbackModal
          member={feedbackMember}
          onClose={() => setFeedbackMember(null)}
          onSave={({ text, stars }) => addFeedback({ memberId: feedbackMember.id, evaluatorId: user.id, text, stars })}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          member={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            const result = deleteMember(deleteTarget.id)
            if (result.success) setDeleteTarget(null)
          }}
        />
      )}
    </div>
  )
}
