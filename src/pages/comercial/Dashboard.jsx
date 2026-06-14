import { useState, useMemo, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import {
  ChevronLeft, ChevronRight, Radio, Calendar, BarChart2,
  TrendingUp, TrendingDown, DollarSign, FileCheck,
  Percent, Target,
} from 'lucide-react'
import { semanas, meses, aovivo } from '../../data/comercialData'

// ── Helpers ───────────────────────────────────────────────────
const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0)

const fmtR = (v) =>
  `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`

const fmtDate = (iso) => {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

const avg = (arr, key) =>
  arr.length ? arr.reduce((s, x) => s + x[key], 0) / arr.length : 0

function calcDelta(curr, prev) {
  if (prev == null || prev === 0) return null
  const diff = curr - prev
  const diffPct = ((diff / prev) * 100).toFixed(1)
  return { diff, diffPct: Number(diffPct), positive: diff >= 0 }
}

// ── InfoTooltip — ícone ? com fórmula em fixed positioning ───
function InfoTooltip({ text }) {
  const [pos, setPos] = useState(null)
  const ref = useRef(null)

  const handleEnter = () => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const TW = 224 // tooltip width px (w-56)
    let left = rect.left + rect.width / 2
    if (left + TW / 2 > window.innerWidth - 8) left = window.innerWidth - TW / 2 - 8
    if (left - TW / 2 < 8) left = TW / 2 + 8
    // Show above by default; flip below if too close to top
    const above = rect.top > 80
    setPos({ left, top: above ? rect.top - 6 : rect.bottom + 6, above })
  }

  return (
    <span
      ref={ref}
      onMouseEnter={handleEnter}
      onMouseLeave={() => setPos(null)}
      className="inline-flex items-center ml-1 cursor-help flex-shrink-0 align-middle"
    >
      <span className="w-3.5 h-3.5 rounded-full border border-[#CE7028]/70 text-[#CE7028] text-[9px] font-bold flex items-center justify-center hover:bg-[#CE7028]/10 transition-colors leading-none select-none">
        ?
      </span>

      {pos && (
        <div
          style={{
            position: 'fixed',
            top:  pos.above ? pos.top : pos.top,
            left: pos.left,
            transform: pos.above
              ? 'translate(-50%, -100%) translateY(-4px)'
              : 'translate(-50%, 4px)',
            zIndex: 9999,
            width: '14rem',
          }}
          className="pointer-events-none rounded border border-[#CE7028] bg-[#1E1E1E] px-3 py-2.5 text-[11px] text-white leading-relaxed shadow-2xl"
        >
          {text}
          {/* seta */}
          <span
            style={{
              position: 'absolute',
              ...(pos.above
                ? { bottom: -5, left: '50%', transform: 'translateX(-50%) rotate(45deg)' }
                : { top: -5,    left: '50%', transform: 'translateX(-50%) rotate(225deg)' }),
              width: 8,
              height: 8,
              background: '#1E1E1E',
              borderRight: '1px solid #CE7028',
              borderBottom: '1px solid #CE7028',
            }}
          />
        </div>
      )}
    </span>
  )
}

// ── Tooltip customizado recharts ──────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#111111] border border-[#2A2A2A] rounded p-3 text-xs shadow-xl">
      <p className="text-white font-semibold mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.fill }} />
          <span className="text-gray-400">{entry.name}:</span>
          <span className="text-white font-bold">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── DeltaTag ──────────────────────────────────────────────────
const DELTA_TIP = '((Valor Atual − Valor Anterior) ÷ Valor Anterior) × 100'

