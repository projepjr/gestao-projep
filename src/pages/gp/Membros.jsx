import { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { Plus, X, Search, Users, Briefcase, Mail, Phone, Trash2, Edit2 } from 'lucide-react'

const EMPTY = { name: '', role: '', department: '', email: '', phone: '', status: 'ativo', joinDate: '', skills: [], avatar: '', projects: 0, performance: 80 }
const DEPTS = ['Comercial', 'Gestão de Pessoas', 'Projetos', 'Marketing', 'Financeiro', 'Diretoria']

const INPUT_CLS = "w-full bg-[#0D0D0D] border border-[#1E1E1E] rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#CE7028] transition-colors placeholder-gray-700"
const LABEL_CLS = "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block"

function Modal({ member, onClose, onSave }) {
  const [form, setForm] = useState(member || EMPTY)
  const [skillInput, setSkillInput] = useState('')

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
    const avatar = form.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    onSave({ ...form, avatar, projects: Number(form.projects), performance: Number(form.performance) })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-[#1E1E1E] rounded-md w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E1E1E] sticky top-0 bg-[#111111]">
          <h3 className="text-white font-semibold">{member?.id ? 'Editar Membro' : 'Novo Membro'}</h3>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={LABEL_CLS}>Nome completo *</label>
              <input required value={form.name} onChange={e => set('name', e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Cargo *</label>
              <input required value={form.role} onChange={e => set('role', e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Área *</label>
              <select value={form.department} onChange={e => set('department', e.target.value)} required className={INPUT_CLS}>
                <option value="">Selecionar...</option>
                {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Telefone</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className={INPUT_CLS}>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="afastado">Afastado</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>Data de entrada</label>
              <input type="date" value={form.joinDate} onChange={e => set('joinDate', e.target.value)} className={INPUT_CLS} />
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
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded border border-[#1E1E1E] text-gray-500 hover:text-white text-sm transition-all">Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 rounded bg-[#CE7028] hover:bg-[#B5611F] text-white font-semibold text-sm transition-colors">{member?.id ? 'Salvar' : 'Adicionar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const STATUS_STYLE = {
  ativo: 'bg-green-500/10 text-green-400 border-green-700/30',
  inativo: 'bg-gray-500/10 text-gray-400 border-gray-600/30',
  afastado: 'bg-yellow-500/10 text-yellow-400 border-yellow-700/30',
}

export default function Membros() {
  const { members, addMember, updateMember, deleteMember } = useData()
  const [showModal, setShowModal] = useState(false)
  const [editMember, setEditMember] = useState(null)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('todos')

  const filtered = members.filter(m => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.role.toLowerCase().includes(search.toLowerCase())
    const matchDept = deptFilter === 'todos' || m.department === deptFilter
    return matchSearch && matchDept
  })

  const handleSave = (data) => {
    if (data.id) updateMember(data.id, data)
    else addMember(data)
  }

  const allDepts = [...new Set(members.map(m => m.department))].filter(Boolean)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Membros</h1>
          <p className="text-gray-500 text-sm mt-1">{members.filter(m => m.status === 'ativo').length} membros ativos</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#CE7028] hover:bg-[#B5611F] text-white font-semibold px-4 py-2.5 rounded text-sm transition-colors">
          <Plus className="w-4 h-4" /> Novo Membro
        </button>
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
                <div className="w-11 h-11 bg-blue-900/40 border border-blue-800/30 rounded flex items-center justify-center text-white font-bold text-sm">
                  {member.avatar || member.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{member.name}</p>
                  <p className="text-gray-600 text-xs mt-0.5">{member.role}</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditMember(member); setShowModal(true) }} className="p-1.5 rounded text-gray-600 hover:text-[#FF882D] hover:bg-[#CE7028]/10 transition-all">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deleteMember(member.id)} className="p-1.5 rounded text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-gray-600 mb-4">
              <div className="flex items-center gap-2"><Briefcase className="w-3 h-3" />{member.department}</div>
              {member.email && <div className="flex items-center gap-2"><Mail className="w-3 h-3" />{member.email}</div>}
              {member.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3" />{member.phone}</div>}
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
    </div>
  )
}
