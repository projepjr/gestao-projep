import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FolderKanban, Plus, Search, X, ChevronRight,
  Circle, Calendar, Users, BarChart2, Trash2, Edit2,
  TrendingUp, CheckCircle2, AlertTriangle, Clock,
} from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { useAuth } from '../../contexts/AuthContext'

const INPUT = 'w-full bg-[#0D0D0D] border border-[#1E1E1E] rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#CE7028] transition-colors placeholder-gray-700'
const LABEL = 'text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block'
const SELECT = `${INPUT} cursor-pointer`

const SAUDE_CONFIG = {
  verde:    { label: 'No prazo',    cls: 'bg-green-950/40 text-green-400 border border-green-900/30' },
  amarelo:  { label: 'Atenção',    cls: 'bg-yellow-950/30 text-yellow-400 border border-yellow-900/20' },
  vermelho: { label: 'Em risco',   cls: 'bg-red-950/30 text-red-400 border border-red-900/20' },
}

const STATUS_CONFIG = {
  planejado:    { label: 'Planejado',    cls: 'bg-blue-950/30 text-blue-400 border border-blue-900/20' },
  em_andamento: { label: 'Em andamento', cls: 'bg-[#CE7028]/10 text-[#FF882D] border border-[#CE7028]/30' },
  pausado:      { label: 'Pausado',      cls: 'bg-gray-800/60 text-gray-400 border border-gray-700/30' },
  concluido:    { label: 'Concluído',    cls: 'bg-green-950/40 text-green-400 border border-green-900/30' },
  cancelado:    { label: 'Cancelado',    cls: 'bg-red-950/30 text-red-400 border border-red-900/20' },
}

const EMPTY_FORM = {
  nome: '', clienteNome: '', responsavelId: '',
  status: 'em_andamento', saude: 'verde',
  dataInicio: '', dataFim: '', descricao: '', fase: '',
}

function fmtDate(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) }
  catch { return iso }
}

function diasRestantes(dataFim) {
  if (!dataFim) return null
  const diff = Math.ceil((new Date(dataFim) - new Date()) / 86400000)
  return diff
}

