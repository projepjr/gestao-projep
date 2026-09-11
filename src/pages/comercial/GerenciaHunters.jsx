import { memo, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChevronDown, Search, Target, Users } from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { fetchLatestComercialSnapshot, getCachedComercialSnapshot, isoDate } from '../../services/comercialDashboardData'
import { mapComercialSnapshot } from '../../services/comercialSnapshotMapper'
import LeadsInsights from './Leads'

const MAX_WEEKLY_DAYS = 56
const COLORS = ['#00D4D4', '#5975FF', '#CE7028', '#22C55E', '#A855F7', '#F43F5E', '#F59E0B']

function pct(value, total) {
  const numerator = Number(value) || 0
  const denominator = Number(total) || 0
  return denominator > 0 ? Math.round((numerator / denominator) * 100) : 0
}

function average(values) {
  const clean = values.map(Number).filter(Number.isFinite)
  return clean.length ? clean.reduce((sum, value) => sum + value, 0) / clean.length : 0
}

function formatMetric(value, isPercent = false) {
  const number = Number(value) || 0
  if (isPercent) return `${Math.round(number)}%`
  return Number.isInteger(number) ? String(number) : number.toFixed(1)
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

function daysBetween(start, end) {
  return Math.max(1, Math.round((end - start) / 86400000) + 1)
}

function formatShortDate(iso) {
  if (!iso) return ''
  const [, month, day] = iso.split('-')
  return `${day}/${month}`
}

function formatLongDate(iso) {
  if (!iso) return ''
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

function formatDateInput(date) {
  return isoDate(date)
}

function buildDefaultRange(referenceDate, mode) {
  const end = new Date(referenceDate)
  end.setHours(0, 0, 0, 0)
  const start = new Date(end)

  if (mode === 'custom') {
    start.setDate(1)
  } else if (mode === 'monthly') {
    start.setMonth(start.getMonth() - 5)
    start.setDate(1)
  } else {
    start.setDate(start.getDate() - (MAX_WEEKLY_DAYS - 1))
  }

  return { start: formatDateInput(start), end: formatDateInput(end) }
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
      return { start: startIso, end: formatDateInput(addDays(start, MAX_WEEKLY_DAYS - 1)) }
    }
    return { start: formatDateInput(addDays(end, -(MAX_WEEKLY_DAYS - 1))), end: endIso }
  }

  if (mode === 'monthly') {
    const maxEnd = addDays(addMonths(start, 6), -1)
    if (end > maxEnd) {
      if (changed === 'start') return { start: startIso, end: formatDateInput(maxEnd) }
      return { start: formatDateInput(addDays(addMonths(end, -6), 1)), end: endIso }
    }
  }

  return { start: startIso, end: endIso }
}