function DeltaTag({ curr, prev, label = '' }) {
  const d = calcDelta(curr, prev)
  if (!d) return null
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
        d.positive
          ? 'text-green-400 bg-green-950/40 border-green-900/30'
          : 'text-red-400 bg-red-950/40 border-red-900/30'
      }`}
    >
      {d.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {d.positive ? '+' : ''}{d.diffPct}%
      {label && <span className="text-gray-500 font-normal ml-0.5">{label}</span>}
      <InfoTooltip text={DELTA_TIP} />
    </span>
  )
}

// ── Seletor de período ────────────────────────────────────────
function PeriodNav({ viewMode, setViewMode, semaIdx, setSemaIdx, mesIdx, setMesIdx }) {
  const semana = semanas[semaIdx]
  const mes    = meses[mesIdx]

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-1 bg-[#111111] border border-[#1E1E1E] rounded-md p-1">
        <button
          onClick={() => setViewMode('aovivo')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
            viewMode === 'aovivo' ? 'bg-[#CE7028] text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${viewMode === 'aovivo' ? 'bg-white animate-pulse' : 'bg-gray-600'}`} />
          Ao Vivo
        </button>
        <button
          onClick={() => setViewMode('semanal')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
            viewMode === 'semanal' ? 'bg-[#CE7028] text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3 h-3" />
          Semanal
        </button>
        <button
          onClick={() => setViewMode('mensal')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
            viewMode === 'mensal' ? 'bg-[#CE7028] text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <BarChart2 className="w-3 h-3" />
          Mensal
        </button>
      </div>

      {viewMode === 'semanal' && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSemaIdx(i => Math.max(0, i - 1))}
            disabled={semaIdx === 0}
            className="w-7 h-7 flex items-center justify-center rounded border border-[#2A2A2A] text-gray-400 hover:text-white hover:border-[#CE7028] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-300 font-medium min-w-[210px] text-center">
            {semana.label} — {fmtDate(semana.inicio)} a {fmtDate(semana.fim)}
          </span>
          <button
            onClick={() => setSemaIdx(i => Math.min(semanas.length - 1, i + 1))}
            disabled={semaIdx === semanas.length - 1}
            className="w-7 h-7 flex items-center justify-center rounded border border-[#2A2A2A] text-gray-400 hover:text-white hover:border-[#CE7028] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {viewMode === 'mensal' && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMesIdx(i => Math.max(0, i - 1))}
            disabled={mesIdx === 0}
            className="w-7 h-7 flex items-center justify-center rounded border border-[#2A2A2A] text-gray-400 hover:text-white hover:border-[#CE7028] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-300 font-medium min-w-[140px] text-center">
            {mes.label}
          </span>
          <button
            onClick={() => setMesIdx(i => Math.min(meses.length - 1, i + 1))}
            disabled={mesIdx === meses.length - 1}
            className="w-7 h-7 flex items-center justify-center rounded border border-[#2A2A2A] text-gray-400 hover:text-white hover:border-[#CE7028] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {viewMode === 'aovivo' && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Radio className="w-3.5 h-3.5 text-green-400" />
          Atualizado às{' '}
          {new Date(aovivo.ultimaAtualizacao).toLocaleTimeString('pt-BR', {
            hour: '2-digit', minute: '2-digit',
          })}
        </div>
      )}
    </div>
  )
}

// ── KPI Card (com tooltip por indicador) ─────────────────────
const KPI_TIPS = {
  'Ticket Médio':         'Receita Total ÷ Número de Contratos Fechados no período',
  'Contratos Fechados':   "Total de negócios marcados como 'Ganho' no período",
  'Receita Total':        'Soma dos valores de todos os contratos fechados no período',
  'Taxa de Conversão':    'Contratos Fechados ÷ Leads Cadastrados × 100',
}