function Badge({ cfg }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${cfg.cls}`}>{cfg.label}</span>
}

function StatCard({ icon: Icon, label, value, color = 'text-white' }) {
  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-md px-5 py-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded bg-[#1A1A1A] border border-[#1E1E1E] flex items-center justify-center flex-shrink-0">
        <Icon className="w-4.5 h-4.5 text-[#CE7028]" />
      </div>
      <div>
        <p className="text-gray-500 text-xs font-medium">{label}</p>
        <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
      </div>
    </div>
  )
}

export default function Projetos() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { projects, members, addProject, deleteProject } = useData()

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSaude, setFilterSaude] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDelete, setShowDelete] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const allMembers = members || []

  const filtered = useMemo(() => {
    return (projects || []).filter(p => {
      const q = search.toLowerCase()
      const matchQ = !q || p.nome?.toLowerCase().includes(q) || p.clienteNome?.toLowerCase().includes(q)
      const matchStatus = !filterStatus || p.status === filterStatus
      const matchSaude = !filterSaude || p.saude === filterSaude
      return matchQ && matchStatus && matchSaude
    })
  }, [projects, search, filterStatus, filterSaude])

  const stats = useMemo(() => {
    const all = projects || []
    return {
      total: all.length,
      emAndamento: all.filter(p => p.status === 'em_andamento').length,
      emRisco: all.filter(p => p.saude === 'vermelho').length,
      concluidos: all.filter(p => p.status === 'concluido').length,
    }
  }, [projects])

  const handleSave = () => {
    if (!form.nome.trim()) return
    setSaving(true)
    const resp = allMembers.find(m => m.id === form.responsavelId)
    addProject({
      ...form,
      responsavelNome: resp?.nome || '',
    })
    setSaving(false)
    setShowModal(false)
    setForm(EMPTY_FORM)
  }

  const handleDelete = () => {
    if (!showDelete) return
    deleteProject(showDelete.id)
    setShowDelete(null)
  }

  const progressColor = pct => {
    if (pct >= 80) return 'bg-green-500'
    if (pct >= 40) return 'bg-[#CE7028]'
    return 'bg-blue-500'
  }

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
            <span>Projetos</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-400">Gestão</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <FolderKanban className="w-6 h-6 text-[#CE7028]" />
            Projetos
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Gerencie e acompanhe os projetos da equipe</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#CE7028] hover:bg-[#B5611F] text-white text-sm font-semibold px-4 py-2 rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Projeto
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FolderKanban} label="Total de projetos" value={stats.total} />
        <StatCard icon={TrendingUp}   label="Em andamento"      value={stats.emAndamento} color="text-[#FF882D]" />
        <StatCard icon={AlertTriangle} label="Em risco"         value={stats.emRisco}     color="text-red-400" />
        <StatCard icon={CheckCircle2} label="Concluídos"        value={stats.concluidos}  color="text-green-400" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar projeto ou cliente…"
            className="w-full bg-[#111111] border border-[#1E1E1E] rounded px-3 py-2 pl-9 text-sm text-white focus:outline-none focus:border-[#CE7028] placeholder-gray-700 transition-colors"
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-[#111111] border border-[#1E1E1E] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CE7028] transition-colors cursor-pointer">
          <option value="">Todos os status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterSaude} onChange={e => setFilterSaude(e.target.value)}
          className="bg-[#111111] border border-[#1E1E1E] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CE7028] transition-colors cursor-pointer">
          <option value="">Toda saúde</option>
          {Object.entries(SAUDE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        {(search || filterStatus || filterSaude) && (
          <button onClick={() => { setSearch(''); setFilterStatus(''); setFilterSaude('') }}
            className="text-gray-600 hover:text-gray-400 text-xs underline">
            Limpar
          </button>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-md flex flex-col items-center justify-center py-20 text-center">
          <FolderKanban className="w-12 h-12 text-gray-700 mb-4" />
          <p className="text-gray-500 font-semibold">
            {projects?.length === 0 ? 'Nenhum projeto cadastrado' : 'Nenhum projeto encontrado'}
          </p>
          <p className="text-gray-700 text-sm mt-1">
            {projects?.length === 0 ? 'Clique em "Novo Projeto" para começar' : 'Tente ajustar os filtros'}
          </p>
        </div>
      ) : (
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1E1E1E]">
                  {['Projeto', 'Cliente', 'Gerente', 'Fase', 'Saúde', 'Progresso', 'Prazo', 'Tarefas', ''].map(h => (
                    <th key={h} className="text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E1E1E]">
                {filtered.map(project => {
                  const dias = diasRestantes(project.dataFim)
                  const saudeCfg = SAUDE_CONFIG[project.saude] || SAUDE_CONFIG.verde
                  const tarefasTotal = (project.tarefas || []).length
                  const tarefasDone = (project.tarefas || []).filter(t => t.status === 'concluida').length
                  return (
                    <tr
                      key={project.id}
                      onClick={() => navigate(`/projetos/gestao/${project.id}`)}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3.5">
                        <p className="text-white font-semibold text-sm group-hover:text-[#FF882D] transition-colors">{project.nome}</p>
                        {project.status && (
                          <Badge cfg={STATUS_CONFIG[project.status] || STATUS_CONFIG.em_andamento} />
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-gray-400 text-sm">{project.clienteNome || '—'}</td>
                      <td className="px-4 py-3.5 text-gray-400 text-sm">{project.responsavelNome || allMembers.find(m => m.id === project.responsavelId)?.nome || '—'}</td>
                      <td className="px-4 py-3.5 text-gray-500 text-sm">{project.fase || '—'}</td>
                      <td className="px-4 py-3.5"><Badge cfg={saudeCfg} /></td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <div className="flex-1 h-1.5 bg-[#1E1E1E] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${progressColor(project.percentualConcluido || 0)}`}
                              style={{ width: `${project.percentualConcluido || 0}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 w-8 text-right tabular-nums">{project.percentualConcluido || 0}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {project.dataFim ? (
                          <div>
                            <p className="text-gray-400 text-sm">{fmtDate(project.dataFim)}</p>
                            {dias !== null && (
                              <p className={`text-[10px] font-medium ${dias < 0 ? 'text-red-400' : dias <= 7 ? 'text-yellow-400' : 'text-gray-600'}`}>
                                {dias < 0 ? `${Math.abs(dias)}d atrasado` : dias === 0 ? 'Vence hoje' : `${dias}d restantes`}
                              </p>
                            )}
                          </div>
                        ) : <span className="text-gray-700 text-sm">—</span>}
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 text-sm">
                        {tarefasTotal > 0 ? `${tarefasDone}/${tarefasTotal}` : '—'}
                      </td>
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setShowDelete(project)}
                          className="p-1.5 rounded text-gray-700 hover:text-red-400 hover:bg-red-950/30 transition-all opacity-0 group-hover:opacity-100"
                          title="Excluir projeto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-[#1E1E1E] rounded-md w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E1E1E]">
              <h2 className="text-white font-bold text-base">Novo Projeto</h2>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM) }} className="text-gray-600 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className={LABEL}>Nome do projeto *</label>
                <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                  placeholder="Ex: Sistema de Gestão XYZ" className={INPUT} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Cliente</label>
                  <input value={form.clienteNome} onChange={e => setForm(f => ({ ...f, clienteNome: e.target.value }))}
                    placeholder="Nome do cliente" className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Fase atual</label>
                  <input value={form.fase} onChange={e => setForm(f => ({ ...f, fase: e.target.value }))}
                    placeholder="Ex: Planejamento" className={INPUT} />
                </div>
              </div>
              <div>
                <label className={LABEL}>Gerente responsável</label>
                <select value={form.responsavelId} onChange={e => setForm(f => ({ ...f, responsavelId: e.target.value }))} className={SELECT}>
                  <option value="">Selecionar membro</option>
                  {allMembers.filter(m => m.status === 'ativo').map(m => (
                    <option key={m.id} value={m.id}>{m.nome}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={SELECT}>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Saúde</label>
                  <select value={form.saude} onChange={e => setForm(f => ({ ...f, saude: e.target.value }))} className={SELECT}>
                    {Object.entries(SAUDE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Data de início</label>
                  <input type="date" value={form.dataInicio} onChange={e => setForm(f => ({ ...f, dataInicio: e.target.value }))}
                    className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Prazo de entrega</label>
                  <input type="date" value={form.dataFim} onChange={e => setForm(f => ({ ...f, dataFim: e.target.value }))}
                    className={INPUT} />
                </div>
              </div>
              <div>
                <label className={LABEL}>Descrição</label>
                <textarea value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                  placeholder="Descreva o projeto…" rows={3}
                  className={`${INPUT} resize-none`} />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-[#1E1E1E]">
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM) }}
                className="flex-1 px-4 py-2 rounded border border-[#1E1E1E] text-gray-400 hover:text-white hover:border-gray-600 text-sm font-semibold transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={!form.nome.trim() || saving}
                className="flex-1 px-4 py-2 rounded bg-[#CE7028] hover:bg-[#B5611F] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors">
                Criar Projeto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-[#1E1E1E] rounded-md w-full max-w-sm shadow-2xl p-6 space-y-4">
            <h2 className="text-white font-bold text-base">Excluir projeto</h2>
            <p className="text-gray-400 text-sm">Tem certeza que deseja excluir <strong className="text-white">{showDelete.nome}</strong>? Essa ação é irreversível.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(null)}
                className="flex-1 px-4 py-2 rounded border border-[#1E1E1E] text-gray-400 hover:text-white text-sm font-semibold transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete}
                className="flex-1 px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