function buildChartBuckets(startIso, endIso) {
  const start = parseDate(startIso)
  const end = parseDate(endIso)
  if (!start || !end || start > end) return []

  const totalDays = daysBetween(start, end)
  const useMonths = totalDays > 120
  const buckets = []
  let cursor = new Date(start)

  while (cursor <= end && buckets.length < 8) {
    const boundary = useMonths ? addDays(addMonths(cursor, 1), -1) : addDays(cursor, 6)
    const bucketEnd = boundary > end ? end : boundary
    const bucketStartIso = formatDateInput(cursor)
    const bucketEndIso = formatDateInput(bucketEnd)
    buckets.push({
      label: `${formatShortDate(bucketStartIso)} a ${formatShortDate(bucketEndIso)}`,
      inicio: bucketStartIso,
      fim: bucketEndIso,
    })
    cursor = addDays(bucketEnd, 1)
  }

  return buckets
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

function InfoTip({ text }) {
  if (!text) return null
  return (
    <span className="relative inline-flex group align-middle">
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#CE7028] text-[10px] font-bold text-[#CE7028]">
        ?
      </span>
      <span className="pointer-events-none absolute left-1/2 top-full z-40 mt-2 w-72 max-w-[calc(100vw-2rem)] -translate-x-1/2 whitespace-normal rounded border border-[#CE7028] bg-[#1E1E1E] px-3 py-2 text-xs font-medium leading-relaxed text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
        {text}
      </span>
    </span>
  )
}

const HUNTER_COLS = [
  { key: 'nome', label: 'Hunter' },
  { key: 'leadsCadastrados', label: 'Leads Cad.', tip: 'Leads que entraram no pipeline no período e ficaram sob responsabilidade deste Hunter.' },
  { key: 'leadsTrabalhados', label: 'Leads Trab.', tip: 'Leads do período que tiveram algum andamento feito por este Hunter.' },
  { key: 'leadsContatados', label: 'Leads Cont.', tip: 'Leads que responderam ou avançaram para uma etapa que indica contato real.' },
  { key: 'diagnosticasAgendadas', label: 'Diag. Ag.', tip: 'Reuniões diagnósticas que este Hunter marcou no período.' },
  { key: 'diagnosticasRealizadas', label: 'Diag. Real.', tip: 'Diagnósticas que realmente aconteceram sob responsabilidade deste Hunter.' },
  { key: 'propostasAgendadas', label: 'Prop. Ag.', tip: 'Propostas agendadas relacionadas aos leads deste Hunter.' },
  { key: 'propostasRealizadas', label: 'Prop. Real.', tip: 'Leads deste Hunter que chegaram a uma proposta apresentada.' },
  { key: 'noShows', label: 'No-shows', tip: 'Bolos em diagnósticas. Essa responsabilidade fica com o Hunter.' },
  { key: 'perdidos', label: 'Perdidos', tip: 'Leads deste Hunter que foram marcados como perdidos no período.' },
  { key: 'taxaConversao', label: 'Taxa Conv.', tip: 'Mostra quantos leads trabalhados pelo Hunter chegaram até uma diagnóstica realizada.' },
]

const HUNTER_METRICS = [
  { key: 'leadsCadastrados', label: 'Leads cadastrados' },
  { key: 'leadsTrabalhados', label: 'Leads trabalhados' },
  { key: 'leadsContatados', label: 'Leads contatados' },
  { key: 'diagnosticasAgendadas', label: 'Diagnósticas agendadas' },
  { key: 'diagnosticasRealizadas', label: 'Diagnósticas realizadas' },
  { key: 'propostasAgendadas', label: 'Propostas agendadas' },
  { key: 'propostasRealizadas', label: 'Propostas realizadas' },
  { key: 'noShows', label: 'No-shows' },
  { key: 'perdidos', label: 'Perdidos' },
  {
    key: 'taxaConversao',
    label: 'Taxa de conversão',
    isPercent: true,
    compute: row => pct(row.diagnosticasRealizadas || 0, row.leadsTrabalhados || 0),
  },
]

function rowMetric(row, metric) {
  if (!row) return 0
  if (metric.compute) return metric.compute(row)
  return Number(row[metric.key]) || 0
}

function hunterId(row) {
  return String(row?.id || row?.email || row?.nome || '')
}

function emptyPeriod() {
  return { hunters: [], closers: [] }
}

const HunterComparisonChart = memo(function HunterComparisonChart({
  chartData,
  selectedRows,
  selectedMetric,
  showTeamAverage,
}) {
  if (chartData.length === 0 || (!showTeamAverage && selectedRows.length === 0)) {
    return (
      <div className="flex h-[330px] items-center justify-center text-sm text-gray-600">
        Selecione ao menos um hunter para visualizar o gráfico.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={340}>
      <LineChart data={chartData} margin={{ top: 24, right: 28, left: -18, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" />
        <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={{ stroke: '#374151' }} tickLine={false} />
        <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={{ stroke: '#374151' }} tickLine={false} />
        <ChartTooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            return (
              <div className="rounded-md border border-[#1E1E1E] bg-[#111111] p-3 text-xs shadow-xl">
                <p className="mb-2 font-semibold text-white">{label}</p>
                {payload.map(item => (
                  <p key={item.dataKey} style={{ color: item.color }} className="font-semibold">
                    {item.name}: {formatMetric(item.value, selectedMetric.isPercent)}
                  </p>
                ))}
              </div>
            )
          }}
        />
        {showTeamAverage && (
          <Line
            type="monotone"
            dataKey="media"
            name="Média do time"
            stroke="#5975FF"
            strokeWidth={2.5}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />
        )}
        {selectedRows.map((row, index) => (
          <Line
            key={hunterId(row)}
            type="monotone"
            dataKey={`hunter_${hunterId(row)}`}
            name={row.nome}
            stroke={COLORS[index % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
})

function HunterAnalysis() {
  const { members, commercial } = useData()
  const initialSnapshotResult = useMemo(() => getCachedComercialSnapshot(), [])
  const [snapshot, setSnapshot] = useState(() => initialSnapshotResult?.snapshot || null)
  const [statusMessage, setStatusMessage] = useState(() => initialSnapshotResult?.statusMessage || '')
  const [error, setError] = useState(() => initialSnapshotResult?.error || '')
  const [loading, setLoading] = useState(() => !initialSnapshotResult?.snapshot)
  const [periodMode, setPeriodMode] = useState('weekly')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedMetricKey, setSelectedMetricKey] = useState('leadsTrabalhados')
  const [selectedHunters, setSelectedHunters] = useState([])
  const [showTeamAverage, setShowTeamAverage] = useState(true)
  const [hunterSearch, setHunterSearch] = useState('')
  const loadingRef = useRef(false)

  const referenceDate = snapshot?.synced_at || new Date().toISOString()

  const loadSnapshot = useCallback(async ({ force = false, silent = false } = {}) => {
    if (loadingRef.current) return
    loadingRef.current = true
    if (!silent) setLoading(true)

    try {
      const result = await fetchLatestComercialSnapshot({ force })
      setSnapshot(result.snapshot)
      setStatusMessage(result.statusMessage || '')
      setError(result.error || '')
    } finally {
      if (!silent) setLoading(false)
      loadingRef.current = false
    }
  }, [])

  useEffect(() => {
    const initialLoadId = window.setTimeout(loadSnapshot, 0)
    return () => window.clearTimeout(initialLoadId)
  }, [loadSnapshot])

  useEffect(() => {
    const handler = () => loadSnapshot()
    window.addEventListener('projep:refresh-data', handler)
    return () => window.removeEventListener('projep:refresh-data', handler)
  }, [loadSnapshot])

  useEffect(() => {
    if (startDate && endDate) return
    const range = buildDefaultRange(referenceDate, periodMode)
    setStartDate(range.start)
    setEndDate(range.end)
  }, [endDate, periodMode, referenceDate, startDate])

  const activeRange = useMemo(() => {
    if (periodMode === 'live') return null
    if (!startDate || !endDate) return null
    return {
      id: periodMode,
      label: periodMode === 'weekly'
        ? 'Período semanal'
        : periodMode === 'monthly'
          ? 'Período mensal'
          : 'Período personalizado',
      inicio: startDate,
      fim: endDate,
    }
  }, [endDate, periodMode, startDate])

  const periodData = useMemo(() => {
    if (!snapshot?.payload) return emptyPeriod()
    if (periodMode !== 'live' && (!startDate || !endDate)) return emptyPeriod()
    return mapComercialSnapshot(snapshot.payload, { members, commercial, range: activeRange })
  }, [activeRange, commercial, members, periodMode, snapshot?.payload, startDate, endDate])

  const hunters = periodData.hunters || []
  const hunterKeyList = hunters.map(hunterId).join('|')

  useEffect(() => {
    const keys = hunters.map(hunterId)
    setSelectedHunters(current => {
      const kept = current.filter(key => keys.includes(key))
      return kept.length ? kept : keys
    })
  }, [hunterKeyList])

  const selectedMetric = HUNTER_METRICS.find(metric => metric.key === selectedMetricKey) || HUNTER_METRICS[0]
  const selectedHunterSet = useMemo(() => new Set(selectedHunters), [selectedHunters])
  const selectedRows = useMemo(
    () => hunters.filter(row => selectedHunterSet.has(hunterId(row))),
    [hunters, selectedHunterSet]
  )
  const teamAverage = useMemo(
    () => average(hunters.map(row => rowMetric(row, selectedMetric))),
    [hunters, selectedMetric],
  )
  const selectedAverage = useMemo(
    () => average(selectedRows.map(row => rowMetric(row, selectedMetric))),
    [selectedMetric, selectedRows],
  )

  const chartPeriods = useMemo(() => {
    if (!snapshot?.payload) return []

    if (periodMode === 'live') {
      return [
        { label: 'Início', rows: hunters },
        { label: 'Total', rows: hunters },
      ]
    }

    return buildChartBuckets(startDate, endDate).map(bucket => {
      const mapped = mapComercialSnapshot(snapshot.payload, { members, commercial, range: {
        id: bucket.label,
        label: bucket.label,
        inicio: bucket.inicio,
        fim: bucket.fim,
      } })
      return { label: bucket.label, rows: mapped.hunters || [] }
    })
  }, [commercial, endDate, hunters, members, periodMode, snapshot?.payload, startDate])

  const chartData = useMemo(() => chartPeriods.map(({ label, rows }) => {
    const point = {
      label,
      media: average(rows.map(row => rowMetric(row, selectedMetric))),
    }
    rows.forEach(row => {
      point[`hunter_${hunterId(row)}`] = rowMetric(row, selectedMetric)
    })
    return point
  }), [chartPeriods, selectedMetric])

  const deferredSelectedHunters = useDeferredValue(selectedHunters)
  const chartHunterSet = useMemo(
    () => new Set(deferredSelectedHunters),
    [deferredSelectedHunters],
  )
  const chartSelectedRows = useMemo(
    () => hunters.filter(row => chartHunterSet.has(hunterId(row))),
    [chartHunterSet, hunters],
  )

  const handleModeChange = mode => {
    setPeriodMode(mode)
    if (mode === 'live') return
    const range = buildDefaultRange(referenceDate, mode)
    setStartDate(range.start)
    setEndDate(range.end)
  }

  const handleStartDateChange = value => {
    if (!value) return
    const adjusted = enforcePeriodBounds(periodMode, value, endDate || value, 'start')
    setStartDate(adjusted.start)
    setEndDate(adjusted.end)
  }

  const handleEndDateChange = value => {
    if (!value) return
    const adjusted = enforcePeriodBounds(periodMode, startDate || value, value, 'end')
    setStartDate(adjusted.start)
    setEndDate(adjusted.end)
  }

  const toggleHunter = useCallback(key => {
    setSelectedHunters(current =>
      current.includes(key) ? current.filter(item => item !== key) : [...current, key]
    )
  }, [])

  const filteredHunters = useMemo(() =>
    hunters.filter(row =>
      row.nome?.toLowerCase().includes(hunterSearch.trim().toLowerCase())
    ),
    [hunterSearch, hunters]
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Análise de Hunters</h2>
          <p className="mt-1 text-sm text-gray-500">Tabela do time e comparativo por métrica.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 text-[10px] font-semibold ${
              snapshot
                ? 'border-green-900/30 bg-green-950/30 text-green-400'
                : loading
                  ? 'border-yellow-900/30 bg-yellow-950/30 text-yellow-400'
                  : 'border-[#1E1E1E] bg-[#111111] text-gray-500'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${snapshot ? 'bg-green-400' : loading ? 'animate-pulse bg-yellow-400' : 'bg-gray-600'}`} />
              {snapshot ? statusMessage || 'Snapshot Pipefy carregado' : loading ? 'Carregando dados' : 'Sem snapshot remoto'}
            </span>
            {snapshot?.synced_at && (
              <span className="text-[10px] text-gray-600">Última sincronização: {formatSyncDate(snapshot.synced_at)}</span>
            )}
            {error && !snapshot && <span className="text-[10px] text-red-400">{error}</span>}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div className="inline-flex rounded-md border border-[#1E1E1E] bg-[#111111] p-1">
            {[
              ['live', 'Ao Vivo'],
              ['weekly', 'Semanal'],
              ['monthly', 'Mensal'],
              ['custom', 'Personalizado'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleModeChange(key)}
                className={`rounded px-3 py-2 text-xs font-semibold transition-colors ${
                  periodMode === key ? 'bg-[#CE7028] text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {periodMode !== 'live' && (
            <>
              <label className="space-y-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-600">Data inicial</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={event => handleStartDateChange(event.target.value)}
                  className="rounded border border-[#1E1E1E] bg-[#0D0D0D] px-3 py-2 text-xs font-semibold text-white outline-none focus:border-[#CE7028]"
                />
              </label>
              <label className="space-y-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-600">Data final</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={event => handleEndDateChange(event.target.value)}
                  className="rounded border border-[#1E1E1E] bg-[#0D0D0D] px-3 py-2 text-xs font-semibold text-white outline-none focus:border-[#CE7028]"
                />
              </label>
            </>
          )}
        </div>
      </div>

      <section className="rounded-md border border-[#1E1E1E] bg-[#111111] p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Hunters</h3>
            <p className="mt-1 text-xs text-gray-600">Prospecção, contato e diagnóstica.</p>
          </div>
          <span className="rounded border border-[#1E1E1E] px-2 py-1 text-[10px] font-semibold text-gray-500">{hunters.length} hunter(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1E1E1E]">
                {HUNTER_COLS.map(col => (
                  <th key={col.key} className="whitespace-nowrap pr-4 pb-2 text-left font-semibold text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      <InfoTip text={col.tip} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hunters.length === 0 && (
                <tr>
                  <td colSpan={HUNTER_COLS.length} className="py-8 text-center text-gray-600">
                    Nenhum hunter configurado em Comercial &gt; Equipe.
                  </td>
                </tr>
              )}
              {hunters.map(row => {
                const taxa = pct(row.diagnosticasRealizadas || 0, row.leadsTrabalhados || 0)
                return (
                  <tr key={hunterId(row)} className="border-b border-[#0D0D0D] hover:bg-[#0D0D0D]/60">
                    <td className="py-2.5 pr-4 font-semibold text-white whitespace-nowrap">{row.nome}</td>
                    <td className="py-2.5 pr-4 text-gray-300">{row.leadsCadastrados || 0}</td>
                    <td className="py-2.5 pr-4 text-gray-300">{row.leadsTrabalhados || 0}</td>
                    <td className="py-2.5 pr-4 text-gray-300">{row.leadsContatados || 0}</td>
                    <td className="py-2.5 pr-4 text-gray-300">{row.diagnosticasAgendadas || 0}</td>
                    <td className="py-2.5 pr-4 text-gray-300">{row.diagnosticasRealizadas || 0}</td>
                    <td className="py-2.5 pr-4 text-gray-300">{row.propostasAgendadas || 0}</td>
                    <td className="py-2.5 pr-4 text-gray-300">{row.propostasRealizadas || 0}</td>
                    <td className="py-2.5 pr-4 text-gray-500">{row.noShows || 0}</td>
                    <td className={`py-2.5 pr-4 ${row.perdidos > 0 ? 'text-red-400' : 'text-gray-500'}`}>{row.perdidos || 0}</td>
                    <td className={`py-2.5 pr-4 font-bold ${taxa > 0 ? 'text-green-400' : 'text-red-400'}`}>{taxa}%</td>
                  </tr>
                )
              })}
              {hunters.length > 0 && (
                <tr className="border-t border-[#2A2A2A] bg-[#0D0D0D]/40">
                  <td className="py-2.5 pr-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">Média geral</td>
                  {HUNTER_COLS.slice(1, -1).map(col => (
                    <td key={col.key} className="py-2.5 pr-4 font-semibold text-gray-500">
                      {average(hunters.map(row => Number(row[col.key]) || 0)).toFixed(1)}
                    </td>
                  ))}
                  <td className="py-2.5 pr-4 font-bold text-gray-500">
                    {pct(
                      hunters.reduce((sum, row) => sum + (row.diagnosticasRealizadas || 0), 0),
                      hunters.reduce((sum, row) => sum + (row.leadsTrabalhados || 0), 0)
                    )}%
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-md border border-[#1E1E1E] bg-[#111111] p-5">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Comparativo do time</h3>
            <p className="mt-1 text-xs text-gray-600">Selecione hunters e acompanhe a evolução junto da média do time.</p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="space-y-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-600">Métrica</span>
              <div className="relative">
                <select
                  value={selectedMetricKey}
                  onChange={event => setSelectedMetricKey(event.target.value)}
                  className="w-56 appearance-none rounded border border-[#1E1E1E] bg-[#0D0D0D] px-3 py-2 pr-8 text-xs font-semibold text-white outline-none focus:border-[#CE7028]"
                >
                  {HUNTER_METRICS.map(metric => (
                    <option key={metric.key} value={metric.key}>{metric.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              </div>
            </label>
            <div className="rounded border border-[#1E1E1E] bg-[#0D0D0D] px-3 py-2 text-xs text-gray-500">
              Selecionados: <span className="font-bold text-white">{selectedRows.length + (showTeamAverage ? 1 : 0)}</span>
              <span className="mx-2 text-gray-700">|</span>
              Média selecionada: <span className="font-bold text-[#00D4D4]">{formatMetric(selectedAverage, selectedMetric.isPercent)}</span>
              <span className="mx-2 text-gray-700">|</span>
              Média do time: <span className="font-bold text-[#5975FF]">{formatMetric(teamAverage, selectedMetric.isPercent)}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[280px_1fr]">
          <div className="rounded-md border border-[#1E1E1E] bg-[#0D0D0D] p-3">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
              <input
                value={hunterSearch}
                onChange={event => setHunterSearch(event.target.value)}
                placeholder="Buscar hunter..."
                className="w-full rounded border border-[#1E1E1E] bg-[#111111] py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-[#CE7028]"
              />
            </div>
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedHunters(hunters.map(hunterId))
                  setShowTeamAverage(true)
                }}
                className="flex-1 rounded bg-[#CE7028] px-2 py-2 text-xs font-semibold text-white"
              >
                Selecionar todos
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedHunters([])
                  setShowTeamAverage(false)
                }}
                className="rounded border border-[#1E1E1E] px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white"
              >
                Limpar
              </button>
            </div>
            <label className={`mb-2 flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-xs transition-colors ${showTeamAverage ? 'bg-[#5975FF]/15 text-white' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}>
              <input
                type="checkbox"
                checked={showTeamAverage}
                onChange={() => setShowTeamAverage(current => !current)}
                className="accent-[#5975FF]"
              />
              <span className="truncate font-semibold">Média do time</span>
            </label>
            <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
              {filteredHunters.map(row => {
                const key = hunterId(row)
                const checked = selectedHunters.includes(key)
                return (
                  <label key={key} className={`flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-xs transition-colors ${checked ? 'bg-[#CE7028]/15 text-white' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleHunter(key)}
                      className="accent-[#CE7028]"
                    />
                    <span className="truncate font-semibold">{row.nome}</span>
                  </label>
                )
              })}
              {filteredHunters.length === 0 && (
                <p className="py-6 text-center text-xs text-gray-600">Nenhum hunter encontrado.</p>
              )}
            </div>
          </div>

          <div className="min-h-[360px] rounded-md border border-[#1E1E1E] bg-[#0D0D0D] p-4">
            <HunterComparisonChart
              chartData={chartData}
              selectedRows={chartSelectedRows}
              selectedMetric={selectedMetric}
              showTeamAverage={showTeamAverage}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export default function GerenciaHunters() {
  const location = useLocation()
  const activeTab = location.pathname.endsWith('/leads') ? 'leads' : 'hunters'

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-md border border-[#CE7028]/30 bg-[#CE7028]/10 text-[#CE7028]">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Gerência de Hunters</h1>
            <p className="mt-1 text-sm text-gray-500">Acompanhe performance dos Hunters e qualidade dos leads.</p>
          </div>
        </div>
        <div className="inline-flex rounded-md border border-[#1E1E1E] bg-[#111111] p-1">
          <Link
            to="/comercial/gerencia-hunters"
            className={`inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === 'hunters' ? 'bg-[#CE7028] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            Hunters
          </Link>
          <Link
            to="/comercial/gerencia-hunters/leads"
            className={`inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === 'leads' ? 'bg-[#CE7028] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Target className="h-4 w-4" />
            Leads
          </Link>
        </div>
      </div>

      {activeTab === 'leads' ? <LeadsInsights /> : <HunterAnalysis />}
    </div>
  )
}