function KPICard({ label, value, prevValue, format, Icon, accent }) {
  const formatted =
    format === 'currency' ? fmtR(value) :
    format === 'percent'  ? `${value.toFixed(1)}%` :
    String(value)

  const d = calcDelta(value, prevValue)

  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5 flex flex-col gap-3 hover:border-[#2A2A2A] transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center">
          {label}
          <InfoTooltip text={KPI_TIPS[label]} />
        </p>
        <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: `${accent}22` }}>
          <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white leading-none">{formatted}</p>
      {d ? (
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-semibold w-fit px-2 py-0.5 rounded border ${
            d.positive
              ? 'text-green-400 bg-green-950/30 border-green-900/30'
              : 'text-red-400 bg-red-950/30 border-red-900/30'
          }`}
        >
          {d.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {d.positive ? '+' : ''}{d.diffPct}% vs anterior
          <InfoTooltip text={DELTA_TIP} />
        </span>
      ) : (
        <span className="text-[11px] text-gray-700">— sem período anterior</span>
      )}
    </div>
  )
}

// ── Funil — stages com tooltips ───────────────────────────────
const FUNIL_STAGES = [
  {
    key: 'leadsCadastrados',   label: 'Leads',          color: '#64748B',
    tip: 'Total de leads inseridos no Pipefy no período',
    convTip: null,
  },
  {
    key: 'ligoesRealizadas',   label: 'Ligações',       color: '#3B82F6',
    tip: 'Total de ligações registradas pelos Hunters no período',
    convTip: 'Ligações Realizadas ÷ Leads Cadastrados × 100',
  },
  {
    key: 'reunioesMarcadas',   label: 'Reuniões Marc.', color: '#8B5CF6',
    tip: 'Total de reuniões agendadas pelos Hunters no período',
    convTip: 'Reuniões Marcadas ÷ Ligações Realizadas × 100',
  },
  {
    key: 'reunioesRealizadas', label: 'Reuniões Real.', color: '#2A6B68',
    tip: 'Reuniões que de fato aconteceram (não foram no-show)',
    convTip: 'Reuniões Realizadas ÷ Reuniões Marcadas × 100',
  },
  {
    key: 'propostas',          label: 'Propostas',      color: '#E8955A',
    tip: 'Total de leads que chegaram à fase de Proposta no período',
    convTip: 'Propostas ÷ Reuniões Realizadas × 100',
  },
  {
    key: 'negociacoes',        label: 'Negociações',    color: '#CE7028',
    tip: 'Leads em processo ativo de negociação',
    convTip: 'Negociações ÷ Propostas Enviadas × 100',
  },
  {
    key: 'contratosFechados',  label: 'Contratos',      color: '#16A34A',
    tip: "Total de leads marcados como Ganho no período",
    convTip: 'Contratos Fechados ÷ Negociações × 100',
  },
]

function FunnelFlow({ funil }) {
  const total = funil.leadsCadastrados || 1
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-stretch gap-0 min-w-max">
        {FUNIL_STAGES.map((stage, i) => {
          const val     = funil[stage.key] ?? 0
          const prevVal = i > 0 ? (funil[FUNIL_STAGES[i - 1].key] ?? 1) : 0
          const conv    = i > 0 ? pct(val, prevVal) : null
          const barW    = Math.max(10, pct(val, total))

          const convCls =
            conv === null ? '' :
            conv >= 70    ? 'text-green-400 bg-green-950/50 border-green-900/40' :
            conv >= 45    ? 'text-yellow-400 bg-yellow-950/40 border-yellow-900/30' :
                            'text-red-400 bg-red-950/40 border-red-900/30'

          return (
            <div key={stage.key} className="flex items-center">
              {/* Badge de conversão entre estágios */}
              {i > 0 && (
                <div className="flex flex-col items-center mx-1 w-14 flex-shrink-0">
                  <span className={`inline-flex items-center text-[10px] font-bold border px-1.5 py-0.5 rounded ${convCls}`}>
                    {conv}%
                    {stage.convTip && <InfoTooltip text={stage.convTip} />}
                  </span>
                  <div className="text-gray-700 text-sm mt-0.5">→</div>
                </div>
              )}

              {/* Card do estágio */}
              <div className="flex flex-col items-center bg-[#0D0D0D] border border-[#1E1E1E] rounded-md px-4 py-4 min-w-[100px] hover:border-[#2A2A2A] transition-colors">
                <div className="w-full bg-[#1A1A1A] rounded-full h-1 mb-3 overflow-hidden">
                  <div
                    className="h-1 rounded-full transition-all duration-500"
                    style={{ width: `${barW}%`, background: stage.color }}
                  />
                </div>
                <p className="text-2xl font-bold text-white">{val}</p>
                <p className="text-[10px] text-gray-500 mt-1.5 text-center leading-tight flex items-center justify-center gap-0.5">
                  {stage.label}
                  <InfoTooltip text={stage.tip} />
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Pipeline CRM com tooltips ─────────────────────────────────
const PIPELINE_STAGES = [
  { key: 'cadastro',        label: 'Cadastro',    color: '#4B5563',
    tip: 'Leads inseridos no Pipefy ainda não contatados' },
  { key: 'naoContatados',   label: 'Não Cont.',   color: '#6B7280',
    tip: 'Leads que passaram por tentativa de contato sem sucesso' },
  { key: 'perdidos',        label: 'Perdidos',    color: '#EF4444',
    tip: 'Leads marcados como perdidos no Pipefy' },
  { key: 'interesseFuturo', label: 'Int. Futuro', color: '#F59E0B',
    tip: 'Leads que pediram retorno em data futura' },
  { key: 'diagnostico',     label: 'Diagnóstico', color: '#3B82F6',
    tip: 'Leads com reunião diagnóstico agendada ou realizada' },
  { key: 'proposta',        label: 'Proposta',    color: '#8B5CF6',
    tip: 'Leads com proposta enviada aguardando resposta' },
  { key: 'negociacao',      label: 'Negociação',  color: '#CE7028',
    tip: 'Leads em processo ativo de negociação' },
  { key: 'ganhos',          label: 'Ganhos',      color: '#16A34A',
    tip: 'Leads convertidos em contrato fechado' },
]

function PipelineGrid({ pipeline }) {
  const total = Object.values(pipeline).reduce((s, v) => s + v, 0) || 1
  return (
    <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
      {PIPELINE_STAGES.map((s) => {
        const v       = pipeline[s.key] ?? 0
        const p       = pct(v, total)
        const isRed   = s.key === 'perdidos'
        const isGreen = s.key === 'ganhos'
        return (
          <div
            key={s.key}
            className="bg-[#0D0D0D] border border-[#1E1E1E] rounded-md p-3 text-center hover:border-[#2A2A2A] transition-colors"
          >
            <div className="w-6 h-0.5 mx-auto mb-2 rounded-full" style={{ background: s.color }} />
            <p className={`text-xl font-bold ${isRed ? 'text-red-400' : isGreen ? 'text-green-400' : 'text-white'}`}>
              {v}
            </p>
            <p className="text-[9px] text-gray-600 mt-1 leading-tight flex items-center justify-center gap-0.5">
              {s.label}
              <InfoTooltip text={s.tip} />
            </p>
            <p className={`text-[10px] font-semibold mt-1 ${isRed ? 'text-red-500' : isGreen ? 'text-green-500' : 'text-gray-600'}`}>
              {p}%
            </p>
          </div>
        )
      })}
    </div>
  )
}

// ── Hunters com tooltips nas colunas ─────────────────────────
const HUNTER_COLS = [
  { label: 'Hunter',         tip: null },
  { label: 'Contatadas',     tip: 'Total de leads únicos que o Hunter ligou no período' },
  { label: 'Reuniões Marc.', tip: 'Total de reuniões agendadas pelo Hunter no período' },
  { label: 'Reuniões Real.', tip: 'Reuniões que de fato aconteceram (não foram no-show)' },
  { label: 'No-shows',       tip: 'Reuniões agendadas em que o lead não compareceu' },
  { label: 'Taxa Conv.',     tip: 'Reuniões Realizadas ÷ Pessoas Contatadas × 100' },
]
const MEDIA_TIP_H = 'Média aritmética de todos os Hunters para este indicador no período'

function HuntersSection({ hunters, prevHunters, prevLabel }) {
  const sumKey    = (arr, key) => arr.reduce((s, h) => s + h[key], 0)
  const currTotal = sumKey(hunters, 'reunioesRealizadas')
  const prevTotal = prevHunters ? sumKey(prevHunters, 'reunioesRealizadas') : null

  const chartData = hunters.map((h) => ({
    nome:               h.nome.split(' ')[0],
    'Contatadas':       h.contatadas,
    'Reun. Marcadas':   h.reunioesMarcadas,
    'Reun. Realizadas': h.reunioesRealizadas,
    'No-shows':         h.noShows,
  }))

  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Hunters</h2>
          <p className="text-xs text-gray-600 mt-0.5">Prospecção e agendamento</p>
        </div>
        <DeltaTag curr={currTotal} prev={prevTotal} label={prevLabel ? `vs ${prevLabel}` : ''} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#1E1E1E]">
              {HUNTER_COLS.map(({ label, tip }) => (
                <th key={label} className="text-left text-gray-600 font-semibold pb-2 pr-4 whitespace-nowrap">
                  <span className="inline-flex items-center">
                    {label}
                    {tip && <InfoTooltip text={tip} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hunters.map((h) => {
              const taxa = pct(h.reunioesRealizadas, h.contatadas)
              return (
                <tr key={h.id} className="border-b border-[#0D0D0D] hover:bg-[#0D0D0D]/60 transition-colors">
                  <td className="py-2.5 pr-4 font-semibold text-white whitespace-nowrap">{h.nome}</td>
                  <td className="py-2.5 pr-4 text-gray-300">{h.contatadas}</td>
                  <td className="py-2.5 pr-4 text-gray-300">{h.reunioesMarcadas}</td>
                  <td className="py-2.5 pr-4 text-gray-300">{h.reunioesRealizadas}</td>
                  <td className="py-2.5 pr-4">
                    <span className={h.noShows > 0 ? 'text-red-400' : 'text-gray-500'}>{h.noShows}</span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className={`font-bold ${taxa >= 30 ? 'text-green-400' : taxa >= 20 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {taxa}%
                    </span>
                  </td>
                </tr>
              )
            })}
            <tr className="border-t border-[#2A2A2A] bg-[#0D0D0D]/40">
              <td className="py-2.5 pr-4 font-bold text-gray-500 text-[10px] uppercase tracking-wider">
                <span className="inline-flex items-center">
                  Média geral
                  <InfoTooltip text={MEDIA_TIP_H} />
                </span>
              </td>
              {['contatadas', 'reunioesMarcadas', 'reunioesRealizadas', 'noShows'].map((k) => (
                <td key={k} className="py-2.5 pr-4 text-gray-500 font-semibold">{avg(hunters, k).toFixed(1)}</td>
              ))}
              <td className="py-2.5 pr-4 text-gray-500 font-bold">
                {pct(sumKey(hunters, 'reunioesRealizadas'), sumKey(hunters, 'contatadas'))}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
            <XAxis dataKey="nome" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: '#1A1A1A' }} />
            <Legend wrapperStyle={{ fontSize: '10px', color: '#6B7280' }} />
            <Bar dataKey="Contatadas"       fill="#044947" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Reun. Marcadas"   fill="#2A6B68" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Reun. Realizadas" fill="#CE7028" radius={[2, 2, 0, 0]} />
            <Bar dataKey="No-shows"         fill="#374151" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ── Closers com tooltips nas colunas ─────────────────────────
