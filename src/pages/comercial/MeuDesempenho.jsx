import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BarChart2, Calendar, ChevronLeft, ChevronRight, Radio, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import {
  buildRemoteDashboardData,
  buildMonthRanges,
  buildWeekRanges,
  fetchLatestComercialSnapshot,
  findCurrentMonthIndex,
  findCurrentWeekIndex,
  fmtDate,
} from '../../services/comercialDashboardData'

const ORANGE = '#CE7028'
const GREEN = '#044947'

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

function InfoTip({ text }) {
  return (
    <span className="relative inline-flex group align-middle">
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#CE7028] text-[10px] font-bold text-[#CE7028]">
        ?
      </span>
      <span className="pointer-events-none absolute right-0 top-full z-30 mt-2 w-72 rounded border border-[#CE7028] bg-[#1E1E1E] px-3 py-2 text-xs font-medium leading-relaxed text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 sm:left-1/2 sm:right-auto sm:-translate-x-1/2">
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

function emptyPeriod(range = {}) {
  return {
    id: range.id || 'vazio',
    label: range.label || 'Ao Vivo',
    inicio: range.inicio,
    fim: range.fim,
    hunters: [],
    closers: [],
    kpis: { ticketMedio: 0, contratosFechados: 0, receitaTotal: 0, taxaConversao: 0 },
  }
}

const HUNTER_METRICS = [
  {
    key: 'leadsCadastrados',
    label: 'Leads cadastrados',
    help: 'Leads do período que estão sob sua responsabilidade no funil.',
  },
  {
    key: 'leadsTrabalhados',
    label: 'Leads trabalhados',
    help: 'Leads que tiveram algum avanço feito por você no período.',
  },
  {
    key: 'leadsContatados',
    label: 'Leads contatados',
    help: 'Leads em que houve contato real com a empresa, como ligação atendida ou resposta útil.',
  },
  {
    key: 'diagnosticasAgendadas',
    label: 'Diagnósticas agendadas',
    help: 'Reuniões diagnósticas que você marcou no período.',
  },
  {
    key: 'diagnosticasRealizadas',
    label: 'Diagnósticas realizadas',
    help: 'Diagnósticas que realmente aconteceram no período.',
  },
  {
    key: 'propostasAgendadas',
    label: 'Propostas agendadas',
    help: 'Apresentações de proposta agendadas nos seus leads.',
  },
  {
    key: 'propostasRealizadas',
    label: 'Propostas realizadas',
    help: 'Propostas que foram apresentadas no período.',
  },
  {
    key: 'noShows',
    label: 'No-shows',
    help: 'Reuniões que não aconteceram por ausência do lead. No-show de diagnóstica fica com o Hunter.',
  },
  {
    key: 'perdidos',
    label: 'Perdidos',
    help: 'Leads marcados como perdidos sob sua responsabilidade no período.',
  },
  {
    key: 'taxaConversao',
    label: 'Taxa de conversão',
    isPercent: true,
    compute: row => pct(row.diagnosticasRealizadas, row.leadsTrabalhados),
    help: 'Mostra quantos leads trabalhados por você chegaram até uma diagnóstica realizada.',
  },
]

const CLOSER_METRICS = [
  {
    key: 'diagnosticasRealizadas',
    label: 'Diagnósticas realizadas',
    help: 'Diagnósticas feitas que chegaram para acompanhamento comercial de fechamento.',
  },
  {
    key: 'propostasAgendadas',
    label: 'Propostas agendadas',
    help: 'Apresentações de proposta que foram marcadas para você no período.',
  },
  {
    key: 'propostasRealizadas',
    label: 'Propostas realizadas',
    help: 'Apresentações de proposta que você realmente fez no período.',
  },
  {
    key: 'noShows',
    label: 'No-shows',
    help: 'Propostas que não aconteceram por ausência do lead. No-show de proposta fica com o Closer.',
  },
  {
    key: 'emNegociacao',
    label: 'Em negociação',
    help: 'Leads que estão em negociação e associados a você.',
  },
  {
    key: 'contratosFechados',
    label: 'Contratos',
    help: 'Contratos fechados por você no período.',
  },
  {
    key: 'taxaContratos',
    label: 'Taxa de contratos',
    isPercent: true,
    compute: row => pct(row.contratosFechados, row.propostasRealizadas),
    help: 'Mostra quantas propostas apresentadas por você viraram contratos fechados.',
  },
]

export default function MeuDesempenho() {
  const { user } = useAuth()
  const { members, commercial } = useData()
  const [snapshot, setSnapshot] = useState(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('aovivo')
  const [roleView, setRoleView] = useState('hunter')
  const [selectedMetricKey, setSelectedMetricKey] = useState(HUNTER_METRICS[1].key)
  const loadingSnapshotRef = useRef(false)

  const referenceDate = snapshot?.synced_at || new Date().toISOString()
  const weeks = useMemo(() => buildWeekRanges(referenceDate, 10), [referenceDate])
  const months = useMemo(() => buildMonthRanges(referenceDate, 8), [referenceDate])
  const [weekIndex, setWeekIndex] = useState(0)
  const [monthIndex, setMonthIndex] = useState(0)

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
    setWeekIndex(findCurrentWeekIndex(weeks))
  }, [weeks])

  useEffect(() => {
    setMonthIndex(findCurrentMonthIndex(months))
  }, [months])

  const dashboardData = useMemo(
    () => buildRemoteDashboardData(snapshot, members, commercial),
    [snapshot, members, commercial]
  )

  const periods = useMemo(() => ({
    aovivo: dashboardData?.aovivo || emptyPeriod(),
    semanas: dashboardData?.semanas?.length
      ? dashboardData.semanas
      : weeks.map(emptyPeriod),
    meses: dashboardData?.meses?.length
      ? dashboardData.meses
      : months.map(emptyPeriod),
  }), [dashboardData, weeks, months])

  const activePeriod = viewMode === 'semanal'
    ? (periods.semanas[weekIndex] || emptyPeriod(weeks[weekIndex]))
    : viewMode === 'mensal'
      ? (periods.meses[monthIndex] || emptyPeriod(months[monthIndex]))
      : periods.aovivo

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

  const matchesCurrentUser = row => {
    if (!row) return false
    const values = [row.userId, row.profileId, row.memberId, row.email, row.nome, row.name]
    return values.some(value => identityValues.has(normalize(value)))
  }

  const hunterRows = activePeriod.hunters || []
  const closerRows = activePeriod.closers || []
  const hunterRow = hunterRows.find(matchesCurrentUser)
  const closerRow = closerRows.find(matchesCurrentUser)
  const hasHunter = Boolean(hunterRow)
  const hasCloser = Boolean(closerRow)

  useEffect(() => {
    if (roleView === 'hunter' && !hasHunter && hasCloser) {
      setRoleView('closer')
      setSelectedMetricKey(CLOSER_METRICS[0].key)
    }
    if (roleView === 'closer' && !hasCloser && hasHunter) {
      setRoleView('hunter')
      setSelectedMetricKey(HUNTER_METRICS[1].key)
    }
  }, [hasCloser, hasHunter, roleView])

  const metricOptions = roleView === 'closer' ? CLOSER_METRICS : HUNTER_METRICS
  const roleRows = roleView === 'closer' ? closerRows : hunterRows
  const currentRow = roleView === 'closer' ? closerRow : hunterRow
  const selectedMetric = metricOptions.find(metric => metric.key === selectedMetricKey) || metricOptions[0]
  const userValue = metricValue(currentRow, selectedMetric)
  const teamAverage = average(roleRows.map(row => metricValue(row, selectedMetric)))

  const chartData = [
    { label: 'Você', valor: userValue },
    { label: 'Média do time', valor: teamAverage },
  ]

  const periodLabel = viewMode === 'semanal'
    ? `${activePeriod.label} — ${fmtDate(activePeriod.inicio)} a ${fmtDate(activePeriod.fim)}`
    : viewMode === 'mensal'
      ? activePeriod.label
      : 'Todo o histórico sincronizado'

  const canSeeRoleToggle = hasHunter && hasCloser

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm text-[#6B7895]">Comercial</p>
          <h1 className="mt-1 text-3xl font-extrabold text-white">Meu Desempenho</h1>
          <p className="mt-2 text-[#6B7895]">
            Escolha uma métrica e compare seu resultado com a média do time.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            {statusMessage && (
              <span className="rounded border border-green-900/40 bg-green-950/30 px-3 py-1.5 font-semibold text-green-400">
                {statusMessage}
              </span>
            )}
            {error && (
              <span className="rounded border border-yellow-900/40 bg-yellow-950/20 px-3 py-1.5 text-yellow-300">
                {error}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded border border-[#1E1E1E] bg-[#111111] p-1">
            {[
              { key: 'aovivo', label: 'Ao Vivo', Icon: Radio },
              { key: 'semanal', label: 'Semanal', Icon: Calendar },
              { key: 'mensal', label: 'Mensal', Icon: BarChart2 },
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setViewMode(key)}
                className={`inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-bold transition ${
                  viewMode === key ? 'bg-[#CE7028] text-white' : 'text-[#8A95AD] hover:text-white'
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          {viewMode === 'semanal' && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={weekIndex <= 0}
                onClick={() => setWeekIndex(index => Math.max(0, index - 1))}
                className="rounded border border-[#1E1E1E] bg-[#111111] p-2 text-[#8A95AD] disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="min-w-[180px] text-center text-sm font-bold text-white">{periodLabel}</span>
              <button
                type="button"
                disabled={weekIndex >= periods.semanas.length - 1}
                onClick={() => setWeekIndex(index => Math.min(periods.semanas.length - 1, index + 1))}
                className="rounded border border-[#1E1E1E] bg-[#111111] p-2 text-[#8A95AD] disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {viewMode === 'mensal' && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={monthIndex <= 0}
                onClick={() => setMonthIndex(index => Math.max(0, index - 1))}
                className="rounded border border-[#1E1E1E] bg-[#111111] p-2 text-[#8A95AD] disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="min-w-[140px] text-center text-sm font-bold text-white">{periodLabel}</span>
              <button
                type="button"
                disabled={monthIndex >= periods.meses.length - 1}
                onClick={() => setMonthIndex(index => Math.min(periods.meses.length - 1, index + 1))}
                className="rounded border border-[#1E1E1E] bg-[#111111] p-2 text-[#8A95AD] disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded border border-[#1E1E1E] bg-[#111111]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#CE7028]/30 border-t-[#CE7028]" />
        </div>
      ) : !currentRow ? (
        <div className="rounded border border-[#1E1E1E] bg-[#111111] p-10 text-center">
          <User className="mx-auto mb-4 text-[#6B7895]" size={42} />
          <h2 className="text-xl font-extrabold text-white">Nenhum vínculo comercial encontrado para seu usuário.</h2>
          <p className="mx-auto mt-2 max-w-2xl text-[#6B7895]">
            Para aparecer aqui, sua conta precisa estar vinculada como Hunter ou Closer em Comercial &gt; Equipe.
          </p>
        </div>
      ) : (
        <div className="rounded border border-[#1E1E1E] bg-[#111111] p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-white">Você x média do time</h2>
              <p className="mt-1 text-sm text-[#6B7895]">
                A média é agregada. A tela não mostra dados individuais de outras pessoas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {canSeeRoleToggle && (
                <div className="flex rounded border border-[#1E1E1E] bg-[#0A0A0A] p-1">
                  {[
                    { key: 'hunter', label: 'Hunter' },
                    { key: 'closer', label: 'Closer' },
                  ].map(option => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => {
                        setRoleView(option.key)
                        setSelectedMetricKey(option.key === 'closer' ? CLOSER_METRICS[0].key : HUNTER_METRICS[1].key)
                      }}
                      className={`rounded px-4 py-2 text-sm font-bold ${
                        roleView === option.key ? 'bg-[#CE7028] text-white' : 'text-[#8A95AD] hover:text-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}

              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-widest text-[#6B7895]">Métrica</span>
                <select
                  value={selectedMetricKey}
                  onChange={event => setSelectedMetricKey(event.target.value)}
                  className="min-w-[260px] rounded border border-[#1E1E1E] bg-[#0A0A0A] px-4 py-2 text-sm font-bold text-white outline-none focus:border-[#CE7028]"
                >
                  {metricOptions.map(metric => (
                    <option key={metric.key} value={metric.key}>{metric.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded border border-[#1E1E1E] bg-[#0A0A0A] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{selectedMetric.label}</span>
              <InfoTip text={selectedMetric.help} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="text-[#8A95AD]">
                Você: <strong className="text-white">{formatMetric(userValue, selectedMetric.isPercent)}</strong>
              </span>
              <span className="text-[#8A95AD]">
                Média do time: <strong className="text-white">{formatMetric(teamAverage, selectedMetric.isPercent)}</strong>
              </span>
            </div>
          </div>

          <div className="mt-6 h-[430px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 32, right: 28, left: 0, bottom: 8 }}>
                <CartesianGrid stroke="#1E1E1E" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#6B7895" tick={{ fill: '#8A95AD', fontSize: 12 }} />
                <YAxis stroke="#6B7895" tick={{ fill: '#8A95AD', fontSize: 12 }} />
                <ChartTooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  contentStyle={{ background: '#111111', border: '1px solid #1E1E1E', borderRadius: 6, color: '#fff' }}
                  formatter={value => [formatMetric(value, selectedMetric.isPercent), selectedMetric.label]}
                />
                <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                  <LabelList
                    dataKey="valor"
                    position="top"
                    fill="#FFFFFF"
                    fontSize={13}
                    fontWeight={800}
                    formatter={value => formatMetric(value, selectedMetric.isPercent)}
                  />
                  {chartData.map((entry, index) => (
                    <Cell key={entry.label} fill={index === 0 ? ORANGE : GREEN} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
