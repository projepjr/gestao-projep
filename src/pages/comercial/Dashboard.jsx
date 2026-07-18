import { useEffect, useState, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import {
  ChevronLeft, ChevronRight, Radio, Calendar, BarChart2,
  TrendingUp, TrendingDown, DollarSign, FileCheck,
  Percent, Target, Users,
} from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'
import { mapComercialSnapshot } from '../../services/comercialSnapshotMapper'

const PIPEFY_COMERCIAL_PIPE_ID = '307256948'
const DASHBOARD_REFRESH_MS = 5 * 60 * 1000
const DASHBOARD_SNAPSHOT_LOOKBACK = 20

function extractSnapshotPipeIds(payload = {}) {
  return [
    payload.pipe?.id,
    payload.pipeId,
    payload.pipe_id,
    payload.raw?.pipe?.id,
    payload.raw?.data?.pipe?.id,
    payload.raw?.data?.pipeId,
    payload.raw?.data?.pipe_id,
    ...(payload.pipes || []).map(pipe => pipe?.id),
    ...(payload.raw?.pipes || []).map(pipe => pipe?.id),
  ].flat().filter(Boolean).map(String)
}

function isComercialPipeSnapshot(snapshot) {
  return extractSnapshotPipeIds(snapshot?.payload || {}).includes(PIPEFY_COMERCIAL_PIPE_ID)
}

function hasUsableSnapshotPayload(snapshot) {
  return Boolean(snapshot?.payload && typeof snapshot.payload === 'object' && !Array.isArray(snapshot.payload))
}

function selectComercialSnapshot(snapshots) {
  const usableSnapshots = snapshots.filter(hasUsableSnapshotPayload)
  const snapshotsWithPipeId = usableSnapshots.filter(snapshot => extractSnapshotPipeIds(snapshot.payload).length > 0)
  const explicitPipeSnapshot = usableSnapshots.find(isComercialPipeSnapshot)

  if (explicitPipeSnapshot) {
    return { snapshot: explicitPipeSnapshot, statusMessage: 'Snapshot Pipefy carregado' }
  }

  if (snapshotsWithPipeId.length > 0) {
    return { snapshot: null, statusMessage: '' }
  }

  if (usableSnapshots[0]) {
    return {
      snapshot: usableSnapshots[0],
      statusMessage: 'Snapshot sem pipe_id explícito. Assumindo pipeline 307256948.',
    }
  }

  return { snapshot: null, statusMessage: '' }
}


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
    if (!ref.current || typeof window === 'undefined') return
    const rect = ref.current.getBoundingClientRect()
    const tooltipWidth = Math.min(300, window.innerWidth - 24)
    const iconCenter = rect.left + rect.width / 2
    const left = Math.min(
      Math.max(iconCenter, 12 + tooltipWidth / 2),
      window.innerWidth - 12 - tooltipWidth / 2
    )
    const above = rect.top > 80
    const arrowLeft = Math.min(
      Math.max(iconCenter - (left - tooltipWidth / 2), 14),
      tooltipWidth - 14
    )
    setPos({
      left,
      top: above ? rect.top - 10 : rect.bottom + 10,
      above,
      width: tooltipWidth,
      arrowLeft,
    })
  }

  if (!text) return null

  return (
    <span className="inline-flex items-center ml-1 flex-shrink-0 align-middle">
      <button
        ref={ref}
        type="button"
        onMouseEnter={handleEnter}
        onMouseLeave={() => setPos(null)}
        onFocus={handleEnter}
        onBlur={() => setPos(null)}
        className="w-3.5 h-3.5 rounded-full border border-[#CE7028]/70 text-[#CE7028] text-[9px] font-bold flex items-center justify-center hover:bg-[#CE7028]/10 transition-colors leading-none select-none cursor-help"
        aria-label={`Ajuda: ${text}`}
      >
        ?
      </button>

      {pos && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            transform: pos.above
              ? 'translate(-50%, -100%) translateY(-4px)'
              : 'translate(-50%, 4px)',
            zIndex: 9999,
            width: pos.width,
          }}
          className="pointer-events-none rounded border border-[#CE7028] bg-[#1E1E1E] px-3 py-2.5 text-left text-[12px] text-white leading-snug shadow-2xl whitespace-normal break-words"
        >
          {text}
          <span
            style={{
              position: 'absolute',
              ...(pos.above
                ? { bottom: -5, left: pos.arrowLeft, transform: 'translateX(-50%) rotate(45deg)' }
                : { top: -5, left: pos.arrowLeft, transform: 'translateX(-50%) rotate(225deg)' }),
              width: 8,
              height: 8,
              background: '#1E1E1E',
              borderRight: '1px solid #CE7028',
              borderBottom: '1px solid #CE7028',
            }}
          />
        </div>,
        document.body
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
function PeriodNav({ viewMode, setViewMode, semaIdx, setSemaIdx, mesIdx, setMesIdx, semanas, meses, aovivo }) {
  const semana = semanas[semaIdx]
  const mes    = meses[mesIdx]

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-1 bg-[#111111] border border-[#1E1E1E] rounded-md p-1">
        <button
          type="button"
          onClick={() => setViewMode('aovivo')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
            viewMode === 'aovivo' ? 'bg-[#CE7028] text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${viewMode === 'aovivo' ? 'bg-white animate-pulse' : 'bg-gray-600'}`} />
          Ao Vivo
        </button>
        <button
          type="button"
          onClick={() => setViewMode('semanal')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
            viewMode === 'semanal' ? 'bg-[#CE7028] text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3 h-3" />
          Semanal
        </button>
        <button
          type="button"
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
            type="button"
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
            type="button"
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
            type="button"
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
            type="button"
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
  'Total de Leads': 'Mostra quantos leads existem no pipeline inteiro neste momento.',
  'Leads Entrantes': 'Mostra quantos leads entraram no pipeline dentro do período selecionado.',
  'Ticket Médio': 'Mostra o valor médio dos contratos fechados no período. Se não houver contrato, fica R$ 0.',
  'Contratos Fechados': 'Mostra quantas empresas viraram contrato dentro do período selecionado.',
  'Receita Total': 'Mostra o valor somado dos contratos fechados dentro do período selecionado.',
  'Taxa de Conversão': 'Mostra a proporção de leads do período que chegaram até contrato fechado.',
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
  { key: 'cadastro', label: 'Leads Cad.', color: '#64748B', tip: 'Leads que entraram no período e ainda estão parados em cadastro.' },
  { key: 'tentativasContato', label: 'Tent. Contato', color: '#3B82F6', tip: 'Leads que entraram no período e hoje estão em tentativa de contato.' },
  { key: 'interesseFuturo', label: 'Int. Futuro', color: '#F59E0B', tip: 'Leads que entraram no período e ficaram para retorno futuro.' },
  { key: 'diagnosticasAgendadas', label: 'Diag. Ag.', color: '#8B5CF6', tip: 'Leads que entraram no período e hoje estão com diagnóstica agendada.' },
  { key: 'diagnosticasRealizadas', label: 'Diag. Real.', color: '#2A6B68', tip: 'Leads que entraram no período e hoje estão com diagnóstica realizada.' },
  { key: 'propostasAgendadas', label: 'Prop. Ag.', color: '#E8955A', tip: 'Leads que entraram no período e hoje estão com proposta agendada.' },
  { key: 'propostasRealizadas', label: 'Prop. Real.', color: '#F59E0B', tip: 'Leads que entraram no período e hoje estão com proposta apresentada.' },
  { key: 'negociacoes', label: 'Negociação', color: '#CE7028', tip: 'Leads que entraram no período e hoje estão em negociação.' },
  { key: 'pendentesNoShow', label: 'Pend./No-show', color: '#F97316', tip: 'Leads que entraram no período e hoje estão pendentes ou tiveram no-show.' },
  { key: 'contratosFechados', label: 'Contratos', color: '#16A34A', tip: 'Leads que entraram no período e hoje viraram contrato.' },
  { key: 'perdidos', label: 'Perdidos', color: '#EF4444', tip: 'Leads que entraram no período e hoje estão marcados como perdidos.' },
]
const EMPTY_FUNIL = FUNIL_STAGES.reduce((acc, stage) => {
  acc[stage.key] = 0
  return acc
}, {
  leadsCadastrados: 0,
  leadsTrabalhados: 0,
  leadsContatados: 0,
  noShowsDiagnostica: 0,
  noShowsProposta: 0,
})

const EMPTY_KPIS = {
  leadsEntrantes: 0,
  ticketMedio: 0,
  receitaTotal: 0,
  contratosFechados: 0,
  taxaConversao: 0,
}

function normalizeDashboardPeriod(period = {}, fallback = {}) {
  return {
    id: period.id || fallback.id || 'sem-dados',
    label: period.label || fallback.label || 'Sem dados',
    inicio: period.inicio || fallback.inicio || isoDate(new Date()),
    fim: period.fim || fallback.fim || isoDate(new Date()),
    ultimaAtualizacao: period.ultimaAtualizacao || fallback.ultimaAtualizacao || new Date().toISOString(),
    funil: { ...EMPTY_FUNIL, ...(period.funil || {}) },
    historico: { ...EMPTY_FUNIL, ...(period.historico || period.funil || {}) },
    pipeline: { ...EMPTY_PIPELINE, ...(period.pipeline || {}) },
    kpis: { ...EMPTY_KPIS, ...(period.kpis || {}) },
    hunters: Array.isArray(period.hunters) ? period.hunters : [],
    closers: Array.isArray(period.closers) ? period.closers : [],
  }
}

function emptyPeriodFromRange(range) {
  return normalizeDashboardPeriod({}, range)
}

function FunnelFlow({ funil }) {
  const maxValue = Math.max(...FUNIL_STAGES.map(stage => funil[stage.key] ?? 0), 1)
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-stretch gap-3 min-w-max">
        {FUNIL_STAGES.map((stage) => {
          const val = funil[stage.key] ?? 0
          const barW = val > 0 ? Math.max(10, (val / maxValue) * 100) : 0

          return (
            <div key={stage.key} className="flex flex-col items-center bg-[#0D0D0D] border border-[#1E1E1E] rounded-md px-4 py-4 min-w-[112px] hover:border-[#2A2A2A] transition-colors">
              <div className="w-full bg-[#1A1A1A] rounded-full h-1 mb-3 overflow-hidden">
                <div
                  className="h-1 rounded-full transition-all duration-500"
                  style={{ width: String(barW) + '%', background: stage.color }}
                />
              </div>
              <p className="text-2xl font-bold text-white">{val}</p>
              <p className="text-[10px] text-gray-500 mt-1.5 text-center leading-tight flex items-center justify-center gap-0.5">
                {stage.label}
                <InfoTooltip text={stage.tip} />
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
// ── Pipeline CRM com tooltips ─────────────────────────────────
const PIPELINE_STAGES = [
  { key: 'cadastro',        label: 'Leads Cad.',  color: '#4B5563',
    tip: 'Leads inseridos no Pipefy ainda não contatados' },
  { key: 'naoContatados',   label: 'Tent. Cont.', color: '#6B7280',
    tip: 'Fase Tentativa de Contato do Pipefy' },
  { key: 'interesseFuturo', label: 'Int. Futuro', color: '#F59E0B',
    tip: 'Fase Interesse Futuro do Pipefy' },
  { key: 'diagnostico',     label: 'Diagnóstico', color: '#3B82F6',
    tip: 'Fases de Diagnóstica Agendada ou Diagnóstica Realizada' },
  { key: 'proposta',        label: 'Proposta',    color: '#8B5CF6',
    tip: 'Fases de Proposta Agendada ou Proposta Realizada' },
  { key: 'negociacao',      label: 'Negociação',  color: '#CE7028',
    tip: 'Fase Negociação do Pipefy' },
  { key: 'agendamentosPendentes', label: 'Pend./No-show', color: '#F97316',
    tip: 'Fase Pendentes / No-show do Pipefy' },
  { key: 'ganhos',          label: 'Contratos',   color: '#16A34A',
    tip: 'Fase Contratos Fechados do Pipefy' },
  { key: 'perdidos',        label: 'Perdidos',    color: '#EF4444',
    tip: 'Fase Perdidos do Pipefy' },
]

const EMPTY_PIPELINE = PIPELINE_STAGES.reduce((acc, stage) => {
  acc[stage.key] = 0
  return acc
}, {})

function PipelineGrid({ pipeline }) {
  const total = Object.values(pipeline).reduce((s, v) => s + v, 0) || 1
  return (
    <div className="grid grid-cols-3 md:grid-cols-5 xl:grid-cols-9 gap-2">
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

function ComplementaryMetrics({ funil, historico }) {
  const h = historico || funil
  const leads = h.leadsCadastrados || funil.leadsCadastrados || 0
  const worked = h.leadsTrabalhados || 0
  const contacts = h.leadsContatados || 0

  const makeRate = (label, numerator, denominator, tip, tone = 'text-blue-400') => ({
    label,
    value: pct(numerator, denominator),
    suffix: '%',
    tone,
    tip,
    detail: String(numerator || 0) + '/' + String(denominator || 0),
  })

  const cards = [
    makeRate('Leads Trabalhados', worked, leads, 'Mostra a parte dos leads do período que já saiu do cadastro e recebeu algum andamento comercial.'),
    makeRate('Tentativa de Contato', h.tentativasContato || 0, leads, 'Mostra quantos leads do período chegaram na fase de tentativa de contato.'),
    makeRate('Leads Contatados', contacts, leads, 'Mostra quantos leads responderam ou avançaram para uma etapa que indica contato real. A fase de Tentativa de Contato sozinha não conta aqui.'),
    makeRate('Diag. Agendada', h.diagnosticasAgendadas || 0, contacts || leads, 'Mostra quantos leads contatados avançaram para uma diagnóstica agendada.'),
    makeRate('Diag. Realizada', h.diagnosticasRealizadas || 0, h.diagnosticasAgendadas || 0, 'Mostra quantas diagnósticas agendadas realmente aconteceram.', 'text-green-400'),
    makeRate('Proposta Agendada', h.propostasAgendadas || 0, h.diagnosticasRealizadas || 0, 'Mostra quantas diagnósticas realizadas viraram proposta agendada.'),
    makeRate('Proposta Realizada', h.propostasRealizadas || 0, h.propostasAgendadas || 0, 'Mostra quantas propostas agendadas realmente foram apresentadas.', 'text-green-400'),
    makeRate('Negociação', h.negociacoes || 0, h.propostasRealizadas || 0, 'Mostra quantas propostas apresentadas entraram em negociação.'),
    makeRate('Contrato', h.contratosFechados || 0, h.negociacoes || 0, 'Mostra quantas negociações viraram contratos fechados.', 'text-green-400'),
    makeRate('Lead -> Contrato', h.contratosFechados || 0, leads, 'Mostra quantos leads cadastrados no período chegaram até contrato fechado.', 'text-green-400'),
    makeRate('No-show Diagnóstica', h.noShowsDiagnostica || 0, h.diagnosticasAgendadas || 0, 'Mostra a taxa de bolo em diagnósticas. Essa responsabilidade fica com o Hunter.', 'text-red-400'),
    makeRate('No-show Proposta', h.noShowsProposta || 0, h.propostasAgendadas || 0, 'Mostra a taxa de bolo em apresentações de proposta. Essa responsabilidade fica com o Closer.', 'text-red-400'),
    makeRate('Perda Geral', h.perdidos || 0, leads, 'Mostra quantos leads do período terminaram como perdidos.', 'text-red-400'),
    makeRate('Pendência/No-show', h.pendentesNoShow || 0, leads, 'Mostra quantos leads do período estão aguardando nova ação ou foram marcados como no-show.', 'text-yellow-400'),
  ]

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-2">
      {cards.map(card => {
        return (
          <div key={card.label} className="bg-[#0D0D0D] border border-[#1E1E1E] rounded-md p-3">
            <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider flex items-center">
              {card.label}
              <InfoTooltip text={card.tip} />
            </p>
            <div className="flex items-end justify-between gap-3 mt-2">
              <span className={'text-xl font-bold ' + card.tone}>{card.value}{card.suffix}</span>
              <span className="text-[10px] text-gray-700">
                {card.detail || ''}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
// Hunters com tooltips nas colunas
const HUNTER_COLS = [
  { label: 'Hunter', tip: null },
  { label: 'Leads Trab.', tip: 'Leads do período que tiveram algum andamento feito por este Hunter.' },
  { label: 'Leads Cont.', tip: 'Leads que responderam ou avançaram para uma etapa que indica contato real com este Hunter.' },
  { label: 'Diag. Ag.', tip: 'Diagnósticas agendadas sob responsabilidade deste Hunter.' },
  { label: 'Diag. Real.', tip: 'Diagnósticas que realmente aconteceram sob responsabilidade deste Hunter.' },
  { label: 'Prop. Ag.', tip: 'Leads deste Hunter que chegaram a uma proposta agendada.' },
  { label: 'Prop. Real.', tip: 'Leads deste Hunter que chegaram a uma proposta apresentada.' },
  { label: 'No-shows', tip: 'Bolos em diagnósticas. Essa responsabilidade fica com o Hunter.' },
  { label: 'Taxa Conv.', tip: 'Mostra quantos leads trabalhados pelo Hunter chegaram até uma proposta apresentada.' },
]
const MEDIA_TIP_H = 'Média geral dos Hunters configurados para este período.'

function HuntersSection({ hunters, prevHunters, prevLabel }) {
  const sumKey = (arr, key) => arr.reduce((s, h) => s + (h[key] || 0), 0)
  const currTotal = sumKey(hunters, 'propostasRealizadas')
  const prevTotal = prevHunters ? sumKey(prevHunters, 'propostasRealizadas') : null

  const chartData = hunters.map((h) => ({
    nome: h.nome.split(' ')[0],
    'Leads Trab.': h.leadsTrabalhados || 0,
    'Leads Cont.': h.leadsContatados || h.contatadas || 0,
    'Diag. Ag.': h.diagnosticasAgendadas || h.reunioesMarcadas || 0,
    'Diag. Real.': h.diagnosticasRealizadas || h.reunioesRealizadas || 0,
    'Prop. Real.': h.propostasRealizadas || 0,
  }))

  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Hunters</h2>
          <p className="text-xs text-gray-600 mt-0.5">Prospecção, contato e diagnóstica</p>
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
            {hunters.length === 0 && (
              <tr>
                <td colSpan={9} className="py-6 text-center text-gray-600">
                  Nenhum hunter configurado. Cadastre vínculos em Comercial &gt; Equipe.
                </td>
              </tr>
            )}
            {hunters.map((h) => {
              const leadsTrabalhados = h.leadsTrabalhados || 0
              const leadsContatados = h.leadsContatados || h.contatadas || 0
              const diagnosticasAgendadas = h.diagnosticasAgendadas || h.reunioesMarcadas || 0
              const diagnosticasRealizadas = h.diagnosticasRealizadas || h.reunioesRealizadas || 0
              const propostasAgendadas = h.propostasAgendadas || 0
              const propostasRealizadas = h.propostasRealizadas || 0
              const taxa = pct(propostasRealizadas, leadsTrabalhados)
              return (
                <tr key={h.id} className="border-b border-[#0D0D0D] hover:bg-[#0D0D0D]/60 transition-colors">
                  <td className="py-2.5 pr-4 font-semibold text-white whitespace-nowrap">{h.nome}</td>
                  <td className="py-2.5 pr-4 text-gray-300">{leadsTrabalhados}</td>
                  <td className="py-2.5 pr-4 text-gray-300">{leadsContatados}</td>
                  <td className="py-2.5 pr-4 text-gray-300">{diagnosticasAgendadas}</td>
                  <td className="py-2.5 pr-4 text-gray-300">{diagnosticasRealizadas}</td>
                  <td className="py-2.5 pr-4 text-gray-300">{propostasAgendadas}</td>
                  <td className="py-2.5 pr-4 text-gray-300">{propostasRealizadas}</td>
                  <td className="py-2.5 pr-4">
                    <span className={h.noShows > 0 ? 'text-red-400' : 'text-gray-500'}>{h.noShows || 0}</span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className={`font-bold ${taxa >= 30 ? 'text-green-400' : taxa >= 15 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {taxa}%
                    </span>
                  </td>
                </tr>
              )
            })}
            {hunters.length > 0 && <tr className="border-t border-[#2A2A2A] bg-[#0D0D0D]/40">
              <td className="py-2.5 pr-4 font-bold text-gray-500 text-[10px] uppercase tracking-wider">
                <span className="inline-flex items-center">
                  Média geral
                  <InfoTooltip text={MEDIA_TIP_H} />
                </span>
              </td>
              {['leadsTrabalhados', 'leadsContatados', 'diagnosticasAgendadas', 'diagnosticasRealizadas', 'propostasAgendadas', 'propostasRealizadas', 'noShows'].map((k) => (
                <td key={k} className="py-2.5 pr-4 text-gray-500 font-semibold">{avg(hunters, k).toFixed(1)}</td>
              ))}
              <td className="py-2.5 pr-4 text-gray-500 font-bold">
                {pct(sumKey(hunters, 'propostasRealizadas'), sumKey(hunters, 'leadsTrabalhados'))}%
              </td>
            </tr>}
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
            <Bar dataKey="Leads Trab." fill="#044947" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Leads Cont." fill="#2A6B68" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Diag. Ag." fill="#3B82F6" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Diag. Real." fill="#8B5CF6" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Prop. Real." fill="#CE7028" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
// Closers com tooltips nas colunas ─────────────────────────
const CLOSER_COLS = [
  { label: 'Closer', tip: null },
  { label: 'Diag. Real.', tip: 'Diagnósticas realizadas que chegaram ao contexto deste Closer.' },
  { label: 'Prop. Ag.', tip: 'Apresentações de proposta agendadas por este Closer.' },
  { label: 'Prop. Real.', tip: 'Apresentações de proposta que realmente aconteceram com este Closer.' },
  { label: 'No-shows', tip: 'Bolos em apresentações de proposta. Essa responsabilidade fica com o Closer.' },
  { label: 'Em Neg.', tip: 'Leads que estão em negociação com este Closer.' },
  { label: 'Contratos', tip: 'Contratos fechados por este Closer no período.' },
  { label: 'Taxa Contratos', tip: 'Mostra quantas propostas apresentadas pelo Closer viraram contratos fechados.' },
]
const MEDIA_TIP_C = 'Média geral dos Closers configurados para este período.'

function ClosersSection({ closers, prevClosers, prevLabel }) {
  const sumKey = (arr, key) => arr.reduce((s, c) => s + (c[key] || 0), 0)
  const currTotal = sumKey(closers, 'contratosFechados')
  const prevTotal = prevClosers ? sumKey(prevClosers, 'contratosFechados') : null

  const chartData = closers.map((c) => ({
    nome: c.nome.split(' ')[0],
    'Diag. Real.': c.diagnosticasRealizadas || 0,
    'Prop. Ag.': c.propostasAgendadas || 0,
    'Prop. Real.': c.propostasRealizadas || c.reunioesRealizadas || 0,
    'Em Negociação': c.emNegociacao || 0,
    'Contratos': c.contratosFechados || 0,
  }))

  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Closers</h2>
          <p className="text-xs text-gray-600 mt-0.5">Proposta, negociação e fechamento</p>
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
            {closers.length === 0 && (
              <tr>
                <td colSpan={8} className="py-6 text-center text-gray-600">
                  Nenhum closer configurado. Cadastre vínculos em Comercial &gt; Equipe.
                </td>
              </tr>
            )}
            {closers.map((c) => {
              const diagnosticasRealizadas = c.diagnosticasRealizadas || 0
              const propostasAgendadas = c.propostasAgendadas || 0
              const propostasRealizadas = c.propostasRealizadas || c.reunioesRealizadas || 0
              const taxa = pct(c.contratosFechados || 0, propostasRealizadas)
              return (
                <tr key={c.id} className="border-b border-[#0D0D0D] hover:bg-[#0D0D0D]/60 transition-colors">
                  <td className="py-2.5 pr-4 font-semibold text-white whitespace-nowrap">{c.nome}</td>
                  <td className="py-2.5 pr-4 text-gray-300">{diagnosticasRealizadas}</td>
                  <td className="py-2.5 pr-4 text-gray-300">{propostasAgendadas}</td>
                  <td className="py-2.5 pr-4 text-gray-300">{propostasRealizadas}</td>
                  <td className="py-2.5 pr-4">
                    <span className={c.noShows > 0 ? 'text-red-400' : 'text-gray-500'}>{c.noShows || 0}</span>
                  </td>
                  <td className="py-2.5 pr-4 text-gray-300">{c.emNegociacao || 0}</td>
                  <td className="py-2.5 pr-4">
                    <span className={c.contratosFechados > 0 ? 'text-green-400 font-bold' : 'text-gray-500'}>
                      {c.contratosFechados || 0}
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
            {closers.length > 0 && <tr className="border-t border-[#2A2A2A] bg-[#0D0D0D]/40">
              <td className="py-2.5 pr-4 font-bold text-gray-500 text-[10px] uppercase tracking-wider">
                <span className="inline-flex items-center">
                  Média geral
                  <InfoTooltip text={MEDIA_TIP_C} />
                </span>
              </td>
              {['diagnosticasRealizadas', 'propostasAgendadas', 'propostasRealizadas', 'noShows', 'emNegociacao', 'contratosFechados'].map((k) => (
                <td key={k} className="py-2.5 pr-4 text-gray-500 font-semibold">{avg(closers, k).toFixed(1)}</td>
              ))}
              <td className="py-2.5 pr-4 text-gray-500 font-bold">
                {pct(sumKey(closers, 'contratosFechados'), sumKey(closers, 'propostasRealizadas'))}%
              </td>
            </tr>}
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
            <Bar dataKey="Diag. Real." fill="#044947" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Prop. Ag." fill="#2A6B68" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Prop. Real." fill="#CE7028" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Em Negociação" fill="#E8955A" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Contratos" fill="#16A34A" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
// Componente principal ──────────────────────────────────────
function findCurrentWeekIndex(weeks) {
  if (!weeks.length) return 0
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const started = weeks.reduce((latest, week, index) => week.inicio <= today ? index : latest, -1)
  return started >= 0 ? started : 0
}

function findCurrentMonthIndex(months) {
  if (!months.length) return 0
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const started = months.reduce((latest, month, index) => month.id <= currentMonth ? index : latest, -1)
  return started >= 0 ? started : 0
}

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const isoDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

function getIsoWeek(date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = target.getUTCDay() || 7
  target.setUTCDate(target.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1))
  return Math.ceil((((target - yearStart) / 86400000) + 1) / 7)
}

function buildWeekRanges(referenceDate, count = 8) {
  const reference = new Date(referenceDate)
  const day = reference.getDay()
  const currentSunday = new Date(reference)
  currentSunday.setDate(reference.getDate() - day)
  currentSunday.setHours(0, 0, 0, 0)

  return Array.from({ length: count }, (_, index) => {
    const sunday = new Date(currentSunday)
    sunday.setDate(currentSunday.getDate() - ((count - 1 - index) * 7))
    const saturday = new Date(sunday)
    saturday.setDate(sunday.getDate() + 6)
    const week = getIsoWeek(sunday)
    return {
      id: `${sunday.getFullYear()}-W${String(week).padStart(2, '0')}`,
      label: `Semana ${week}`,
      inicio: isoDate(sunday),
      fim: isoDate(saturday),
    }
  })
}

function buildMonthRanges(referenceDate, count = 6) {
  const reference = new Date(referenceDate)
  return Array.from({ length: count }, (_, index) => {
    const month = new Date(reference.getFullYear(), reference.getMonth() - (count - 1 - index), 1)
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0)
    return {
      id: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`,
      label: `${MONTHS_PT[month.getMonth()]} ${month.getFullYear()}`,
      inicio: isoDate(month),
      fim: isoDate(end),
    }
  })
}

function buildRemoteDashboardData(snapshot, members, commercial) {
  if (!snapshot?.payload) return null
  const referenceDate = snapshot.synced_at || snapshot.payload?.periodo?.atualizadoEm || new Date().toISOString()
  const aovivo = mapComercialSnapshot(snapshot.payload, { members, commercial })
  const semanas = buildWeekRanges(referenceDate, 10)
    .map(range => mapComercialSnapshot(snapshot.payload, { members, commercial, range }))
  const meses = buildMonthRanges(referenceDate, 8)
    .map(range => mapComercialSnapshot(snapshot.payload, { members, commercial, range }))

  return {
    ...commercial,
    aovivo,
    semanas,
    meses,
  }
}

export default function ComercialDashboard() {
  const { commercial, members } = useData()
  const [remoteSnapshot, setRemoteSnapshot] = useState(null)
  const remoteSnapshotRef = useRef(remoteSnapshot)
  const snapshotIdRef = useRef(remoteSnapshot?.id || null)
  const [remoteStatus, setRemoteStatus] = useState(() => ({
    loading: true,
    error: '',
    message: '',
  }))
  const remoteDashboardData = useMemo(
    () => buildRemoteDashboardData(remoteSnapshot, members, commercial),
    [commercial, members, remoteSnapshot],
  )
  const remotePeriod = remoteDashboardData?.aovivo || null
  const dashboardData = remoteDashboardData || commercial
  const referenceDate = remoteSnapshot?.synced_at || new Date().toISOString()
  const semanas = useMemo(() => {
    const source = Array.isArray(dashboardData.semanas) ? dashboardData.semanas : []
    const periods = source.length ? source : buildWeekRanges(referenceDate, 10).map(emptyPeriodFromRange)
    return periods.map(period => normalizeDashboardPeriod(period))
  }, [dashboardData.semanas, referenceDate])
  const meses = useMemo(() => {
    const source = Array.isArray(dashboardData.meses) ? dashboardData.meses : []
    const periods = source.length ? source : buildMonthRanges(referenceDate, 8).map(emptyPeriodFromRange)
    return periods.map(period => normalizeDashboardPeriod(period))
  }, [dashboardData.meses, referenceDate])
  const aovivo = useMemo(
    () => normalizeDashboardPeriod(dashboardData.aovivo, {
      id: 'aovivo',
      label: 'Ao Vivo',
      inicio: isoDate(new Date(referenceDate)),
      fim: isoDate(new Date(referenceDate)),
      ultimaAtualizacao: referenceDate,
    }),
    [dashboardData.aovivo, referenceDate],
  )
  const [viewMode, setViewMode] = useState('semanal')
  const [semaIdx,  setSemaIdx]  = useState(() => findCurrentWeekIndex(semanas))
  const [mesIdx,   setMesIdx]   = useState(() => findCurrentMonthIndex(meses))

  useEffect(() => {
    remoteSnapshotRef.current = remoteSnapshot
  }, [remoteSnapshot])

  useEffect(() => {
    let cancelled = false
    let fetching = false

    async function fetchLatestSnapshot({ silent = false } = {}) {
      if (fetching) return
      fetching = true

      if (!isSupabaseConfigured || !supabase) {
        setRemoteStatus({ loading: false, error: 'Supabase nao configurado. Dados comerciais remotos indisponiveis.' })
        fetching = false
        return
      }

      if (!silent && !remoteSnapshotRef.current) setRemoteStatus({ loading: true, error: '', message: '' })

      let data, error
      try {
        const result = await Promise.race([
          supabase
            .from('comercial_dashboard_snapshots')
            .select('id, payload, synced_at')
            .eq('source', 'pipefy')
            .order('synced_at', { ascending: false })
            .limit(DASHBOARD_SNAPSHOT_LOOKBACK),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 6000)),
        ])
        data = result.data
        error = result.error
      } catch {
        if (cancelled) return
        setRemoteStatus({
          loading: false,
          error: remoteSnapshotRef.current ? '' : 'Tempo esgotado ao carregar dados comerciais do Supabase.',
        })
        fetching = false
        return
      }

      if (cancelled) return

      if (error) {
        setRemoteStatus({
          loading: false,
          error: remoteSnapshotRef.current ? '' : 'Nao foi possivel carregar dados comerciais do Supabase.',
        })
        console.warn('[ComercialDashboard] Falha ao carregar snapshot comercial:', error.message || error)
        fetching = false
        return
      }

      const snapshots = Array.isArray(data) ? data : []
      const { snapshot: selectedSnapshot, statusMessage } = selectComercialSnapshot(snapshots)

      setRemoteSnapshot(selectedSnapshot)
      remoteSnapshotRef.current = selectedSnapshot
      
      setRemoteStatus({
        loading: false,
        error: selectedSnapshot
          ? ''
          : snapshots.length
            ? 'Snapshot remoto invalido para o pipeline comercial.'
            : 'Nenhum snapshot remoto encontrado no Supabase.',
        message: statusMessage,
      })
      if (selectedSnapshot && snapshotIdRef.current !== selectedSnapshot.id) {
        snapshotIdRef.current = selectedSnapshot.id
        const referenceDate = selectedSnapshot.synced_at || selectedSnapshot.payload?.periodo?.atualizadoEm || new Date().toISOString()
        setSemaIdx(findCurrentWeekIndex(buildWeekRanges(referenceDate, 10)))
        setMesIdx(findCurrentMonthIndex(buildMonthRanges(referenceDate, 8)))
      }
      fetching = false
    }

    fetchLatestSnapshot()
    const intervalId = window.setInterval(() => fetchLatestSnapshot({ silent: true }), DASHBOARD_REFRESH_MS)
    const onFocus = () => fetchLatestSnapshot({ silent: true })
    window.addEventListener('focus', onFocus)
    return () => {
      cancelled = true
      window.clearInterval(intervalId)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  // TODO: [Supabase] substituir por: supabase.from('comercial_semanas').select('*').order('inicio')
  const currentPeriod = useMemo(() => {
    if (viewMode === 'aovivo')  return aovivo
    if (viewMode === 'semanal') return semanas[semaIdx] || emptyPeriodFromRange(buildWeekRanges(referenceDate, 1)[0])
    return meses[mesIdx] || emptyPeriodFromRange(buildMonthRanges(referenceDate, 1)[0])
  }, [aovivo, meses, mesIdx, referenceDate, semaIdx, semanas, viewMode])

  // TODO: [Supabase] carregar período anterior para delta comparativo
  const prevPeriod = useMemo(() => {
    if (viewMode === 'aovivo')  return semanas[findCurrentWeekIndex(semanas)]
    if (viewMode === 'semanal') return semaIdx > 0 ? semanas[semaIdx - 1] : null
    return mesIdx > 0 ? meses[mesIdx - 1] : null
  }, [meses, mesIdx, semaIdx, semanas, viewMode])

  const prevLabel = useMemo(() => {
    if (!prevPeriod) return null
    if (viewMode === 'aovivo')  return 'semana passada'
    if (viewMode === 'semanal') return 'semana anterior'
    return 'mês anterior'
  }, [viewMode, prevPeriod])

  return (
    <div className="space-y-5">

      {/* Cabeçalho + seletor de período */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Comercial</h1>
          <p className="text-gray-500 text-sm mt-0.5">Análise de performance da equipe de vendas</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded border ${
              remotePeriod
                ? 'text-green-400 bg-green-950/30 border-green-900/30'
                : remoteStatus.loading
                  ? 'text-yellow-400 bg-yellow-950/30 border-yellow-900/30'
                  : 'text-gray-500 bg-[#111111] border-[#1E1E1E]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${remotePeriod ? 'bg-green-400' : remoteStatus.loading ? 'bg-yellow-400 animate-pulse' : 'bg-gray-600'}`} />
              {remotePeriod ? remoteStatus.message || 'Snapshot Pipefy carregado' : remoteStatus.loading ? 'Carregando Supabase' : 'Sem snapshot remoto'}
            </span>
            {remoteSnapshot?.synced_at && (
              <span className="text-[10px] text-gray-600">
                Última sincronização: {new Date(remoteSnapshot.synced_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {remoteStatus.error && !remotePeriod && (
              <span className="text-[10px] text-gray-700">{remoteStatus.error}</span>
            )}
          </div>
        </div>
        <PeriodNav
          viewMode={viewMode} setViewMode={setViewMode}
          semaIdx={semaIdx}   setSemaIdx={setSemaIdx}
          mesIdx={mesIdx}     setMesIdx={setMesIdx}
          semanas={semanas}   meses={meses}
          aovivo={aovivo}
        />
      </div>

      {/* ── Seção 1: KPIs (topo) ── */}
      {/* TODO: [Supabase] supabase.from('kpis_comercial').select('*').eq('periodo_id', periodoId) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          label={viewMode === 'aovivo' ? 'Total de Leads' : 'Leads Entrantes'}
          value={currentPeriod.kpis.leadsEntrantes ?? currentPeriod.funil.leadsCadastrados ?? 0}
          prevValue={prevPeriod?.kpis.leadsEntrantes ?? prevPeriod?.funil.leadsCadastrados ?? null}
          format="number"
          Icon={Users}
          accent="#2A6B68"
        />
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
          value={currentPeriod.kpis.contratosFechados ?? currentPeriod.historico.contratosFechados ?? 0}
          prevValue={prevPeriod?.kpis.contratosFechados ?? prevPeriod?.historico.contratosFechados ?? null}
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

        <div className="border-t border-[#1E1E1E] pt-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Indicadores Comerciais
          </p>
          <ComplementaryMetrics funil={currentPeriod.funil} historico={currentPeriod.historico} />
        </div>
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
