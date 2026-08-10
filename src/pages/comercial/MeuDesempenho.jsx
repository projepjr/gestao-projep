import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Calendar, ChevronDown, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import {
  fetchLatestComercialSnapshot,
  isoDate,
} from '../../services/comercialDashboardData'
import { mapComercialSnapshot } from '../../services/comercialSnapshotMapper'

const CYAN = '#00D4D4'
const BLUE = '#5975FF'
const PERIOD_MODES = [
  { id: 'live', label: 'Ao Vivo' },
  { id: 'weekly', label: 'Semanal' },
  { id: 'monthly', label: 'Mensal' },
]
const MAX_WEEKLY_DAYS = 56

function normalize(value) {
  return `${value ?? ''}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function idsEqual(a, b) {
  return String(a ?? '') !== '' && String(a ?? '') === String(b ?? '')
}

function pct(value, total) {
  const numerator = Number(value) || 0
  const denominator = Number(total) || 0
  return denominator > 0 ? Math.round((numerator / denominator) * 100) : 0
}

function average(values) {
  const clean = values.map(Number).filter(value => Number.isFinite(value))
  if (!clean.length) return 0
  return clean.reduce((sum, value) => sum + value, 0) / clean.length
}

function formatMetric(value, isPercent = false) {
  const numeric = Number(value) || 0
  if (isPercent) return `${Math.round(numeric)}%`
  return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(1)
}

function formatDateInput(date) {
  return isoDate(date)
}

function formatLongDate(iso) {
  if (!iso) return ''
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

function formatShortDate(iso) {
  if (!iso) return ''
  const [, month, day] = iso.split('-')
  return `${day}/${month}`
}

function parseDate(iso) {
  if (!iso) return null
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return null
  const date = new Date(year, month - 1, day)
  date.setHours(0, 0, 0, 0)
  return Number.isNaN(date.getTime()) ? null : date
}

function addDays(date, amount) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

function addMonths(date, amount) {
  const next = new Date(date)
  next.setMonth(next.getMonth() + amount)
  return next
}

function clampDate(date, max) {
  return date > max ? new Date(max) : date
}

function daysBetween(start, end) {
  return Math.max(1, Math.round((end - start) / 86400000) + 1)
}

function buildDefaultRange(referenceDate, mode) {
  const end = new Date(referenceDate)
  end.setHours(0, 0, 0, 0)
  const start = new Date(end)

  if (mode === 'monthly') {
    start.setMonth(start.getMonth() - 5)
    start.setDate(1)
  } else {
    start.setDate(start.getDate() - (MAX_WEEKLY_DAYS - 1))
  }

  return {
    start: formatDateInput(start),
    end: formatDateInput(end),
  }
}

function enforcePeriodBounds(mode, startIso, endIso, changed = 'end') {
  if (mode === 'live') return { start: startIso, end: endIso }

  const start = parseDate(startIso)
  const end = parseDate(endIso)
  if (!start || !end) return { start: startIso, end: endIso }

  if (start > end) {
    return changed === 'start'
      ? { start: startIso, end: startIso }
      : { start: endIso, end: endIso }
  }

  if (mode === 'weekly' && daysBetween(start, end) > MAX_WEEKLY_DAYS) {
    if (changed === 'start') {
      const adjustedEnd = addDays(start, MAX_WEEKLY_DAYS - 1)
      return { start: startIso, end: formatDateInput(adjustedEnd) }
    }
    const adjustedStart = addDays(end, -(MAX_WEEKLY_DAYS - 1))
    return { start: formatDateInput(adjustedStart), end: endIso }
  }

  if (mode === 'monthly') {
    const maxEnd = addDays(addMonths(start, 6), -1)
    if (end > maxEnd) {
      if (changed === 'start') {
        return { start: startIso, end: formatDateInput(maxEnd) }
      }
      const adjustedStart = addDays(addMonths(end, -6), 1)
      return { start: formatDateInput(adjustedStart), end: endIso }
    }
  }

  return { start: startIso, end: endIso }
}

function formatSyncDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function buildChartBuckets(startIso, endIso) {
  const start = parseDate(startIso)
  const end = parseDate(endIso)
  if (!start || !end || start > end) return []

  const totalDays = daysBetween(start, end)
  const useMonths = totalDays > 120
  const maxPoints = 8
  const buckets = []
  let cursor = new Date(start)
  let index = 1

  while (cursor <= end && buckets.length < maxPoints) {
    const nextBoundary = useMonths
      ? addDays(addMonths(cursor, 1), -1)
      : addDays(cursor, 6)
    const bucketEnd = clampDate(nextBoundary, end)
    const bucketStart = formatDateInput(cursor)
    const bucketEndIso = formatDateInput(bucketEnd)
    buckets.push({
      label: `${formatShortDate(bucketStart)} a ${formatShortDate(bucketEndIso)}`,
      fim: bucketEndIso,
    })
    cursor = addDays(bucketEnd, 1)
    index += 1
  }

  if (buckets.length && buckets[buckets.length - 1].fim !== endIso) {
    buckets[buckets.length - 1] = {
      ...buckets[buckets.length - 1],
      fim: endIso,
    }
  }

  return buckets
}

function InfoTip({ text }) {
  return (
    <span className="relative inline-flex group align-middle">
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#CE7028] text-[10px] font-bold text-[#CE7028]">
        ?
      </span>
      <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-72 max-w-[calc(100vw-2rem)] -translate-x-1/2 whitespace-normal rounded border border-[#CE7028] bg-[#1E1E1E] px-3 py-2 text-xs font-medium leading-relaxed text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
        {text}
      </span>
    </span>
  )
}

function metricValue(row, metric) {
  if (!row) return 0
  if (metric.compute) return metric.compute(row)
  return Number(row[metric.key]) || 0
}

function createEmptyRows() {
  return { hunters: [], closers: [] }
}

const HUNTER_METRICS = [
  {
    source: 'hunter',
    key: 'leadsCadastrados',
    label: 'Leads cadastrados',
    axis: 'Leads cadastrados',
    help: 'Leads que entraram no funil no periodo e ficaram sob sua responsabilidade.',
  },
  {
    source: 'hunter',
    key: 'leadsTrabalhados',
    label: 'Leads trabalhados',
    axis: 'Leads trabalhados',
    help: 'Leads que sairam do cadastro ou tiveram algum andamento feito por voce no periodo.',
  },
  {
    source: 'hunter',
    key: 'leadsContatados',
    label: 'Leads contatados',
    axis: 'Leads contatados',
    help: 'Leads em que houve contato real com a empresa, como uma ligacao atendida ou resposta util.',
  },
  {
    source: 'hunter',
    key: 'diagnosticasAgendadas',
    label: 'Diagnosticas agendadas',
    axis: 'Diagnosticas agendadas',
    help: 'Reunioes diagnosticas que voce marcou no periodo.',
  },
  {
    source: 'hunter',
    key: 'diagnosticasRealizadas',
    label: 'Diagnosticas realizadas',
    axis: 'Diagnosticas realizadas',
    help: 'Diagnosticas que realmente aconteceram no periodo.',
  },
  {
    source: 'hunter',
    key: 'propostasAgendadas',
    label: 'Propostas agendadas',
    axis: 'Propostas agendadas',
    help: 'Apresentacoes de proposta agendadas em leads trabalhados por voce.',
  },
  {
    source: 'hunter',
    key: 'propostasRealizadas',
    label: 'Propostas realizadas',
    axis: 'Propostas realizadas',
    help: 'Propostas apresentadas em leads que vieram da sua prospeccao.',
  },
  {
    source: 'hunter',
    key: 'noShows',
    label: 'No-shows',
    axis: 'No-shows',
    help: 'Reunioes em que o lead nao apareceu. No-show de diagnostica fica com o Hunter.',
  },
  {
    source: 'hunter',
    key: 'perdidos',
    label: 'Perdidos',
    axis: 'Leads perdidos',
    help: 'Leads enviados para perdidos sob sua responsabilidade no periodo.',
  },
  {
    source: 'hunter',
    key: 'taxaConversao',
    label: 'Taxa de conversao',
    axis: 'Taxa de conversao',
    isPercent: true,
    compute: row => pct(row.diagnosticasRealizadas, row.leadsTrabalhados),
    help: 'Mostra quantos leads trabalhados por voce chegaram ate uma diagnostica realizada.',
  },
]

const CLOSER_METRICS = [
  {
    source: 'closer',
    key: 'diagnosticasRealizadas',
    label: 'Diagnosticas realizadas',
    axis: 'Diagnosticas realizadas',
    help: 'Diagnosticas feitas que chegaram para acompanhamento comercial de fechamento.',
  },
  {
    source: 'closer',
    key: 'propostasAgendadas',
    label: 'Propostas agendadas',
    axis: 'Propostas agendadas',
    help: 'Apresentacoes de proposta que foram marcadas para voce no periodo.',
  },
  {
    source: 'closer',
    key: 'propostasRealizadas',
    label: 'Propostas realizadas',
    axis: 'Propostas realizadas',
    help: 'Apresentacoes de proposta que voce realmente fez no periodo.',
  },
  {
    source: 'closer',
    key: 'noShows',
    label: 'No-shows de proposta',
    axis: 'No-shows de proposta',
    help: 'Propostas que nao aconteceram por ausencia do lead. No-show de proposta fica com o Closer.',
  },
  {
    source: 'closer',
    key: 'emNegociacao',
    label: 'Em negociacao',
    axis: 'Em negociacao',
    help: 'Leads que estao em negociacao e associados a voce.',
  },
  {
    source: 'closer',
    key: 'contratosFechados',
    label: 'Contratos',
    axis: 'Contratos',
    help: 'Contratos fechados por voce no periodo.',
  },
  {
    source: 'closer',
    key: 'taxaContratos',
    label: 'Taxa de contratos',
    axis: 'Taxa de contratos',
    isPercent: true,
    compute: row => pct(row.contratosFechados, row.propostasRealizadas),
    help: 'Mostra quantas propostas apresentadas por voce viraram contratos fechados.',
  },
]

function getRowsForMetric(period, metric) {
  if (!period) return []
  return metric.source === 'closer' ? (period.closers || []) : (period.hunters || [])
}

function findCurrentRow(rows, matchesCurrentUser) {
  return rows.find(matchesCurrentUser) || null
}

function useCurrentIdentity(user, members) {
  const currentMember = useMemo(() => {
    const email = normalize(user?.email)
    return (members || []).find(member =>
      idsEqual(member.id, user?.id) ||
      idsEqual(member.id, user?.supabaseId) ||
      idsEqual(member.supabaseId, user?.id) ||
      idsEqual(member.supabaseId, user?.supabaseId) ||
      (email && normalize(member.email) === email)
    )
  }, [members, user])

  const identityValues = useMemo(() => new Set([
    user?.id,
    user?.supabaseId,
    user?.email,
    user?.nome,
    user?.name,
    currentMember?.id,
    currentMember?.supabaseId,
    currentMember?.email,
    currentMember?.nome,
    currentMember?.name,
  ].map(normalize).filter(Boolean)), [currentMember, user])

  const matchesCurrentUser = useCallback(row => {
    if (!row) return false
    const values = [row.userId, row.profileId, row.memberId, row.email, row.nome, row.name]
    return values.some(value => identityValues.has(normalize(value)))
  }, [identityValues])

  return { currentMember, matchesCurrentUser }
}

export default function MeuDesempenho() {
  const { user } = useAuth()
  const { members, commercial } = useData()
  const [snapshot, setSnapshot] = useState(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedMetricKey, setSelectedMetricKey] = useState('hunter:leadsTrabalhados')
  const [periodMode, setPeriodMode] = useState('weekly')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const loadingSnapshotRef = useRef(false)
  const { matchesCurrentUser } = useCurrentIdentity(user, members)

  const referenceDate = snapshot?.synced_at || new Date().toISOString()

  useEffect(() => {
    if (startDate && endDate) return
    const range = buildDefaultRange(referenceDate, periodMode)
    setStartDate(current => current || range.start)
    setEndDate(current => current || range.end)
  }, [endDate, periodMode, referenceDate, startDate])

  const loadSnapshot = useCallback(async ({ force = false, silent = false } = {}) => {
    if (loadingSnapshotRef.current) return
    loadingSnapshotRef.current = true
    if (!silent) setLoading(true)

    try {
      const result = await fetchLatestComercialSnapshot({ force })
      setSnapshot(result.snapshot)
      setStatusMessage(result.statusMessage || '')
      setError(result.error || '')
    } finally {
      if (!silent) setLoading(false)
      loadingSnapshotRef.current = false
    }
  }, [])

  useEffect(() => {
    loadSnapshot()
  }, [loadSnapshot])

  useEffect(() => {
    const handler = () => loadSnapshot({ force: true })
    window.addEventListener('projep:refresh-data', handler)
    return () => window.removeEventListener('projep:refresh-data', handler)
  }, [loadSnapshot])

  useEffect(() => {
    if (periodMode === 'live') return
    if (!startDate || !endDate) return
    const adjusted = enforcePeriodBounds(periodMode, startDate, endDate)
    if (adjusted.start !== startDate) setStartDate(adjusted.start)
    if (adjusted.end !== endDate) setEndDate(adjusted.end)
  }, [endDate, periodMode, startDate])

  const activeRange = useMemo(() => {
    if (periodMode === 'live') return null
    if (!startDate || !endDate) return null
    return {
      id: periodMode,
      label: periodMode === 'weekly' ? 'Periodo semanal' : 'Periodo mensal',
      inicio: startDate,
      fim: endDate,
    }
  }, [endDate, periodMode, startDate])

  const fullPeriod = useMemo(() => {
    if (!snapshot?.payload) return createEmptyRows()
    if (periodMode !== 'live' && (!startDate || !endDate)) return createEmptyRows()
    return mapComercialSnapshot(snapshot.payload, {
      members,
      commercial,
      range: activeRange,
    })
  }, [activeRange, commercial, endDate, members, periodMode, snapshot, startDate])

  const availableMetrics = useMemo(() => {
    const hasHunter = (fullPeriod.hunters || []).some(matchesCurrentUser)
    const hasCloser = (fullPeriod.closers || []).some(matchesCurrentUser)
    const list = [
      ...(hasHunter ? HUNTER_METRICS : []),
      ...(hasCloser ? CLOSER_METRICS : []),
    ]
    return list.length ? list : HUNTER_METRICS
  }, [fullPeriod, matchesCurrentUser])

  useEffect(() => {
    if (!availableMetrics.some(metric => `${metric.source}:${metric.key}` === selectedMetricKey)) {
      const fallback = availableMetrics[0] || HUNTER_METRICS[1]
      setSelectedMetricKey(`${fallback.source}:${fallback.key}`)
    }
  }, [availableMetrics, selectedMetricKey])

  const selectedMetric = useMemo(() => {
    return availableMetrics.find(metric => `${metric.source}:${metric.key}` === selectedMetricKey) ||
      availableMetrics[0] ||
      HUNTER_METRICS[1]
  }, [availableMetrics, selectedMetricKey])

  const currentRows = getRowsForMetric(fullPeriod, selectedMetric)
  const currentRow = findCurrentRow(currentRows, matchesCurrentUser)
  const userValue = metricValue(currentRow, selectedMetric)
  const teamAverage = average(currentRows.map(row => metricValue(row, selectedMetric)))

  const chartData = useMemo(() => {
    if (!snapshot?.payload) return []

    if (periodMode === 'live') {
      const rows = getRowsForMetric(fullPeriod, selectedMetric)
      const row = findCurrentRow(rows, matchesCurrentUser)
      const value = metricValue(row, selectedMetric)
      const media = average(rows.map(item => metricValue(item, selectedMetric)))
      return [
        { label: 'Inicio', voce: value, media },
        { label: 'Total', voce: value, media },
      ]
    }

    if (!startDate || !endDate) return []
    return buildChartBuckets(startDate, endDate).map(bucket => {
      const period = mapComercialSnapshot(snapshot.payload, {
        members,
        commercial,
        range: { id: bucket.label, label: bucket.label, inicio: startDate, fim: bucket.fim },
      })
      const rows = getRowsForMetric(period, selectedMetric)
      const row = findCurrentRow(rows, matchesCurrentUser)
      return {
        label: bucket.label,
        voce: metricValue(row, selectedMetric),
        media: average(rows.map(item => metricValue(item, selectedMetric))),
      }
    })
  }, [commercial, endDate, fullPeriod, matchesCurrentUser, members, periodMode, selectedMetric, snapshot, startDate])

  const hasCommercialLink = Boolean(currentRow)
  const periodText = startDate && endDate
    ? periodMode === 'live'
      ? 'todo o historico disponivel'
      : `${formatLongDate(startDate)} - ${formatLongDate(endDate)}`
    : 'periodo selecionado'

  const handleModeChange = mode => {
    setPeriodMode(mode)
    if (mode === 'live') return
    const range = buildDefaultRange(referenceDate, mode)
    setStartDate(range.start)
    setEndDate(range.end)
  }

  const handleStartDateChange = value => {
    const adjusted = enforcePeriodBounds(periodMode, value, endDate || value, 'start')
    setStartDate(adjusted.start)
    setEndDate(adjusted.end)
  }

  const handleEndDateChange = value => {
    const adjusted = enforcePeriodBounds(periodMode, startDate || value, value, 'end')
    setStartDate(adjusted.start)
    setEndDate(adjusted.end)
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-[#6B7895]">Comercial</p>
        <h1 className="mt-1 text-3xl font-extrabold text-white">Meu Desempenho</h1>
        <p className="mt-2 text-[#8A95AD]">
          Escolha uma metrica e compare seu resultado com a media do time.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {statusMessage && (
            <span className="rounded border border-green-900/40 bg-green-950/30 px-3 py-1.5 font-semibold text-green-400">
              {statusMessage}
            </span>
          )}
          {snapshot?.synced_at && (
            <span className="rounded border border-[#1E1E1E] bg-[#111111] px-3 py-1.5 text-[#8A95AD]">
              Ultima sincronizacao: {formatSyncDate(snapshot.synced_at)}
            </span>
          )}
          {error && (
            <span className="rounded border border-yellow-900/40 bg-yellow-950/20 px-3 py-1.5 text-yellow-300">
              {error}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[420px] items-center justify-center rounded border border-[#1E1E1E] bg-[#111111]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#CE7028]/30 border-t-[#CE7028]" />
        </div>
      ) : !hasCommercialLink ? (
        <div className="rounded border border-[#1E1E1E] bg-[#111111] p-10 text-center">
          <User className="mx-auto mb-4 text-[#6B7895]" size={42} />
          <h2 className="text-xl font-extrabold text-white">Nenhum vinculo comercial encontrado para seu usuario.</h2>
          <p className="mx-auto mt-2 max-w-2xl text-[#6B7895]">
            Para aparecer aqui, sua conta precisa estar vinculada como Hunter ou Closer em Comercial &gt; Equipe.
          </p>
        </div>
      ) : (
        <section className="overflow-hidden rounded border border-[#1E1E1E] bg-[#111111] shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
          <div className="flex flex-col gap-6 border-b border-[#1E1E1E] p-6 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h2 className="text-center text-xl font-extrabold text-white xl:text-left">Você x média do time</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[auto_150px_150px_220px]">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6B7895]">Visualizacao</span>
                <div className="flex h-11 rounded border border-[#1E1E1E] bg-[#0A0A0A] p-1">
                  {PERIOD_MODES.map(mode => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => handleModeChange(mode.id)}
                      className={`rounded px-3 text-sm font-bold transition ${
                        periodMode === mode.id
                          ? 'bg-[#CE7028] text-white'
                          : 'text-[#8A95AD] hover:text-white'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6B7895]">Data inicial</span>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    disabled={periodMode === 'live'}
                    max={endDate || undefined}
                    onChange={event => handleStartDateChange(event.target.value)}
                    className="h-11 w-full min-w-[150px] rounded border border-[#1E1E1E] bg-[#0A0A0A] px-3 text-sm font-bold text-white outline-none focus:border-[#CE7028] disabled:cursor-not-allowed disabled:opacity-40"
                  />
                  <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7895]" size={15} />
                </div>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6B7895]">Data final</span>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    disabled={periodMode === 'live'}
                    min={startDate || undefined}
                    onChange={event => handleEndDateChange(event.target.value)}
                    className="h-11 w-full min-w-[150px] rounded border border-[#1E1E1E] bg-[#0A0A0A] px-3 text-sm font-bold text-white outline-none focus:border-[#CE7028] disabled:cursor-not-allowed disabled:opacity-40"
                  />
                  <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7895]" size={15} />
                </div>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6B7895]">Metrica</span>
                <div className="relative">
                  <select
                    value={selectedMetricKey}
                    onChange={event => setSelectedMetricKey(event.target.value)}
                    className="h-11 w-full min-w-[200px] appearance-none rounded border border-[#1E1E1E] bg-[#0A0A0A] px-3 pr-9 text-sm font-bold text-white outline-none focus:border-[#CE7028]"
                  >
                    {availableMetrics.map(metric => (
                      <option key={`${metric.source}:${metric.key}`} value={`${metric.source}:${metric.key}`}>
                        {metric.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white" size={16} />
                </div>
              </label>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col gap-4 rounded border border-[#1E1E1E] bg-[#0A0A0A] px-4 py-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-white">{selectedMetric.label}</span>
                <InfoTip text={selectedMetric.help} />
              </div>
              <div className="text-sm md:text-right">
                <p className="font-semibold text-[#8A95AD]">
                  Você:{' '}
                  <strong className="text-[#00D4D4]">{formatMetric(userValue, selectedMetric.isPercent)}</strong>
                  <span className="mx-3 text-[#39445D]">|</span>
                  Média do time:{' '}
                  <strong className="text-[#5975FF]">{formatMetric(teamAverage, selectedMetric.isPercent)}</strong>
                </p>
                <p className="mt-1 text-[11px] text-[#6B7895]">
                  Total acumulado no periodo selecionado ({periodText})
                </p>
              </div>
            </div>

            <div className="mt-7 h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 12, right: 24, left: 8, bottom: 12 }}>
                  <CartesianGrid stroke="#1E1E1E" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    stroke="#6B7895"
                    tick={{ fill: '#8A95AD', fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#6B7895"
                    tick={{ fill: '#8A95AD', fontSize: 12 }}
                    tickLine={false}
                    label={{
                      value: selectedMetric.axis || selectedMetric.label,
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#8A95AD',
                      fontSize: 12,
                    }}
                    domain={selectedMetric.isPercent ? [0, 100] : ['auto', 'auto']}
                    tickFormatter={value => formatMetric(value, selectedMetric.isPercent)}
                  />
                  <ChartTooltip
                    cursor={{ stroke: 'rgba(255,255,255,0.08)' }}
                    contentStyle={{ background: '#111111', border: '1px solid #1E1E1E', borderRadius: 8, color: '#fff' }}
                    labelStyle={{ color: '#8A95AD' }}
                    formatter={(value, name) => [
                      formatMetric(value, selectedMetric.isPercent),
                      name === 'voce' ? 'Você' : 'Média do time',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="voce"
                    name="Você"
                    stroke={CYAN}
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 2, fill: CYAN }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="media"
                    name="Média do time"
                    stroke={BLUE}
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 2, fill: BLUE }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 flex items-center justify-center gap-6 text-xs font-bold">
              <span className="inline-flex items-center gap-2 text-white">
                <span className="h-2 w-5 rounded-full" style={{ backgroundColor: CYAN }} />
                Você
              </span>
              <span className="inline-flex items-center gap-2 text-white">
                <span className="h-2 w-5 rounded-full" style={{ backgroundColor: BLUE }} />
                Média do time
              </span>
            </div>
          </div>
        </section>
      )}

    </div>
  )
}
