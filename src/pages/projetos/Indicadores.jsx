import { useMemo } from 'react'
import { BarChart2, TrendingUp, AlertTriangle, CheckCircle2, Users } from 'lucide-react'
import { useData } from '../../contexts/DataContext'

function KpiCard({ icon: Icon, label, value, sub, color = 'text-white' }) {
  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-md px-5 py-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-[#CE7028]" />
        <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-3xl font-bold tabular-nums ${color}`}>{value}</p>
      {sub && <p className="text-gray-600 text-xs mt-0.5">{sub}</p>}
    </div>
  )
}

function BarGroup({ title, rows, valueLabel = '' }) {
  const max = Math.max(...rows.map(r => r.value), 1)
  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5">
      <h3 className="text-white font-semibold text-sm mb-4">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-gray-600 text-sm text-center py-6">Sem dados</p>
      ) : (
        <div className="space-y-3">
          {rows.map(r => (
            <div key={r.label}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-400 text-xs truncate max-w-[60%]">{r.label}</span>
                <span className={`text-xs font-semibold tabular-nums ${r.color || 'text-gray-300'}`}>
                  {r.display ?? r.value}{valueLabel}
                </span>
              </div>
              <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${r.barColor || 'bg-[#CE7028]'}`}
                  style={{ width: `${(r.value / max) * 100}%` }} />
              </div>
              {r.sub && <p className="text-gray-700 text-[10px] mt-0.5">{r.sub}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Indicadores() {
  const { projects, members } = useData()
  const all = projects || []

  const { kpis, porGerente, porSaude, porMes, rankingGerentes } = useMemo(() => {
    const now = new Date()
    const total = all.length

    // KPIs
    const concluidos = all.filter(p => p.status === 'concluido').length
    const eficiencia = total > 0 ? Math.round((concluidos / total) * 100) : 0
    const tarefas = all.flatMap(p => p.tarefas || [])
    const atrasadasAtividades = tarefas.filter(t =>
      t.dataVencimento && t.status !== 'concluida' && new Date(t.dataVencimento) < now
    ).length

    // Por gerente
    const gerenteMap = {}
    all.forEach(p => {
      const g = p.responsavelNome || members?.find(m => String(m.id) === String(p.responsavelId))?.nome || 'Sem gerente'
      if (!gerenteMap[g]) gerenteMap[g] = { total: 0, concluidos: 0 }
      gerenteMap[g].total++
      if (p.status === 'concluido') gerenteMap[g].concluidos++
    })
    const porGerente = Object.entries(gerenteMap)
      .map(([label, d]) => ({ label, value: d.total, sub: `${d.concluidos} concluído(s)` }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)

    // Por saúde
    const saudeCount = { verde: 0, amarelo: 0, vermelho: 0 }
    all.forEach(p => { if (saudeCount[p.saude] !== undefined) saudeCount[p.saude]++ })
    const porSaude = [
      { label: 'No prazo', value: saudeCount.verde, barColor: 'bg-green-500', color: 'text-green-400' },
      { label: 'Atenção', value: saudeCount.amarelo, barColor: 'bg-yellow-400', color: 'text-yellow-400' },
      { label: 'Em risco', value: saudeCount.vermelho, barColor: 'bg-red-500', color: 'text-red-400' },
    ]

    // Por mês (últimos 6 meses)
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({ year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }) })
    }
    const porMes = months.map(m => {
      const count = all.filter(p => {
        if (!p.dataInicio) return false
        const d = new Date(p.dataInicio)
        return d.getFullYear() === m.year && d.getMonth() === m.month
      }).length
      return { label: m.label, value: count }
    })

    // Ranking gerentes por taxa de conclusão
    const rankingGerentes = Object.entries(gerenteMap)
      .map(([label, d]) => ({
        label,
        value: d.total > 0 ? Math.round((d.concluidos / d.total) * 100) : 0,
        display: `${d.total > 0 ? Math.round((d.concluidos / d.total) * 100) : 0}%`,
        sub: `${d.concluidos}/${d.total} projetos`,
        barColor: d.total > 0 && Math.round((d.concluidos / d.total) * 100) >= 70 ? 'bg-green-500' : 'bg-[#CE7028]',
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)

    return { kpis: { eficiencia, atrasadasAtividades, total, concluidos }, porGerente, porSaude, porMes, rankingGerentes }
  }, [all, members])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-[#CE7028]/10 border border-[#CE7028]/20 flex items-center justify-center">
          <BarChart2 className="w-4 h-4 text-[#CE7028]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Indicadores</h1>
          <p className="text-gray-600 text-xs">Métricas de desempenho e análise do portfólio</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={TrendingUp} label="Eficiência" value={`${kpis.eficiencia}%`}
          sub="projetos concluídos"
          color={kpis.eficiencia >= 70 ? 'text-green-400' : kpis.eficiencia >= 40 ? 'text-yellow-400' : 'text-red-400'} />
        <KpiCard icon={AlertTriangle} label="Atividades atrasadas" value={kpis.atrasadasAtividades}
          color={kpis.atrasadasAtividades > 0 ? 'text-red-400' : 'text-gray-400'} />
        <KpiCard icon={CheckCircle2} label="Projetos concluídos" value={kpis.concluidos}
          sub={`de ${kpis.total} no total`} color="text-green-400" />
        <KpiCard icon={Users} label="Total de projetos" value={kpis.total} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarGroup title="Projetos por gerente" rows={porGerente} />
        <BarGroup title="Projetos por saúde" rows={porSaude} />
        <BarGroup title="Projetos iniciados por mês (últimos 6 meses)" rows={porMes} />
        <BarGroup title="Ranking de gerentes — taxa de conclusão" rows={rankingGerentes} />
      </div>
    </div>
  )
}
