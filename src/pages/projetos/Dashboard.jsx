import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, CheckCircle2, AlertTriangle, Clock, TrendingUp, Activity, BarChart2 } from 'lucide-react'
import { useData } from '../../contexts/DataContext'

const SAUDE_LABEL = { verde: 'No prazo', amarelo: 'Atenção', vermelho: 'Em risco' }

function KpiCard({ icon: Icon, label, value, sub, color = 'text-white', border, onClick }) {
  return (
    <div onClick={onClick}
      className={`bg-[#111111] border rounded-md px-5 py-4 ${border || 'border-[#1E1E1E]'} ${onClick ? 'cursor-pointer hover:border-[#CE7028]/30 transition-colors' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-[#CE7028]" />
        <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-3xl font-bold tabular-nums ${color}`}>{value}</p>
      {sub && <p className="text-gray-600 text-xs mt-0.5">{sub}</p>}
    </div>
  )
}

function HealthBar({ projects }) {
  const total = projects.length
  if (total === 0) return null
  const verde = projects.filter(p => p.saude === 'verde').length
  const amarelo = projects.filter(p => p.saude === 'amarelo').length
  const vermelho = projects.filter(p => p.saude === 'vermelho').length
  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-[#CE7028]" />
        <h3 className="text-white font-semibold text-sm">Saúde geral do portfólio</h3>
      </div>
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
        {verde > 0 && <div className="bg-green-500 transition-all" style={{ width: `${(verde / total) * 100}%` }} />}
        {amarelo > 0 && <div className="bg-yellow-400 transition-all" style={{ width: `${(amarelo / total) * 100}%` }} />}
        {vermelho > 0 && <div className="bg-red-500 transition-all" style={{ width: `${(vermelho / total) * 100}%` }} />}
      </div>
      <div className="flex items-center gap-6 mt-3">
        <span className="flex items-center gap-1.5 text-xs text-green-400"><span className="w-2 h-2 rounded-full bg-green-500" />{verde} no prazo</span>
        <span className="flex items-center gap-1.5 text-xs text-yellow-400"><span className="w-2 h-2 rounded-full bg-yellow-400" />{amarelo} atenção</span>
        <span className="flex items-center gap-1.5 text-xs text-red-400"><span className="w-2 h-2 rounded-full bg-red-500" />{vermelho} em risco</span>
      </div>
    </div>
  )
}

function RecentActivity({ projects }) {
  const events = useMemo(() => {
    const all = []
    projects.forEach(p => {
      (p.historico || []).forEach(h => all.push({ ...h, projetoNome: p.nome, projetoId: p.id }))
      ;(p.observacoes || []).forEach(o => all.push({ id: o.id, acao: `Observação: ${o.titulo}`, projetoNome: p.nome, projetoId: p.id, criadoEm: o.criadoEm, usuarioNome: o.autorNome }))
    })
    return all.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm)).slice(0, 8)
  }, [projects])

  const fmtDate = iso => {
    if (!iso) return ''
    try { return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) }
    catch { return '' }
  }

  if (events.length === 0) return null

  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-[#CE7028]" />
        <h3 className="text-white font-semibold text-sm">Atividade recente</h3>
      </div>
      <div className="space-y-2">
        {events.map(e => (
          <div key={`${e.id}-${e.projetoId}`} className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#CE7028]/60 mt-2 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs">{e.acao}</p>
              <p className="text-gray-600 text-[10px]">{e.projetoNome}{e.usuarioNome ? ` · ${e.usuarioNome}` : ''}</p>
            </div>
            <span className="text-gray-700 text-[10px] flex-shrink-0">{fmtDate(e.criadoEm)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { projects } = useData()
  const all = projects || []

  const stats = useMemo(() => {
    const now = new Date()
    const total = all.length
    const em_andamento = all.filter(p => p.status === 'em_andamento').length
    const concluidos = all.filter(p => p.status === 'concluido').length
    const em_risco = all.filter(p => p.saude === 'vermelho').length
    const no_prazo = all.filter(p => p.saude === 'verde').length
    const atrasados = all.filter(p => p.dataFim && p.status !== 'concluido' && new Date(p.dataFim) < now).length

    const tarefas = all.flatMap(p => p.tarefas || [])
    const abertas = tarefas.filter(t => t.status !== 'concluida').length
    const atrasadasAtividades = tarefas.filter(t =>
      t.dataVencimento && t.status !== 'concluida' && new Date(t.dataVencimento) < now
    ).length

    const avgProgress = total > 0 ? Math.round(all.reduce((s, p) => s + (p.percentualConcluido || 0), 0) / total) : 0

    const durations = all
      .filter(p => p.dataInicio && p.dataFim)
      .map(p => Math.ceil((new Date(p.dataFim) - new Date(p.dataInicio)) / 86400000))
    const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0

    return { total, em_andamento, concluidos, em_risco, no_prazo, atrasados, abertas, atrasadasAtividades, avgProgress, avgDuration }
  }, [all])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-[#CE7028]/10 border border-[#CE7028]/20 flex items-center justify-center">
          <LayoutDashboard className="w-4 h-4 text-[#CE7028]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-600 text-xs">Visão executiva dos projetos em andamento</p>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={FolderKanban} label="Total de projetos" value={stats.total}
          onClick={() => navigate('/projetos/gestao')} />
        <KpiCard icon={TrendingUp} label="Em andamento" value={stats.em_andamento}
          color="text-[#FF882D]"
          onClick={() => navigate('/projetos/gestao')} />
        <KpiCard icon={CheckCircle2} label="Concluídos" value={stats.concluidos}
          color="text-green-400"
          onClick={() => navigate('/projetos/gestao')} />
        <KpiCard icon={AlertTriangle} label="Atrasados" value={stats.atrasados}
          color={stats.atrasados > 0 ? 'text-red-400' : 'text-gray-400'}
          border={stats.atrasados > 0 ? 'border-red-900/20' : undefined} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={AlertTriangle} label="Em risco" value={stats.em_risco}
          color={stats.em_risco > 0 ? 'text-red-400' : 'text-gray-400'}
          border={stats.em_risco > 0 ? 'border-red-900/20' : undefined} />
        <KpiCard icon={CheckCircle2} label="No prazo" value={stats.no_prazo}
          color="text-green-400" />
        <KpiCard icon={BarChart2} label="Progresso médio" value={`${stats.avgProgress}%`}
          sub="média do portfólio" />
        <KpiCard icon={Clock} label="Duração média" value={stats.avgDuration > 0 ? `${stats.avgDuration}d` : '—'}
          sub="por projeto" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <KpiCard icon={Activity} label="Atividades abertas" value={stats.abertas} sub="em todos os projetos" />
        <KpiCard icon={AlertTriangle} label="Atividades atrasadas" value={stats.atrasadasAtividades}
          color={stats.atrasadasAtividades > 0 ? 'text-red-400' : 'text-gray-400'}
          sub="prazo vencido" />
      </div>

      {/* Health bar + recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <HealthBar projects={all} />
        </div>
        <RecentActivity projects={all} />
      </div>
    </div>
  )
}
