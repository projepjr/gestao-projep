import { useState, useMemo } from 'react'
import {
  Target, AlertTriangle, CheckCircle2, Clock, TrendingUp,
  Plus, Trash2, Edit2, ChevronDown, ChevronUp, Save,
  BarChart2, Users, Calendar, Star,
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
  concluido:    { label: 'Concluído',    cls: 'bg-green-950/40 text-green-400 border border-green-900/30' },
  cancelado:    { label: 'Cancelado',    cls: 'bg-red-950/30 text-red-400 border border-red-900/20' },
}

function fmtDate(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) }
  catch { return iso }
}

function Badge({ cfg }) {
  if (!cfg) return null
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${cfg.cls}`}>{cfg.label}</span>
}

function KpiCard({ icon: Icon, label, value, sub, color = 'text-white', border }) {
  return (
    <div className={`bg-[#111111] border rounded-md px-5 py-4 ${border || 'border-[#1E1E1E]'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-[#CE7028]" />
        <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
      {sub && <p className="text-gray-600 text-xs mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Alertas ──────────────────────────────────────────────────

function AlertasPanel({ projects }) {
  const alerts = useMemo(() => {
    const list = []
    const now = new Date()
    projects.forEach(p => {
      if (p.saude === 'vermelho') {
        list.push({ severity: 'high', projeto: p.nome, id: p.id, msg: 'Projeto em risco' })
      }
      if (p.saude === 'amarelo') {
        list.push({ severity: 'medium', projeto: p.nome, id: p.id, msg: 'Projeto requer atenção' })
      }
      const tarefasAtrasadas = (p.tarefas || []).filter(t =>
        t.dataVencimento && t.status !== 'concluida' && new Date(t.dataVencimento) < now
      )
      if (tarefasAtrasadas.length > 0) {
        list.push({ severity: 'medium', projeto: p.nome, id: p.id, msg: `${tarefasAtrasadas.length} atividade(s) atrasada(s)` })
      }
      if (p.dataFim) {
        const dias = Math.ceil((new Date(p.dataFim) - now) / 86400000)
        if (dias >= 0 && dias <= 7 && p.status !== 'concluido') {
          list.push({ severity: 'low', projeto: p.nome, id: p.id, msg: `Prazo em ${dias}d` })
        }
        if (dias < 0 && p.status !== 'concluido') {
          list.push({ severity: 'high', projeto: p.nome, id: p.id, msg: `Prazo vencido há ${Math.abs(dias)}d` })
        }
      }
    })
    return list.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.severity] - { high: 0, medium: 1, low: 2 }[b.severity]))
  }, [projects])

  const SEV = {
    high:   { cls: 'border-red-900/30 bg-red-950/20', dot: 'bg-red-400', label: 'Crítico' },
    medium: { cls: 'border-yellow-900/20 bg-yellow-950/10', dot: 'bg-yellow-400', label: 'Atenção' },
    low:    { cls: 'border-blue-900/20 bg-blue-950/10', dot: 'bg-blue-400', label: 'Info' },
  }

  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-[#CE7028]" />
        <h3 className="text-white font-semibold text-sm">Alertas ativos</h3>
        {alerts.length > 0 && (
          <span className="ml-auto bg-red-950/40 border border-red-900/30 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
            {alerts.length}
          </span>
        )}
      </div>
      {alerts.length === 0 ? (
        <div className="py-8 text-center">
          <CheckCircle2 className="w-8 h-8 text-green-700 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">Nenhum alerta no momento</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((a, i) => {
            const cfg = SEV[a.severity]
            return (
              <div key={i} className={`border rounded px-3 py-2.5 flex items-start gap-3 ${cfg.cls}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} mt-1.5 flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium">{a.projeto}</p>
                  <p className="text-gray-500 text-xs">{a.msg}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${cfg.cls}`}>
                  {cfg.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Ranking ──────────────────────────────────────────────────

function RankingPanel({ projects, members }) {
  const ranking = useMemo(() => {
    const memberStats = {}
    projects.forEach(p => {
      const membros = p.membros || []
      membros.forEach(m => {
        if (!memberStats[m.userId]) {
          memberStats[m.userId] = {
            userId: m.userId,
            nome: m.nome || members.find(mb => String(mb.id) === String(m.userId))?.nome || '—',
            projetos: 0,
            tarefasConcluidas: 0,
            tarefasTotal: 0,
          }
        }
        memberStats[m.userId].projetos++
      })

      ;(p.tarefas || []).forEach(t => {
        if (!t.responsavelNome) return
        const match = Object.values(memberStats).find(ms => ms.nome === t.responsavelNome)
        if (match) {
          match.tarefasTotal++
          if (t.status === 'concluida') match.tarefasConcluidas++
        }
      })
    })

    return Object.values(memberStats)
      .map(m => ({ ...m, taxa: m.tarefasTotal > 0 ? Math.round((m.tarefasConcluidas / m.tarefasTotal) * 100) : 0 }))
      .sort((a, b) => b.taxa - a.taxa || b.tarefasConcluidas - a.tarefasConcluidas)
      .slice(0, 10)
  }, [projects, members])

  const MEDAL = { 0: '🥇', 1: '🥈', 2: '🥉' }
  const AVATAR_COLORS = ['#3D5A80','#2A6B69','#7B2D8B','#1A3A5C','#5C3A1A','#4A5C1A']
  const avatarColor = id => AVATAR_COLORS[Number(String(id).replace(/\D/g, '').slice(-3) || 0) % AVATAR_COLORS.length]

  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-4 h-4 text-[#CE7028]" />
        <h3 className="text-white font-semibold text-sm">Ranking de membros</h3>
      </div>
      {ranking.length === 0 ? (
        <div className="py-8 text-center">
          <Users className="w-8 h-8 text-gray-700 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">Nenhum dado disponível</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ranking.map((m, i) => (
            <div key={m.userId} className="flex items-center gap-3 group">
              <span className="text-sm w-6 text-center flex-shrink-0">{MEDAL[i] || <span className="text-gray-600 text-xs">{i + 1}</span>}</span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: avatarColor(m.userId) }}>
                {(m.nome || '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-white text-xs font-medium truncate">{m.nome}</p>
                  <span className="text-[#FF882D] text-xs font-bold tabular-nums ml-2">{m.taxa}%</span>
                </div>
                <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#CE7028] transition-all" style={{ width: `${m.taxa}%` }} />
                </div>
                <p className="text-gray-700 text-[10px] mt-0.5">{m.tarefasConcluidas}/{m.tarefasTotal} atividades · {m.projetos} projeto(s)</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Revisão Semanal ──────────────────────────────────────────

function RevisoesSemana({ revisoesSemana, addRevisaoSemana, updateRevisaoSemana, deleteRevisaoSemana, projects, user }) {
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ semana: '', projetoId: '', resumo: '', conquistas: '', desafios: '', proximosPassos: '', notaGeral: 3 })

  const resetForm = () => {
    setForm({ semana: '', projetoId: '', resumo: '', conquistas: '', desafios: '', proximosPassos: '', notaGeral: 3 })
    setEditId(null)
    setShowForm(false)
  }

  const handleSave = () => {
    if (!form.semana) return
    if (editId) {
      updateRevisaoSemana(editId, { ...form, autorNome: user?.nome || '' })
    } else {
      addRevisaoSemana({ ...form, autorId: user?.id, autorNome: user?.nome || '' })
    }
    resetForm()
  }

  const handleEdit = (r) => {
    setForm({ semana: r.semana, projetoId: r.projetoId || '', resumo: r.resumo || '', conquistas: r.conquistas || '', desafios: r.desafios || '', proximosPassos: r.proximosPassos || '', notaGeral: r.notaGeral || 3 })
    setEditId(r.id)
    setShowForm(true)
  }

  const projetoNome = (id) => projects.find(p => String(p.id) === String(id))?.nome || '—'

  const NOTA_COLORS = { 1: 'text-red-400', 2: 'text-orange-400', 3: 'text-yellow-400', 4: 'text-blue-400', 5: 'text-green-400' }

  const sorted = [...(revisoesSemana || [])].sort((a, b) => new Date(b.semana) - new Date(a.semana))

  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#CE7028]" />
          <h3 className="text-white font-semibold text-sm">Revisões semanais</h3>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-1 bg-[#CE7028] hover:bg-[#B5611F] text-white text-xs font-semibold px-2.5 py-1.5 rounded transition-colors">
          <Plus className="w-3 h-3" /> Nova revisão
        </button>
      </div>

      {showForm && (
        <div className="bg-[#0D0D0D] border border-[#CE7028]/30 rounded-md p-4 mb-4 space-y-3">
          <h4 className="text-white font-semibold text-sm">{editId ? 'Editar revisão' : 'Nova revisão semanal'}</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Semana *</label>
              <input type="date" value={form.semana} onChange={e => setForm(f => ({ ...f, semana: e.target.value }))} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Projeto (opcional)</label>
              <select value={form.projetoId} onChange={e => setForm(f => ({ ...f, projetoId: e.target.value }))} className={SELECT}>
                <option value="">Geral (todos)</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={LABEL}>Resumo</label>
            <textarea value={form.resumo} onChange={e => setForm(f => ({ ...f, resumo: e.target.value }))}
              placeholder="Visão geral da semana…" rows={2} className={`${INPUT} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Conquistas</label>
              <textarea value={form.conquistas} onChange={e => setForm(f => ({ ...f, conquistas: e.target.value }))}
                placeholder="O que foi alcançado…" rows={3} className={`${INPUT} resize-none`} />
            </div>
            <div>
              <label className={LABEL}>Desafios</label>
              <textarea value={form.desafios} onChange={e => setForm(f => ({ ...f, desafios: e.target.value }))}
                placeholder="Obstáculos encontrados…" rows={3} className={`${INPUT} resize-none`} />
            </div>
          </div>
          <div>
            <label className={LABEL}>Próximos passos</label>
            <textarea value={form.proximosPassos} onChange={e => setForm(f => ({ ...f, proximosPassos: e.target.value }))}
              placeholder="Plano para próxima semana…" rows={2} className={`${INPUT} resize-none`} />
          </div>
          <div>
            <label className={LABEL}>Nota geral da semana</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setForm(f => ({ ...f, notaGeral: n }))}
                  className={`w-9 h-9 rounded font-bold text-sm border transition-all ${
                    form.notaGeral === n
                      ? 'bg-[#CE7028] border-[#CE7028] text-white'
                      : 'border-[#1E1E1E] text-gray-500 hover:border-gray-500'
                  }`}>
                  {n}
                </button>
              ))}
              <span className={`text-sm font-medium ml-1 ${NOTA_COLORS[form.notaGeral]}`}>
                {['', 'Muito ruim', 'Ruim', 'Regular', 'Boa', 'Excelente'][form.notaGeral]}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={resetForm} className="px-4 py-2 rounded border border-[#1E1E1E] text-gray-400 hover:text-white text-xs font-semibold transition-colors">Cancelar</button>
            <button onClick={handleSave} disabled={!form.semana}
              className="px-4 py-2 rounded bg-[#CE7028] hover:bg-[#B5611F] disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center gap-1.5">
              <Save className="w-3 h-3" /> {editId ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="py-10 text-center">
          <Calendar className="w-8 h-8 text-gray-700 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">Nenhuma revisão registrada</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map(r => {
            const expanded = expandedId === r.id
            return (
              <div key={r.id} className="border border-[#1E1E1E] rounded-md overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors group"
                  onClick={() => setExpandedId(expanded ? null : r.id)}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold border ${NOTA_COLORS[r.notaGeral] || 'text-gray-400'} border-current/20 bg-current/5`}
                      style={{ color: ({ 1: '#f87171', 2: '#fb923c', 3: '#facc15', 4: '#60a5fa', 5: '#4ade80' })[r.notaGeral] }}>
                      {r.notaGeral}
                    </div>
                    <div className="text-left">
                      <p className="text-white text-sm font-medium">Semana de {fmtDate(r.semana)}</p>
                      <p className="text-gray-600 text-xs">{r.projetoId ? projetoNome(r.projetoId) : 'Todos os projetos'} · {r.autorNome}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={e => { e.stopPropagation(); handleEdit(r) }}
                      className="p-1.5 rounded text-gray-600 hover:text-[#FF882D] hover:bg-[#CE7028]/10 transition-all">
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); deleteRevisaoSemana(r.id) }}
                      className="p-1.5 rounded text-gray-600 hover:text-red-400 hover:bg-red-950/30 transition-all">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  {expanded ? <ChevronUp className="w-4 h-4 text-gray-600 ml-1" /> : <ChevronDown className="w-4 h-4 text-gray-600 ml-1" />}
                </button>
                {expanded && (
                  <div className="px-4 pb-4 border-t border-[#1E1E1E] pt-3 space-y-3">
                    {r.resumo && (
                      <div>
                        <p className="text-gray-600 text-[10px] font-bold uppercase tracking-wider mb-1">Resumo</p>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{r.resumo}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      {r.conquistas && (
                        <div>
                          <p className="text-green-600 text-[10px] font-bold uppercase tracking-wider mb-1">Conquistas</p>
                          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{r.conquistas}</p>
                        </div>
                      )}
                      {r.desafios && (
                        <div>
                          <p className="text-yellow-600 text-[10px] font-bold uppercase tracking-wider mb-1">Desafios</p>
                          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{r.desafios}</p>
                        </div>
                      )}
                    </div>
                    {r.proximosPassos && (
                      <div>
                        <p className="text-blue-600 text-[10px] font-bold uppercase tracking-wider mb-1">Próximos passos</p>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{r.proximosPassos}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Visão geral projetos ─────────────────────────────────────

function ProjetosOverview({ projects }) {
  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="w-4 h-4 text-[#CE7028]" />
        <h3 className="text-white font-semibold text-sm">Status dos projetos</h3>
      </div>
      {projects.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-gray-600 text-sm">Nenhum projeto cadastrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(p => {
            const saudeCfg = SAUDE_CONFIG[p.saude] || SAUDE_CONFIG.verde
            const statusCfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.em_andamento
            const pct = p.percentualConcluido || 0
            const tarefas = p.tarefas || []
            const concluidas = tarefas.filter(t => t.status === 'concluida').length
            return (
              <div key={p.id} className="border border-[#1E1E1E] rounded px-3 py-2.5 hover:border-[#CE7028]/20 transition-colors">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <p className="text-white text-sm font-medium truncate flex-1">{p.nome}</p>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Badge cfg={statusCfg} />
                    <Badge cfg={saudeCfg} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#CE7028] transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-gray-500 text-[10px] tabular-nums w-8 text-right">{pct}%</span>
                  {tarefas.length > 0 && (
                    <span className="text-gray-700 text-[10px] tabular-nums whitespace-nowrap">{concluidas}/{tarefas.length}</span>
                  )}
                  {p.dataFim && (
                    <span className="text-gray-700 text-[10px] whitespace-nowrap">{fmtDate(p.dataFim)}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────

export default function Coordenador() {
  const { user } = useAuth()
  const {
    projects,
    members,
    revisoesSemana,
    addRevisaoSemana,
    updateRevisaoSemana,
    deleteRevisaoSemana,
  } = useData()

  const allProjects = projects || []
  const allMembers = members || []

  const stats = useMemo(() => {
    const total = allProjects.length
    const em_andamento = allProjects.filter(p => p.status === 'em_andamento').length
    const em_risco = allProjects.filter(p => p.saude === 'vermelho').length
    const concluidos = allProjects.filter(p => p.status === 'concluido').length
    const tarefas = allProjects.flatMap(p => p.tarefas || [])
    const tarefasConcluidas = tarefas.filter(t => t.status === 'concluida').length
    return { total, em_andamento, em_risco, concluidos, tarefasTotal: tarefas.length, tarefasConcluidas }
  }, [allProjects])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-md bg-[#CE7028]/10 border border-[#CE7028]/20 flex items-center justify-center">
            <Target className="w-4 h-4 text-[#CE7028]" />
          </div>
          <h1 className="text-xl font-bold text-white">Área do Coordenador</h1>
        </div>
        <p className="text-gray-600 text-sm pl-12">Visão geral, alertas e acompanhamento semanal de projetos</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={BarChart2} label="Total de projetos" value={stats.total} />
        <KpiCard icon={TrendingUp} label="Em andamento" value={stats.em_andamento} color="text-[#FF882D]" />
        <KpiCard icon={AlertTriangle} label="Em risco" value={stats.em_risco}
          color={stats.em_risco > 0 ? 'text-red-400' : 'text-gray-400'} border={stats.em_risco > 0 ? 'border-red-900/20' : undefined} />
        <KpiCard icon={CheckCircle2} label="Concluídos" value={stats.concluidos} color="text-green-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Alertas + Ranking (col 1+2) */}
        <div className="lg:col-span-1 space-y-4">
          <AlertasPanel projects={allProjects} />
          <RankingPanel projects={allProjects} members={allMembers} />
        </div>

        {/* Status overview + Revisoes (col 3) */}
        <div className="lg:col-span-2 space-y-4">
          <ProjetosOverview projects={allProjects} />
          <RevisoesSemana
            revisoesSemana={revisoesSemana}
            addRevisaoSemana={addRevisaoSemana}
            updateRevisaoSemana={updateRevisaoSemana}
            deleteRevisaoSemana={deleteRevisaoSemana}
            projects={allProjects}
            user={user}
          />
        </div>
      </div>
    </div>
  )
}
