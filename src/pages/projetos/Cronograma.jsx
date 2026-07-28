import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarRange, ExternalLink } from 'lucide-react'
import { useData } from '../../contexts/DataContext'

const SAUDE = {
  verde:    { label: 'No prazo',  cls: 'bg-green-950/40 text-green-400 border border-green-900/30' },
  amarelo:  { label: 'Atenção',  cls: 'bg-yellow-950/30 text-yellow-400 border border-yellow-900/20' },
  vermelho: { label: 'Em risco', cls: 'bg-red-950/30 text-red-400 border border-red-900/20' },
}
const STATUS = {
  planejado:    { label: 'Planejado',    cls: 'text-blue-400' },
  em_andamento: { label: 'Em andamento', cls: 'text-[#FF882D]' },
  pausado:      { label: 'Pausado',      cls: 'text-gray-400' },
  concluido:    { label: 'Concluído',    cls: 'text-green-400' },
  cancelado:    { label: 'Cancelado',    cls: 'text-red-400' },
}

const fmtDate = iso => {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }) }
  catch { return '—' }
}

export default function Cronograma() {
  const navigate = useNavigate()
  const { projects, members } = useData()
  const all = projects || []

  const rows = useMemo(() => {
    const now = new Date()
    return all.map(p => {
      const inicio = p.dataInicio ? new Date(p.dataInicio) : null
      const fim = p.dataFim ? new Date(p.dataFim) : null

      // Previsão atual: max dataFimEstimada across etapas, or fall back to fim
      const estimadas = (p.etapas || []).map(e => e.dataFimEstimada).filter(Boolean).map(d => new Date(d))
      const previsao = estimadas.length > 0 ? new Date(Math.max(...estimadas)) : fim

      const desvioD = fim && previsao ? Math.ceil((previsao - fim) / 86400000) : null
      const duracao = inicio && fim ? Math.ceil((fim - inicio) / 86400000) : null
      const desvioP = duracao && desvioD !== null ? Math.round((desvioD / duracao) * 100) : null
      const diasRestantes = fim ? Math.ceil((fim - now) / 86400000) : null

      const gerenteNome = p.responsavelNome || members?.find(m => String(m.id) === String(p.responsavelId))?.nome || '—'

      return { ...p, gerenteNome, inicio, fim, previsao, desvioD, desvioP, diasRestantes }
    }).sort((a, b) => {
      if (a.fim && b.fim) return a.fim - b.fim
      if (a.fim) return -1
      if (b.fim) return 1
      return 0
    })
  }, [all, members])

  const TH = ({ children, className = '' }) => (
    <th className={`text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider px-3 py-3 whitespace-nowrap ${className}`}>{children}</th>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-[#CE7028]/10 border border-[#CE7028]/20 flex items-center justify-center">
          <CalendarRange className="w-4 h-4 text-[#CE7028]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Cronograma</h1>
          <p className="text-gray-600 text-xs">Prazos, desvios e semáforo de todos os projetos</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-md py-16 text-center">
          <CalendarRange className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Nenhum projeto cadastrado</p>
        </div>
      ) : (
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-[#1E1E1E]">
                  <TH>Projeto</TH>
                  <TH>Gerente</TH>
                  <TH>Status</TH>
                  <TH>Início</TH>
                  <TH>Fim Planejado</TH>
                  <TH>Previsão Atual</TH>
                  <TH>Desvio (dias)</TH>
                  <TH>Desvio (%)</TH>
                  <TH>Dias Restantes</TH>
                  <TH>Progresso</TH>
                  <TH>Saúde</TH>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {rows.map(p => {
                  const saudeCfg = SAUDE[p.saude] || SAUDE.verde
                  const statusCfg = STATUS[p.status] || STATUS.em_andamento
                  const desvioColor = p.desvioD === null ? 'text-gray-600'
                    : p.desvioD > 0 ? 'text-red-400'
                    : p.desvioD < 0 ? 'text-green-400'
                    : 'text-gray-400'
                  const diasColor = p.diasRestantes === null ? 'text-gray-600'
                    : p.diasRestantes < 0 ? 'text-red-400'
                    : p.diasRestantes <= 7 ? 'text-yellow-400'
                    : 'text-gray-300'
                  const pct = p.percentualConcluido || 0
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] group">
                      <td className="px-3 py-3">
                        <button onClick={() => navigate(`/projetos/gestao/${p.id}`)}
                          className="flex items-center gap-1.5 text-white font-medium text-sm hover:text-[#FF882D] transition-colors text-left">
                          {p.nome}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-60 flex-shrink-0" />
                        </button>
                        {p.clienteNome && <p className="text-gray-600 text-[10px] mt-0.5">{p.clienteNome}</p>}
                      </td>
                      <td className="px-3 py-3 text-gray-400 text-sm whitespace-nowrap">{p.gerenteNome}</td>
                      <td className="px-3 py-3">
                        <span className={`text-xs font-medium ${statusCfg.cls}`}>{statusCfg.label}</span>
                      </td>
                      <td className="px-3 py-3 text-gray-400 text-sm whitespace-nowrap">{fmtDate(p.dataInicio)}</td>
                      <td className="px-3 py-3 text-gray-400 text-sm whitespace-nowrap">{fmtDate(p.dataFim)}</td>
                      <td className="px-3 py-3 text-gray-400 text-sm whitespace-nowrap">
                        {p.previsao && p.previsao !== p.fim ? fmtDate(p.previsao.toISOString()) : <span className="text-gray-700">—</span>}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-sm font-medium tabular-nums ${desvioColor}`}>
                          {p.desvioD !== null ? (p.desvioD > 0 ? `+${p.desvioD}d` : p.desvioD < 0 ? `${p.desvioD}d` : '—') : '—'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-sm font-medium tabular-nums ${desvioColor}`}>
                          {p.desvioP !== null && p.desvioD !== 0 ? `${p.desvioP > 0 ? '+' : ''}${p.desvioP}%` : '—'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-sm font-medium tabular-nums ${diasColor}`}>
                          {p.diasRestantes !== null
                            ? (p.diasRestantes < 0 ? `${Math.abs(p.diasRestantes)}d atr.` : `${p.diasRestantes}d`)
                            : '—'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2 min-w-[80px]">
                          <div className="flex-1 h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-[#CE7028]" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-gray-500 text-[10px] tabular-nums w-8 text-right">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${saudeCfg.cls}`}>
                          {saudeCfg.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
