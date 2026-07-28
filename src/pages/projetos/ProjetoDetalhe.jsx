import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, FolderKanban, Plus, X, Edit2, Trash2,
  CheckCircle2, Clock, AlertTriangle, Users, Calendar,
  FileText, BarChart2, Activity, MessageSquare, File,
  ChevronRight, Circle, MoreHorizontal, Save,
} from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { useAuth } from '../../contexts/AuthContext'

const INPUT = 'w-full bg-[#0D0D0D] border border-[#1E1E1E] rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#CE7028] transition-colors placeholder-gray-700'
const LABEL = 'text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block'
const SELECT = `${INPUT} cursor-pointer`

const SAUDE_CONFIG = {
  verde:    { label: 'No prazo',  cls: 'bg-green-950/40 text-green-400 border border-green-900/30' },
  amarelo:  { label: 'Atenção',  cls: 'bg-yellow-950/30 text-yellow-400 border border-yellow-900/20' },
  vermelho: { label: 'Em risco', cls: 'bg-red-950/30 text-red-400 border border-red-900/20' },
}
const STATUS_CONFIG = {
  planejado:    { label: 'Planejado',    cls: 'bg-blue-950/30 text-blue-400 border border-blue-900/20' },
  em_andamento: { label: 'Em andamento', cls: 'bg-[#CE7028]/10 text-[#FF882D] border border-[#CE7028]/30' },
  pausado:      { label: 'Pausado',      cls: 'bg-gray-800/60 text-gray-400 border border-gray-700/30' },
  concluida:    { label: 'Concluída',    cls: 'bg-green-950/40 text-green-400 border border-green-900/30' },
  concluido:    { label: 'Concluído',    cls: 'bg-green-950/40 text-green-400 border border-green-900/30' },
  cancelado:    { label: 'Cancelado',    cls: 'bg-red-950/30 text-red-400 border border-red-900/20' },
  pendente:     { label: 'Pendente',     cls: 'bg-gray-800/60 text-gray-500 border border-gray-700/30' },
  em_progresso: { label: 'Em progresso', cls: 'bg-blue-950/30 text-blue-400 border border-blue-900/20' },
}
const PRIORIDADE_CONFIG = {
  baixa:  { label: 'Baixa',  cls: 'text-gray-400' },
  media:  { label: 'Média',  cls: 'text-yellow-400' },
  alta:   { label: 'Alta',   cls: 'text-orange-400' },
  critica: { label: 'Crítica', cls: 'text-red-400' },
}

const TABS = [
  { id: 'resumo',      label: 'Resumo',      Icon: BarChart2 },
  { id: 'atividades',  label: 'Atividades',  Icon: CheckCircle2 },
  { id: 'cronograma',  label: 'Cronograma',  Icon: Calendar },
  { id: 'equipe',      label: 'Equipe',      Icon: Users },
  { id: 'observacoes', label: 'Observações', Icon: MessageSquare },
  { id: 'historico',   label: 'Histórico',   Icon: Activity },
  { id: 'arquivos',    label: 'Arquivos',    Icon: File },
  { id: 'indicadores', label: 'Indicadores', Icon: BarChart2 },
  { id: 'timeline',    label: 'Timeline',    Icon: Clock },
]

function fmtDate(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) }
  catch { return iso }
}

function fmtDateTime(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
  catch { return iso }
}

