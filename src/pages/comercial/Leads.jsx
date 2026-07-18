import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle, ArrowUpDown, BarChart2, Calendar, ChevronLeft, ChevronRight,
  FileCheck, PhoneCall, Radio, Search, Target, Users,
} from 'lucide-react'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'
import { mapLeadSegmentInsights } from '../../services/comercialSnapshotMapper'

const PIPEFY_COMERCIAL_PIPE_ID = '307256948'
const SNAPSHOT_LOOKBACK = 20
const MONTHS_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

const normalize = value => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()

const pctText = value => `${Number(value || 0).toFixed(0)}%`
const isoDate = date => date.toISOString().split('T')[0]
const brDate = iso => {
  if (!iso) return ''
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

function getIsoWeek(date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = target.getUTCDay() || 7
  target.setUTCDate(target.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1))
  return Math.ceil((((target - yearStart) / 86400000) + 1) / 7)
}

function buildWeekRanges(referenceDate, count = 10) {
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

function buildMonthRanges(referenceDate, count = 8) {
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

function findCurrentIndex(periods, date = new Date()) {
  const today = isoDate(date)
  const found = periods.findIndex(period => today >= period.inicio && today <= period.fim)
  return found >= 0 ? found : Math.max(0, periods.length - 1)
}

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

function selectComercialSnapshot(snapshots) {
  const usable = snapshots.filter(snapshot => snapshot?.payload && typeof snapshot.payload === 'object' && !Array.isArray(snapshot.payload))
  const explicit = usable.find(snapshot => extractSnapshotPipeIds(snapshot.payload).includes(PIPEFY_COMERCIAL_PIPE_ID))
  if (explicit) return { snapshot: explicit, message: 'Snapshot Pipefy carregado' }
  const withPipeId = usable.filter(snapshot => extractSnapshotPipeIds(snapshot.payload).length > 0)
  if (withPipeId.length) return { snapshot: null, message: '' }
  if (usable[0]) return { snapshot: usable[0], message: 'Snapshot sem pipe_id explícito. Assumindo pipeline 307256948.' }
  return { snapshot: null, message: '' }
}

function MetricCard({ label, value, Icon, tone = 'text-white', helper }) {
  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</p>
          <p className={`text-2xl font-bold mt-3 ${tone}`}>{value}</p>
          {helper && <p className="text-xs text-gray-600 mt-1">{helper}</p>}
        </div>
        <div className="w-8 h-8 rounded bg-[#CE7028]/10 border border-[#CE7028]/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#CE7028]" />
        </div>
      </div>
    </div>
  )
}

function PeriodSelector({ mode, setMode, weeks, weekIndex, setWeekIndex, months, monthIndex, setMonthIndex }) {
  const currentWeek = weeks[weekIndex]
  const currentMonth = months[monthIndex]

  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
      <div className="inline-flex w-fit bg-[#111111] border border-[#1E1E1E] rounded-md p-1">
        {[
          { id: 'aovivo', label: 'Ao Vivo', Icon: Radio },
          { id: 'semanal', label: 'Semanal', Icon: Calendar },
          { id: 'mensal', label: 'Mensal', Icon: BarChart2 },
        ].map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setMode(item.id)}
            className={`px-3 py-2 rounded text-sm font-semibold flex items-center gap-2 transition-colors ${
              mode === item.id ? 'bg-[#CE7028] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <item.Icon className="w-3.5 h-3.5" />
            {item.label}
          </button>
        ))}
      </div>

      {mode === 'semanal' && currentWeek && (
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setWeekIndex(Math.max(0, weekIndex - 1))} disabled={weekIndex <= 0} className="p-2 rounded border border-[#1E1E1E] text-gray-400 disabled:opacity-30 hover:text-white">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-white">{currentWeek.label} — {brDate(currentWeek.inicio)} a {brDate(currentWeek.fim)}</span>
          <button type="button" onClick={() => setWeekIndex(Math.min(weeks.length - 1, weekIndex + 1))} disabled={weekIndex >= weeks.length - 1} className="p-2 rounded border border-[#1E1E1E] text-gray-400 disabled:opacity-30 hover:text-white">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {mode === 'mensal' && currentMonth && (
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setMonthIndex(Math.max(0, monthIndex - 1))} disabled={monthIndex <= 0} className="p-2 rounded border border-[#1E1E1E] text-gray-400 disabled:opacity-30 hover:text-white">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-white">{currentMonth.label}</span>
          <button type="button" onClick={() => setMonthIndex(Math.min(months.length - 1, monthIndex + 1))} disabled={monthIndex >= months.length - 1} className="p-2 rounded border border-[#1E1E1E] text-gray-400 disabled:opacity-30 hover:text-white">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

function ConversionBar({ label, value, count, total, color = '#CE7028' }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-gray-500">{label}</span>
        <span className="text-gray-300 font-semibold">{pctText(value)} <span className="text-gray-700">({count}/{total})</span></span>
      </div>
      <div className="h-1.5 rounded bg-[#1E1E1E] overflow-hidden">
        <div className="h-full rounded" style={{ width: `${Math.min(100, value || 0)}%`, background: color }} />
      </div>
    </div>
  )
}

export default function LeadsInsights() {
  const [snapshot, setSnapshot] = useState(null)
  const [status, setStatus] = useState({ loading: true, error: '', message: '' })
  const [mode, setMode] = useState('aovivo')
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState('contactRate')
  const [sortDir, setSortDir] = useState('desc')
  const snapshotRef = useRef(null)

  const referenceDate = snapshot?.synced_at || new Date().toISOString()
  const weeks = useMemo(() => buildWeekRanges(referenceDate, 10), [referenceDate])
  const months = useMemo(() => buildMonthRanges(referenceDate, 8), [referenceDate])
  const [weekIndex, setWeekIndex] = useState(() => findCurrentIndex(buildWeekRanges(new Date(), 10)))
  const [monthIndex, setMonthIndex] = useState(() => findCurrentIndex(buildMonthRanges(new Date(), 8)))

  useEffect(() => {
    snapshotRef.current = snapshot
  }, [snapshot])

  useEffect(() => {
    let cancelled = false

    async function fetchLatestSnapshot() {
      if (!isSupabaseConfigured || !supabase) {
        setStatus({ loading: false, error: 'Supabase não configurado.', message: '' })
        return
      }

      setStatus(prev => ({ ...prev, loading: !snapshotRef.current }))
      const { data, error } = await supabase
        .from('comercial_dashboard_snapshots')
        .select('id, payload, synced_at')
        .eq('source', 'pipefy')
        .order('synced_at', { ascending: false })
        .limit(SNAPSHOT_LOOKBACK)

      if (cancelled) return
      if (error) {
        console.warn('[LeadsInsights] Falha ao carregar snapshot:', error.message || error)
        setStatus({ loading: false, error: 'Não foi possível carregar o snapshot comercial.', message: '' })
        return
      }

      const { snapshot: selected, message } = selectComercialSnapshot(Array.isArray(data) ? data : [])
      setSnapshot(selected)
      snapshotRef.current = selected
      setStatus({
        loading: false,
        error: selected ? '' : 'Nenhum snapshot comercial válido encontrado.',
        message,
      })
    }

    fetchLatestSnapshot()
    const intervalId = window.setInterval(fetchLatestSnapshot, 5 * 60 * 1000)
    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [])

  const selectedRange = useMemo(() => {
    if (mode === 'semanal') return weeks[weekIndex] || null
    if (mode === 'mensal') return months[monthIndex] || null
    return null
  }, [mode, monthIndex, months, weekIndex, weeks])

  const insights = useMemo(
    () => mapLeadSegmentInsights(snapshot?.payload, { range: selectedRange }),
    [selectedRange, snapshot],
  )

  const rows = useMemo(() => {
    const term = normalize(query)
    const filtered = insights.rows.filter(row => !term || normalize(row.segment).includes(term))
    const factor = sortDir === 'asc' ? 1 : -1
    return filtered.sort((a, b) => {
      const aValue = typeof a[sortKey] === 'string' ? normalize(a[sortKey]) : (a[sortKey] || 0)
      const bValue = typeof b[sortKey] === 'string' ? normalize(b[sortKey]) : (b[sortKey] || 0)
      if (aValue > bValue) return factor
      if (aValue < bValue) return -factor
      return (b.total || 0) - (a.total || 0)
    })
  }, [insights.rows, query, sortDir, sortKey])

  const topContract = insights.rows.filter(row => row.total > 0).sort((a, b) => b.contractRate - a.contractRate || b.total - a.total)[0]
  const topContact = insights.rows.filter(row => row.total > 0).sort((a, b) => b.contactRate - a.contactRate || b.total - a.total)[0]

  const toggleSort = key => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'desc' ? 'asc' : 'desc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Leads por CNAE</h1>
          <p className="text-gray-500 text-sm mt-0.5">Entenda quais segmentos atendem, avançam e fecham melhor.</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded border ${
              snapshot
                ? 'text-green-400 bg-green-950/30 border-green-900/30'
                : status.loading
                  ? 'text-yellow-400 bg-yellow-950/30 border-yellow-900/30'
                  : 'text-gray-500 bg-[#111111] border-[#1E1E1E]'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {snapshot ? 'Dados reais do Pipefy' : status.loading ? 'Carregando snapshot' : 'Sem snapshot'}
            </span>
            {status.message && <span className="text-[11px] text-gray-600">{status.message}</span>}
            {status.error && <span className="text-[11px] text-red-400">{status.error}</span>}
          </div>
        </div>

        <PeriodSelector
          mode={mode}
          setMode={setMode}
          weeks={weeks}
          weekIndex={weekIndex}
          setWeekIndex={setWeekIndex}
          months={months}
          monthIndex={monthIndex}
          setMonthIndex={setMonthIndex}
        />
      </div>

      {insights.missingSegmentCount > 0 && (
        <div className="bg-yellow-950/20 border border-yellow-900/30 rounded-md p-3 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-yellow-300">CNAE ainda não informado em {insights.missingSegmentCount} lead(s).</p>
            <p className="text-xs text-gray-500 mt-0.5">Para essa página ficar realmente útil, preencha no Pipefy um campo como “Segmento da empresa (CNAE)” ou “CNAE”.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard label="Leads analisados" value={insights.totals.total} Icon={Users} helper="Leads que entraram no período filtrado." />
        <MetricCard label="Contato real" value={pctText(insights.totals.contactRate)} Icon={PhoneCall} helper={`${insights.totals.contacted}/${insights.totals.total} leads avançaram após contato.`} tone="text-blue-400" />
        <MetricCard label="Proposta apresentada" value={pctText(insights.totals.proposalDoneRate)} Icon={Target} helper={`${insights.totals.proposalDone}/${insights.totals.total} chegaram à proposta realizada.`} tone="text-[#CE7028]" />
        <MetricCard label="Contratos" value={pctText(insights.totals.contractRate)} Icon={FileCheck} helper={`${insights.totals.contracts}/${insights.totals.total} viraram contrato.`} tone="text-green-400" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Melhor contato</p>
          <p className="text-xl font-bold text-white mt-2">{topContact?.segment || 'Sem dados suficientes'}</p>
          <p className="text-sm text-blue-400 mt-1">{topContact ? `${pctText(topContact.contactRate)} de contato real (${topContact.contacted}/${topContact.total})` : 'Preencha CNAE/segmento para comparar.'}</p>
        </div>
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Melhor fechamento</p>
          <p className="text-xl font-bold text-white mt-2">{topContract?.segment || 'Sem dados suficientes'}</p>
          <p className="text-sm text-green-400 mt-1">{topContract ? `${pctText(topContract.contractRate)} viraram contrato (${topContract.contracts}/${topContract.total})` : 'Ainda não há contratos no período.'}</p>
        </div>
      </div>

      <div className="bg-[#111111] border border-[#1E1E1E] rounded-md">
        <div className="p-5 border-b border-[#1E1E1E] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-white font-bold uppercase tracking-wide">Ranking por CNAE / Segmento</h2>
            <p className="text-sm text-gray-600 mt-0.5">Compare quais tipos de empresa mais avançam no funil.</p>
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              className="w-full bg-[#0D0D0D] border border-[#1E1E1E] rounded px-9 py-2.5 text-white text-sm focus:outline-none focus:border-[#CE7028]"
              placeholder="Buscar CNAE ou segmento..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-[#1E1E1E]">
                {[
                  ['segment', 'CNAE / Segmento'],
                  ['total', 'Leads'],
                  ['contactRate', 'Contato real'],
                  ['diagnosticDoneRate', 'Diag. realizada'],
                  ['proposalDoneRate', 'Proposta realizada'],
                  ['contractRate', 'Contrato'],
                  ['lostRate', 'Perda'],
                ].map(([key, label]) => (
                  <th key={key} className="px-5 py-3">
                    <button type="button" onClick={() => toggleSort(key)} className="inline-flex items-center gap-1 hover:text-white">
                      {label}
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} className="border-b border-[#1E1E1E]/70 align-top">
                  <td className="px-5 py-4">
                    <p className="font-bold text-white">{row.segment}</p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                      {row.companies.slice(0, 3).map(company => company.name).join(', ') || 'Sem empresas'}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-white font-bold">{row.total}</td>
                  <td className="px-5 py-4 min-w-40"><ConversionBar label="Atenderam/avançaram" value={row.contactRate} count={row.contacted} total={row.total} color="#2A6B68" /></td>
                  <td className="px-5 py-4 min-w-40"><ConversionBar label="Diagnósticas feitas" value={row.diagnosticDoneRate} count={row.diagnosticDone} total={row.total} color="#3B82F6" /></td>
                  <td className="px-5 py-4 min-w-40"><ConversionBar label="Propostas feitas" value={row.proposalDoneRate} count={row.proposalDone} total={row.total} color="#CE7028" /></td>
                  <td className="px-5 py-4 min-w-40"><ConversionBar label="Contratos" value={row.contractRate} count={row.contracts} total={row.total} color="#22C55E" /></td>
                  <td className="px-5 py-4 min-w-36"><ConversionBar label="Perdidos" value={row.lostRate} count={row.lost} total={row.total} color="#EF4444" /></td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center">
                    <BarChart2 className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                    <p className="text-white font-semibold">Nenhum lead encontrado para o período.</p>
                    <p className="text-sm text-gray-600 mt-1">Quando o Pipefy sincronizar leads com CNAE/segmento, o ranking aparece aqui.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