const CLOSER_COLS = [
  { label: 'Closer',      tip: null },
  { label: 'Reuniões',    tip: 'Total de reuniões de fechamento que o Closer conduziu' },
  { label: 'No-shows',    tip: 'Reuniões em que o lead não compareceu' },
  { label: 'Em Neg.',     tip: 'Leads ativos em processo de negociação com este Closer' },
  { label: 'Fechados',    tip: 'Total de contratos assinados pelo Closer no período' },
  { label: 'Taxa Fech.',  tip: 'Contratos Fechados ÷ Reuniões Realizadas × 100' },
]
const MEDIA_TIP_C = 'Média aritmética de todos os Closers para este indicador no período'

function ClosersSection({ closers, prevClosers, prevLabel }) {
  const sumKey    = (arr, key) => arr.reduce((s, c) => s + c[key], 0)
  const currTotal = sumKey(closers, 'contratosFechados')
  const prevTotal = prevClosers ? sumKey(prevClosers, 'contratosFechados') : null

  const chartData = closers.map((c) => ({
    nome:            c.nome.split(' ')[0],
    'Reuniões':      c.reunioesRealizadas,
    'Em Negociação': c.emNegociacao,
    'Fechados':      c.contratosFechados,
  }))

  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Closers</h2>
          <p className="text-xs text-gray-600 mt-0.5">Negociação e fechamento</p>
        </div>
        <DeltaTag curr={currTotal} prev={prevTotal} label={prevLabel ? `vs ${prevLabel}` : ''} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#1E1E1E]">
              {CLOSER_COLS.map(({ label, tip }) => (
                <th key={label} className="text-left text-gray-600 font-semibold pb-2 pr-4 whitespace-nowrap">
                  <span className="inline-flex items-center">
                    {label}
                    {tip && <InfoTooltip text={tip} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {closers.map((c) => {
              const taxa = pct(c.contratosFechados, c.reunioesRealizadas)
              return (
                <tr key={c.id} className="border-b border-[#0D0D0D] hover:bg-[#0D0D0D]/60 transition-colors">
                  <td className="py-2.5 pr-4 font-semibold text-white whitespace-nowrap">{c.nome}</td>
                  <td className="py-2.5 pr-4 text-gray-300">{c.reunioesRealizadas}</td>
                  <td className="py-2.5 pr-4">
                    <span className={c.noShows > 0 ? 'text-red-400' : 'text-gray-500'}>{c.noShows}</span>
                  </td>
                  <td className="py-2.5 pr-4 text-gray-300">{c.emNegociacao}</td>
                  <td className="py-2.5 pr-4">
                    <span className={c.contratosFechados > 0 ? 'text-green-400 font-bold' : 'text-gray-500'}>
                      {c.contratosFechados}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className={`font-bold ${taxa >= 33 ? 'text-green-400' : taxa >= 20 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {taxa}%
                    </span>
                  </td>
                </tr>
              )
            })}
            <tr className="border-t border-[#2A2A2A] bg-[#0D0D0D]/40">
              <td className="py-2.5 pr-4 font-bold text-gray-500 text-[10px] uppercase tracking-wider">
                <span className="inline-flex items-center">
                  Média geral
                  <InfoTooltip text={MEDIA_TIP_C} />
                </span>
              </td>
              {['reunioesRealizadas', 'noShows', 'emNegociacao', 'contratosFechados'].map((k) => (
                <td key={k} className="py-2.5 pr-4 text-gray-500 font-semibold">{avg(closers, k).toFixed(1)}</td>
              ))}
              <td className="py-2.5 pr-4 text-gray-500 font-bold">
                {pct(sumKey(closers, 'contratosFechados'), sumKey(closers, 'reunioesRealizadas'))}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
            <XAxis dataKey="nome" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: '#1A1A1A' }} />
            <Legend wrapperStyle={{ fontSize: '10px', color: '#6B7280' }} />
            <Bar dataKey="Reuniões"      fill="#044947" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Em Negociação" fill="#CE7028" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Fechados"      fill="#16A34A" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────
export default function ComercialDashboard() {
  const [viewMode, setViewMode] = useState('semanal')
  const [semaIdx,  setSemaIdx]  = useState(semanas.length - 1)
  const [mesIdx,   setMesIdx]   = useState(meses.length - 1)

  // TODO: [Supabase] substituir por: supabase.from('comercial_semanas').select('*').order('inicio')
  const currentPeriod = useMemo(() => {
    if (viewMode === 'aovivo')  return aovivo
    if (viewMode === 'semanal') return semanas[semaIdx]
    return meses[mesIdx]
  }, [viewMode, semaIdx, mesIdx])

  // TODO: [Supabase] carregar período anterior para delta comparativo
  const prevPeriod = useMemo(() => {
    if (viewMode === 'aovivo')  return semanas[semanas.length - 1]
    if (viewMode === 'semanal') return semaIdx > 0 ? semanas[semaIdx - 1] : null
    return mesIdx > 0 ? meses[mesIdx - 1] : null
  }, [viewMode, semaIdx, mesIdx])

  const prevLabel = useMemo(() => {
    if (!prevPeriod) return null
    if (viewMode === 'aovivo')  return 'semana passada'
    if (viewMode === 'semanal') return 'semana anterior'
    return 'mês anterior'
  }, [viewMode, prevPeriod])

  const showPipeline = viewMode !== 'semanal'

  return (
    <div className="space-y-5">

      {/* Cabeçalho + seletor de período */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Comercial</h1>
          <p className="text-gray-500 text-sm mt-0.5">Análise de performance da equipe de vendas</p>
        </div>
        <PeriodNav
          viewMode={viewMode} setViewMode={setViewMode}
          semaIdx={semaIdx}   setSemaIdx={setSemaIdx}
          mesIdx={mesIdx}     setMesIdx={setMesIdx}
        />
      </div>

      {/* ── Seção 1: KPIs (topo) ── */}
      {/* TODO: [Supabase] supabase.from('kpis_comercial').select('*').eq('periodo_id', periodoId) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Ticket Médio"
          value={currentPeriod.kpis.ticketMedio}
          prevValue={prevPeriod?.kpis.ticketMedio ?? null}
          format="currency"
          Icon={DollarSign}
          accent="#CE7028"
        />
        <KPICard
          label="Contratos Fechados"
          value={currentPeriod.funil.contratosFechados}
          prevValue={prevPeriod?.funil.contratosFechados ?? null}
          format="number"
          Icon={FileCheck}
          accent="#16A34A"
        />
        <KPICard
          label="Receita Total"
          value={currentPeriod.kpis.receitaTotal}
          prevValue={prevPeriod?.kpis.receitaTotal ?? null}
          format="currency"
          Icon={Target}
          accent="#3B82F6"
        />
        <KPICard
          label="Taxa de Conversão"
          value={currentPeriod.kpis.taxaConversao}
          prevValue={prevPeriod?.kpis.taxaConversao ?? null}
          format="percent"
          Icon={Percent}
          accent="#8B5CF6"
        />
      </div>

      {/* ── Seção 2: Funil + Pipeline ── */}
      <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5 space-y-5">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Funil de Vendas</h2>
        {/* TODO: [Supabase] supabase.from('funil_comercial').select('*').eq('periodo_id', periodoId) */}
        <FunnelFlow funil={currentPeriod.funil} />

        {showPipeline && currentPeriod.pipeline && (
          <div className="border-t border-[#1E1E1E] pt-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Distribuição do Pipeline (CRM)
            </p>
            {/* TODO: [Pipefy] pipefy.getPipeCards(pipeId).then(groupByStage) */}
            <PipelineGrid pipeline={currentPeriod.pipeline} />
          </div>
        )}
      </div>

      {/* ── Seção 3: Hunters ── */}
      {/* TODO: [Supabase] supabase.from('hunter_metrics').select('*').eq('periodo_id', periodoId) */}
      <HuntersSection
        hunters={currentPeriod.hunters}
        prevHunters={prevPeriod?.hunters ?? null}
        prevLabel={prevLabel}
      />

      {/* ── Seção 4: Closers ── */}
      {/* TODO: [Supabase] supabase.from('closer_metrics').select('*').eq('periodo_id', periodoId) */}
      <ClosersSection
        closers={currentPeriod.closers}
        prevClosers={prevPeriod?.closers ?? null}
        prevLabel={prevLabel}
      />

    </div>
  )
}