function Badge({ cfg }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${cfg?.cls || ''}`}>{cfg?.label || ''}</span>
}

function KpiCard({ icon: Icon, label, value, sub, color = 'text-white' }) {
  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-md px-5 py-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-[#CE7028]" />
        <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
      {sub && <p className="text-gray-600 text-xs mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Tabs ──────────────────────────────────────────────────────

function ResumoTab({ project, members }) {
  const tarefas = project.tarefas || []
  const concluidas = tarefas.filter(t => t.status === 'concluida').length
  const atrasadas = tarefas.filter(t => {
    if (!t.dataVencimento || t.status === 'concluida') return false
    return new Date(t.dataVencimento) < new Date()
  }).length
  const diasRestantes = project.dataFim
    ? Math.ceil((new Date(project.dataFim) - new Date()) / 86400000)
    : null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={BarChart2} label="Progresso" value={`${project.percentualConcluido || 0}%`}
          color={project.percentualConcluido >= 80 ? 'text-green-400' : 'text-[#FF882D]'} />
        <KpiCard icon={CheckCircle2} label="Concluídas"
          value={`${concluidas}/${tarefas.length}`} sub="atividades" color="text-green-400" />
        <KpiCard icon={AlertTriangle} label="Atrasadas" value={atrasadas}
          color={atrasadas > 0 ? 'text-red-400' : 'text-gray-400'} />
        <KpiCard icon={Clock} label="Dias restantes"
          value={diasRestantes !== null ? (diasRestantes < 0 ? `${Math.abs(diasRestantes)}d atrasado` : `${diasRestantes}d`) : '—'}
          color={diasRestantes !== null && diasRestantes < 0 ? 'text-red-400' : diasRestantes !== null && diasRestantes <= 7 ? 'text-yellow-400' : 'text-white'} />
      </div>

      <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5 space-y-3">
        <h3 className="text-white font-semibold text-sm">Informações do projeto</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div><span className="text-gray-500">Cliente:</span> <span className="text-gray-300 ml-2">{project.clienteNome || '—'}</span></div>
          <div><span className="text-gray-500">Gerente:</span> <span className="text-gray-300 ml-2">{project.responsavelNome || members.find(m => m.id === project.responsavelId)?.nome || '—'}</span></div>
          <div><span className="text-gray-500">Fase:</span> <span className="text-gray-300 ml-2">{project.fase || '—'}</span></div>
          <div><span className="text-gray-500">Início:</span> <span className="text-gray-300 ml-2">{fmtDate(project.dataInicio)}</span></div>
          <div><span className="text-gray-500">Prazo:</span> <span className="text-gray-300 ml-2">{fmtDate(project.dataFim)}</span></div>
          <div><span className="text-gray-500">Membros:</span> <span className="text-gray-300 ml-2">{(project.membros || []).length}</span></div>
        </div>
        {project.descricao && (
          <div className="pt-2 border-t border-[#1E1E1E]">
            <p className="text-gray-500 text-xs mb-1">Descrição</p>
            <p className="text-gray-300 text-sm leading-relaxed">{project.descricao}</p>
          </div>
        )}
      </div>

      <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5">
        <h3 className="text-white font-semibold text-sm mb-3">Progresso geral</h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 bg-[#1A1A1A] rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-[#CE7028] transition-all"
              style={{ width: `${project.percentualConcluido || 0}%` }} />
          </div>
          <span className="text-white font-bold text-sm tabular-nums w-10 text-right">{project.percentualConcluido || 0}%</span>
        </div>
        {tarefas.length > 0 && (
          <div className="mt-3 flex gap-4 text-xs">
            <span className="text-green-400">{concluidas} concluídas</span>
            <span className="text-gray-500">{tarefas.length - concluidas} pendentes</span>
            {atrasadas > 0 && <span className="text-red-400">{atrasadas} atrasadas</span>}
          </div>
        )}
      </div>
    </div>
  )
}

function AtividadesTab({ project, updateProject, addTarefa, updateTarefa, deleteTarefa, addHistoricoEntry, user }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ nome: '', status: 'pendente', prioridade: 'media', dataVencimento: '', responsavelNome: '', fase: '' })
  const [filterStatus, setFilterStatus] = useState('')

  const tarefas = project.tarefas || []
  const filtered = filterStatus ? tarefas.filter(t => t.status === 'filterStatus') : tarefas

  const resetForm = () => {
    setForm({ nome: '', status: 'pendente', prioridade: 'media', dataVencimento: '', responsavelNome: '', fase: '' })
    setEditId(null)
    setShowForm(false)
  }

  const handleSave = () => {
    if (!form.nome.trim()) return
    if (editId) {
      updateTarefa(project.id, editId, form)
      addHistoricoEntry(project.id, { acao: 'Atividade atualizada', detalhes: form.nome, usuarioNome: user?.nome || 'Sistema' })
    } else {
      addTarefa(project.id, form)
      addHistoricoEntry(project.id, { acao: 'Atividade adicionada', detalhes: form.nome, usuarioNome: user?.nome || 'Sistema' })
    }
    // Recalc progress
    const totalAfter = editId ? tarefas.length : tarefas.length + 1
    const doneAfter = tarefas.filter(t => {
      if (idsEqual(t.id, editId)) return form.status === 'concluida'
      return t.status === 'concluida'
    }).length + (editId ? 0 : form.status === 'concluida' ? 1 : 0)
    if (totalAfter > 0) updateProject(project.id, { percentualConcluido: Math.round((doneAfter / totalAfter) * 100) })
    resetForm()
  }

  const handleToggle = (tarefa) => {
    const newStatus = tarefa.status === 'concluida' ? 'pendente' : 'concluida'
    updateTarefa(project.id, tarefa.id, { status: newStatus })
    const tarefasUpdated = tarefas.map(t => idsEqual(t.id, tarefa.id) ? { ...t, status: newStatus } : t)
    const done = tarefasUpdated.filter(t => t.status === 'concluida').length
    updateProject(project.id, { percentualConcluido: tarefas.length > 0 ? Math.round((done / tarefas.length) * 100) : 0 })
  }

  const handleEdit = (t) => {
    setForm({ nome: t.nome, status: t.status, prioridade: t.prioridade || 'media', dataVencimento: t.dataVencimento || '', responsavelNome: t.responsavelNome || '', fase: t.fase || '' })
    setEditId(t.id)
    setShowForm(true)
  }

  const idsEqual = (a, b) => String(a ?? '') === String(b ?? '')
  const statusList = ['pendente', 'em_progresso', 'concluida']
  const displayList = filterStatus ? tarefas.filter(t => t.status === filterStatus) : tarefas

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['', 'pendente', 'em_progresso', 'concluida'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${filterStatus === s ? 'bg-[#CE7028] text-white' : 'bg-[#1A1A1A] text-gray-500 hover:text-white'}`}>
              {s === '' ? 'Todas' : (STATUS_CONFIG[s]?.label || s)}
            </button>
          ))}
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-1.5 bg-[#CE7028] hover:bg-[#B5611F] text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nova atividade
        </button>
      </div>

      {showForm && (
        <div className="bg-[#0D0D0D] border border-[#CE7028]/30 rounded-md p-4 space-y-3">
          <h4 className="text-white font-semibold text-sm">{editId ? 'Editar atividade' : 'Nova atividade'}</h4>
          <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
            placeholder="Nome da atividade *" className={INPUT} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={SELECT}>
                {statusList.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Prioridade</label>
              <select value={form.prioridade} onChange={e => setForm(f => ({ ...f, prioridade: e.target.value }))} className={SELECT}>
                {Object.entries(PRIORIDADE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Fase</label>
              <input value={form.fase} onChange={e => setForm(f => ({ ...f, fase: e.target.value }))}
                placeholder="Ex: Desenvolvimento" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Prazo</label>
              <input type="date" value={form.dataVencimento} onChange={e => setForm(f => ({ ...f, dataVencimento: e.target.value }))} className={INPUT} />
            </div>
          </div>
          <div>
            <label className={LABEL}>Responsável</label>
            <input value={form.responsavelNome} onChange={e => setForm(f => ({ ...f, responsavelNome: e.target.value }))}
              placeholder="Nome do responsável" className={INPUT} />
          </div>
          <div className="flex gap-2">
            <button onClick={resetForm} className="px-4 py-2 rounded border border-[#1E1E1E] text-gray-400 hover:text-white text-xs font-semibold transition-colors">Cancelar</button>
            <button onClick={handleSave} disabled={!form.nome.trim()}
              className="px-4 py-2 rounded bg-[#CE7028] hover:bg-[#B5611F] disabled:opacity-50 text-white text-xs font-semibold transition-colors">
              {editId ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </div>
      )}

      {displayList.length === 0 ? (
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-md py-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Nenhuma atividade {filterStatus ? 'com esse status' : 'cadastrada'}</p>
        </div>
      ) : (
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E1E1E]">
                <th className="text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider px-4 py-3 w-8"></th>
                <th className="text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider px-4 py-3">Atividade</th>
                <th className="text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider px-4 py-3">Prioridade</th>
                <th className="text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider px-4 py-3">Fase</th>
                <th className="text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider px-4 py-3">Prazo</th>
                <th className="text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider px-4 py-3">Responsável</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E1E]">
              {displayList.map(t => {
                const atrasada = t.dataVencimento && t.status !== 'concluida' && new Date(t.dataVencimento) < new Date()
                return (
                  <tr key={t.id} className="hover:bg-white/[0.02] group">
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggle(t)} className="text-gray-600 hover:text-[#CE7028] transition-colors">
                        {t.status === 'concluida'
                          ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                          : <Circle className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`text-sm font-medium ${t.status === 'concluida' ? 'line-through text-gray-600' : 'text-white'}`}>{t.nome}</p>
                    </td>
                    <td className="px-4 py-3"><Badge cfg={STATUS_CONFIG[t.status] || STATUS_CONFIG.pendente} /></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${PRIORIDADE_CONFIG[t.prioridade]?.cls || 'text-gray-500'}`}>
                        {PRIORIDADE_CONFIG[t.prioridade]?.label || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{t.fase || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${atrasada ? 'text-red-400' : 'text-gray-400'}`}>{fmtDate(t.dataVencimento)}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{t.responsavelNome || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(t)} className="p-1.5 rounded text-gray-600 hover:text-[#FF882D] hover:bg-[#CE7028]/10 transition-all">
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button onClick={() => deleteTarefa(project.id, t.id)} className="p-1.5 rounded text-gray-600 hover:text-red-400 hover:bg-red-950/30 transition-all">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function CronogramaTab({ project, addEtapa, updateEtapa, deleteEtapa }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nome: '', dataInicio: '', dataFim: '', dataFimEstimada: '', status: 'planejado' })

  const etapas = project.etapas || []

  const handleSave = () => {
    if (!form.nome.trim()) return
    addEtapa(project.id, form)
    setForm({ nome: '', dataInicio: '', dataFim: '', dataFimEstimada: '', status: 'planejado' })
    setShowForm(false)
  }

  const desvio = (etapa) => {
    if (!etapa.dataFim || !etapa.dataFimEstimada) return null
    const planejado = new Date(etapa.dataFim)
    const estimado = new Date(etapa.dataFimEstimada)
    return Math.ceil((estimado - planejado) / 86400000)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 bg-[#CE7028] hover:bg-[#B5611F] text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nova etapa
        </button>
      </div>

      {showForm && (
        <div className="bg-[#0D0D0D] border border-[#CE7028]/30 rounded-md p-4 space-y-3">
          <h4 className="text-white font-semibold text-sm">Nova etapa</h4>
          <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
            placeholder="Nome da etapa *" className={INPUT} />
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={LABEL}>Início</label>
              <input type="date" value={form.dataInicio} onChange={e => setForm(f => ({ ...f, dataInicio: e.target.value }))} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Fim planejado</label>
              <input type="date" value={form.dataFim} onChange={e => setForm(f => ({ ...f, dataFim: e.target.value }))} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Previsão atual</label>
              <input type="date" value={form.dataFimEstimada} onChange={e => setForm(f => ({ ...f, dataFimEstimada: e.target.value }))} className={INPUT} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded border border-[#1E1E1E] text-gray-400 hover:text-white text-xs font-semibold transition-colors">Cancelar</button>
            <button onClick={handleSave} disabled={!form.nome.trim()} className="px-4 py-2 rounded bg-[#CE7028] hover:bg-[#B5611F] disabled:opacity-50 text-white text-xs font-semibold transition-colors">Adicionar</button>
          </div>
        </div>
      )}

      {etapas.length === 0 ? (
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-md py-12 text-center">
          <Calendar className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Nenhuma etapa cadastrada</p>
        </div>
      ) : (
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E1E1E]">
                {['Etapa', 'Início', 'Fim Planejado', 'Previsão Atual', 'Desvio (dias)', ''].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E1E]">
              {etapas.map(e => {
                const d = desvio(e)
                return (
                  <tr key={e.id} className="hover:bg-white/[0.02] group">
                    <td className="px-4 py-3 text-white font-medium text-sm">{e.nome}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{fmtDate(e.dataInicio)}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{fmtDate(e.dataFim)}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{fmtDate(e.dataFimEstimada)}</td>
                    <td className="px-4 py-3">
                      {d !== null ? (
                        <span className={`text-sm font-medium ${d > 0 ? 'text-red-400' : d < 0 ? 'text-green-400' : 'text-gray-400'}`}>
                          {d > 0 ? `+${d}d` : d < 0 ? `${d}d` : '—'}
                        </span>
                      ) : <span className="text-gray-700">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteEtapa(project.id, e.id)}
                        className="p-1.5 rounded text-gray-700 hover:text-red-400 hover:bg-red-950/30 transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function EquipeTab({ project, members, updateProject }) {
  const [showForm, setShowForm] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [papel, setPapel] = useState('')

  const teamIds = new Set((project.membros || []).map(m => String(m.userId)))
  const available = members.filter(m => m.status === 'ativo' && !teamIds.has(String(m.id)))

  const handleAdd = () => {
    if (!selectedMemberId) return
    const member = members.find(m => m.id === selectedMemberId)
    const next = [...(project.membros || []), { userId: selectedMemberId, nome: member?.nome || '', papel }]
    updateProject(project.id, { membros: next })
    setSelectedMemberId('')
    setPapel('')
    setShowForm(false)
  }

  const handleRemove = (userId) => {
    updateProject(project.id, { membros: (project.membros || []).filter(m => String(m.userId) !== String(userId)) })
  }

  const AVATAR_COLORS = ['#3D5A80','#2A6B69','#7B2D8B','#1A3A5C','#5C3A1A','#4A5C1A']
  const avatarColor = id => AVATAR_COLORS[Number(String(id).replace(/\D/g, '').slice(-3) || 0) % AVATAR_COLORS.length]

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 bg-[#CE7028] hover:bg-[#B5611F] text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors">
          <Plus className="w-3.5 h-3.5" /> Adicionar membro
        </button>
      </div>

      {showForm && (
        <div className="bg-[#0D0D0D] border border-[#CE7028]/30 rounded-md p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Membro</label>
              <select value={selectedMemberId} onChange={e => setSelectedMemberId(e.target.value)} className={SELECT}>
                <option value="">Selecionar</option>
                {available.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Papel no projeto</label>
              <input value={papel} onChange={e => setPapel(e.target.value)} placeholder="Ex: Dev. Backend" className={INPUT} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded border border-[#1E1E1E] text-gray-400 hover:text-white text-xs font-semibold transition-colors">Cancelar</button>
            <button onClick={handleAdd} disabled={!selectedMemberId} className="px-4 py-2 rounded bg-[#CE7028] hover:bg-[#B5611F] disabled:opacity-50 text-white text-xs font-semibold transition-colors">Adicionar</button>
          </div>
        </div>
      )}

      {(project.membros || []).length === 0 ? (
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-md py-12 text-center">
          <Users className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Nenhum membro na equipe</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(project.membros || []).map(m => (
            <div key={m.userId} className="bg-[#111111] border border-[#1E1E1E] rounded-md p-4 flex items-center gap-3 group hover:border-[#CE7028]/20 transition-colors">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: avatarColor(m.userId) }}>
                {(m.nome || '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{m.nome}</p>
                <p className="text-gray-600 text-xs truncate">{m.papel || 'Membro'}</p>
              </div>
              <button onClick={() => handleRemove(m.userId)}
                className="p-1.5 rounded text-gray-700 hover:text-red-400 hover:bg-red-950/30 transition-all opacity-0 group-hover:opacity-100">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ObservacoesTab({ project, addObservacao, updateObservacao, deleteObservacao, user }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ titulo: '', conteudo: '' })

  const obs = project.observacoes || []

  const resetForm = () => { setForm({ titulo: '', conteudo: '' }); setEditId(null); setShowForm(false) }

  const handleSave = () => {
    if (!form.titulo.trim()) return
    if (editId) {
      updateObservacao(project.id, editId, form)
    } else {
      addObservacao(project.id, { ...form, autorNome: user?.nome || '', autorId: user?.id })
    }
    resetForm()
  }

  const handleEdit = (o) => {
    setForm({ titulo: o.titulo, conteudo: o.conteudo })
    setEditId(o.id)
    setShowForm(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-1.5 bg-[#CE7028] hover:bg-[#B5611F] text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nova observação
        </button>
      </div>

      {showForm && (
        <div className="bg-[#0D0D0D] border border-[#CE7028]/30 rounded-md p-4 space-y-3">
          <h4 className="text-white font-semibold text-sm">{editId ? 'Editar observação' : 'Nova observação'}</h4>
          <input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
            placeholder="Título *" className={INPUT} />
          <textarea value={form.conteudo} onChange={e => setForm(f => ({ ...f, conteudo: e.target.value }))}
            placeholder="Conteúdo da observação…" rows={4} className={`${INPUT} resize-none`} />
          <div className="flex gap-2">
            <button onClick={resetForm} className="px-4 py-2 rounded border border-[#1E1E1E] text-gray-400 hover:text-white text-xs font-semibold transition-colors">Cancelar</button>
            <button onClick={handleSave} disabled={!form.titulo.trim()}
              className="px-4 py-2 rounded bg-[#CE7028] hover:bg-[#B5611F] disabled:opacity-50 text-white text-xs font-semibold transition-colors">
              {editId ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </div>
      )}

      {obs.length === 0 ? (
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-md py-12 text-center">
          <MessageSquare className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Nenhuma observação registrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {obs.map(o => (
            <div key={o.id} className="bg-[#111111] border border-[#1E1E1E] rounded-md p-4 group hover:border-[#CE7028]/20 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{o.titulo}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-gray-600 text-xs">{o.autorNome || 'Sistema'}</span>
                    <span className="text-gray-700 text-xs">{fmtDateTime(o.criadoEm)}</span>
                    {o.editadoEm && <span className="text-gray-700 text-xs">(editado)</span>}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(o)} className="p-1.5 rounded text-gray-600 hover:text-[#FF882D] hover:bg-[#CE7028]/10 transition-all">
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button onClick={() => deleteObservacao(project.id, o.id)} className="p-1.5 rounded text-gray-600 hover:text-red-400 hover:bg-red-950/30 transition-all">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              {o.conteudo && <p className="text-gray-400 text-sm mt-2 leading-relaxed whitespace-pre-wrap">{o.conteudo}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function HistoricoTab({ project }) {
  const historico = project.historico || []
  return (
    <div>
      {historico.length === 0 ? (
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-md py-12 text-center">
          <Activity className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Nenhuma alteração registrada</p>
        </div>
      ) : (
        <div className="space-y-2">
          {historico.map(h => (
            <div key={h.id} className="bg-[#111111] border border-[#1E1E1E] rounded-md px-4 py-3 flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#CE7028] mt-2 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{h.acao}</p>
                {h.detalhes && <p className="text-gray-500 text-xs mt-0.5">{h.detalhes}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-gray-600 text-xs">{fmtDateTime(h.criadoEm)}</p>
                {h.usuarioNome && <p className="text-gray-700 text-xs">{h.usuarioNome}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ArquivosTab() {
  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-md py-16 text-center">
      <File className="w-12 h-12 text-gray-700 mx-auto mb-4" />
      <p className="text-gray-500 font-semibold text-sm">Gerenciamento de arquivos</p>
      <p className="text-gray-700 text-xs mt-1">Integração com armazenamento em breve</p>
    </div>
  )
}

function IndicadoresTab({ project }) {
  const tarefas = project.tarefas || []
  const total = tarefas.length
  const concluidas = tarefas.filter(t => t.status === 'concluida').length
  const emProgresso = tarefas.filter(t => t.status === 'em_progresso').length
  const atrasadas = tarefas.filter(t => t.dataVencimento && t.status !== 'concluida' && new Date(t.dataVencimento) < new Date()).length

  const faseMap = {}
  tarefas.forEach(t => {
    const f = t.fase || 'Sem fase'
    if (!faseMap[f]) faseMap[f] = { total: 0, concluidas: 0 }
    faseMap[f].total++
    if (t.status === 'concluida') faseMap[f].concluidas++
  })

  const faseEntries = Object.entries(faseMap)
  const maxTotal = Math.max(...faseEntries.map(([, v]) => v.total), 1)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={CheckCircle2} label="Taxa de conclusão" value={total > 0 ? `${Math.round((concluidas / total) * 100)}%` : '—'} color="text-green-400" />
        <KpiCard icon={Activity} label="Em progresso" value={emProgresso} color="text-blue-400" />
        <KpiCard icon={AlertTriangle} label="Atrasadas" value={atrasadas} color={atrasadas > 0 ? 'text-red-400' : 'text-gray-400'} />
        <KpiCard icon={BarChart2} label="Total de atividades" value={total} />
      </div>

      {faseEntries.length > 0 && (
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Atividades por fase</h3>
          <div className="space-y-3">
            {faseEntries.map(([fase, data]) => (
              <div key={fase}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400 text-xs">{fase}</span>
                  <span className="text-gray-600 text-xs">{data.concluidas}/{data.total}</span>
                </div>
                <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#CE7028] transition-all"
                    style={{ width: `${Math.round((data.total / maxTotal) * 100)}%` }}>
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.round((data.concluidas / data.total) * 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TimelineTab({ project }) {
  const historico = project.historico || []
  const observacoes = project.observacoes || []
  const tarefasFeitas = (project.tarefas || []).filter(t => t.status === 'concluida')

  const events = [
    ...historico.map(h => ({ ...h, _type: 'log', ts: h.criadoEm })),
    ...observacoes.map(o => ({ id: o.id, _type: 'obs', titulo: o.titulo, usuarioNome: o.autorNome, ts: o.criadoEm })),
    ...(project.criadoEm ? [{ id: 'created', _type: 'created', ts: project.criadoEm }] : []),
  ].sort((a, b) => new Date(b.ts) - new Date(a.ts))

  const typeConfig = {
    log:     { color: 'bg-[#CE7028]', label: (e) => e.acao },
    obs:     { color: 'bg-blue-500', label: (e) => `Observação: ${e.titulo}` },
    created: { color: 'bg-green-500', label: () => 'Projeto criado' },
  }

  if (events.length === 0) {
    return (
      <div className="bg-[#111111] border border-[#1E1E1E] rounded-md py-12 text-center">
        <Clock className="w-10 h-10 text-gray-700 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Nenhum evento registrado</p>
      </div>
    )
  }

  return (
    <div className="relative pl-6">
      <div className="absolute left-2 top-0 bottom-0 w-px bg-[#1E1E1E]" />
      <div className="space-y-4">
        {events.map(e => {
          const cfg = typeConfig[e._type]
          return (
            <div key={`${e._type}-${e.id}`} className="relative">
              <div className={`absolute -left-[18px] w-2.5 h-2.5 rounded-full ${cfg.color} border-2 border-[#0A0A0A]`} />
              <div className="bg-[#111111] border border-[#1E1E1E] rounded-md px-4 py-3 ml-2">
                <p className="text-white text-sm">{cfg.label(e)}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  {e.usuarioNome && <span className="text-gray-600 text-xs">{e.usuarioNome}</span>}
                  <span className="text-gray-700 text-xs">{fmtDateTime(e.ts)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────

export default function ProjetoDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    projects, members,
    updateProject, deleteProject,
    addTarefa, updateTarefa, deleteTarefa,
    addEtapa, updateEtapa, deleteEtapa,
    addObservacao, updateObservacao, deleteObservacao,
    addHistoricoEntry,
  } = useData()

  const [activeTab, setActiveTab] = useState('resumo')
  const [editingProject, setEditingProject] = useState(false)
  const [editForm, setEditForm] = useState(null)

  const project = useMemo(() => (projects || []).find(p => String(p.id) === String(id)), [projects, id])

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <FolderKanban className="w-12 h-12 text-gray-700 mb-4" />
        <p className="text-gray-500 font-semibold">Projeto não encontrado</p>
        <button onClick={() => navigate('/projetos/gestao')} className="mt-4 text-[#CE7028] text-sm hover:underline">
          Voltar para Projetos
        </button>
      </div>
    )
  }

  const allMembers = members || []
  const saudeCfg = SAUDE_CONFIG[project.saude] || SAUDE_CONFIG.verde

  const startEdit = () => {
    setEditForm({
      nome: project.nome, clienteNome: project.clienteNome || '',
      status: project.status || 'em_andamento', saude: project.saude || 'verde',
      fase: project.fase || '', percentualConcluido: project.percentualConcluido || 0,
      dataInicio: project.dataInicio || '', dataFim: project.dataFim || '',
      descricao: project.descricao || '',
    })
    setEditingProject(true)
  }

  const saveEdit = () => {
    updateProject(project.id, editForm)
    addHistoricoEntry(project.id, { acao: 'Projeto atualizado', usuarioNome: user?.nome || 'Sistema' })
    setEditingProject(false)
  }

  const tabProps = {
    project, members: allMembers, user,
    updateProject, addTarefa, updateTarefa, deleteTarefa,
    addEtapa, updateEtapa, deleteEtapa,
    addObservacao, updateObservacao, deleteObservacao,
    addHistoricoEntry,
  }

  const TAB_CONTENT = {
    resumo:      <ResumoTab {...tabProps} />,
    atividades:  <AtividadesTab {...tabProps} />,
    cronograma:  <CronogramaTab {...tabProps} />,
    equipe:      <EquipeTab {...tabProps} />,
    observacoes: <ObservacoesTab {...tabProps} />,
    historico:   <HistoricoTab {...tabProps} />,
    arquivos:    <ArquivosTab />,
    indicadores: <IndicadoresTab {...tabProps} />,
    timeline:    <TimelineTab {...tabProps} />,
  }

  return (
    <div className="space-y-6 max-w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-gray-600 text-xs">
        <button onClick={() => navigate('/projetos/gestao')} className="hover:text-gray-400 transition-colors">Projetos</button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-400 truncate">{project.nome}</span>
      </div>

      {/* Header */}
      <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5">
        {editingProject ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Nome *</label>
                <input value={editForm.nome} onChange={e => setEditForm(f => ({ ...f, nome: e.target.value }))} className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Cliente</label>
                <input value={editForm.clienteNome} onChange={e => setEditForm(f => ({ ...f, clienteNome: e.target.value }))} className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Status</label>
                <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} className={SELECT}>
                  {Object.entries(STATUS_CONFIG).filter(([k]) => !['concluida', 'pendente', 'em_progresso'].includes(k)).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Saúde</label>
                <select value={editForm.saude} onChange={e => setEditForm(f => ({ ...f, saude: e.target.value }))} className={SELECT}>
                  {Object.entries(SAUDE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Fase</label>
                <input value={editForm.fase} onChange={e => setEditForm(f => ({ ...f, fase: e.target.value }))} className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Progresso (%)</label>
                <input type="number" min={0} max={100} value={editForm.percentualConcluido}
                  onChange={e => setEditForm(f => ({ ...f, percentualConcluido: Number(e.target.value) }))} className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Início</label>
                <input type="date" value={editForm.dataInicio} onChange={e => setEditForm(f => ({ ...f, dataInicio: e.target.value }))} className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Prazo</label>
                <input type="date" value={editForm.dataFim} onChange={e => setEditForm(f => ({ ...f, dataFim: e.target.value }))} className={INPUT} />
              </div>
            </div>
            <div>
              <label className={LABEL}>Descrição</label>
              <textarea value={editForm.descricao} onChange={e => setEditForm(f => ({ ...f, descricao: e.target.value }))}
                rows={2} className={`${INPUT} resize-none`} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditingProject(false)} className="px-4 py-2 rounded border border-[#1E1E1E] text-gray-400 hover:text-white text-sm font-semibold transition-colors">Cancelar</button>
              <button onClick={saveEdit} className="px-4 py-2 rounded bg-[#CE7028] hover:bg-[#B5611F] text-white text-sm font-semibold transition-colors flex items-center gap-2">
                <Save className="w-3.5 h-3.5" /> Salvar
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-11 h-11 rounded-md bg-[#CE7028]/10 border border-[#CE7028]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FolderKanban className="w-5 h-5 text-[#CE7028]" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-bold text-white tracking-tight">{project.nome}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    {project.status && <Badge cfg={STATUS_CONFIG[project.status] || STATUS_CONFIG.em_andamento} />}
                    <Badge cfg={saudeCfg} />
                    {project.fase && <span className="text-gray-600 text-xs">Fase: {project.fase}</span>}
                    {project.clienteNome && <span className="text-gray-600 text-xs">Cliente: {project.clienteNome}</span>}
                  </div>
                </div>
              </div>
              <button onClick={startEdit}
                className="flex items-center gap-1.5 text-gray-500 hover:text-white border border-[#1E1E1E] hover:border-gray-600 px-3 py-1.5 rounded text-xs font-semibold transition-all flex-shrink-0">
                <Edit2 className="w-3 h-3" /> Editar
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-2 bg-[#1A1A1A] rounded-full overflow-hidden max-w-xs">
                <div className="h-full rounded-full bg-[#CE7028] transition-all"
                  style={{ width: `${project.percentualConcluido || 0}%` }} />
              </div>
              <span className="text-white font-bold text-sm tabular-nums">{project.percentualConcluido || 0}%</span>
              <span className="text-gray-600 text-xs">concluído</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-[#1E1E1E]">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.Icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#CE7028] text-[#FF882D]'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div>{TAB_CONTENT[activeTab]}</div>
    </div>
  )
}
