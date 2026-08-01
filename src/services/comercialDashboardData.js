import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { mapComercialSnapshot } from './comercialSnapshotMapper'

export const PIPEFY_COMERCIAL_PIPE_ID = '307256948'
export const COMERCIAL_SNAPSHOT_LOOKBACK = 5
export const COMERCIAL_SNAPSHOT_TIMEOUT_MS = 15000
const COMERCIAL_SNAPSHOT_CACHE_TTL_MS = 60 * 1000
const DASHBOARD_DATA_CACHE_LIMIT = 6

let snapshotCache = null
let snapshotCacheAt = 0
let snapshotFetchPromise = null
const dashboardDataCache = new Map()

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export const isoDate = date =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export function fmtDate(iso) {
  if (!iso) return ''
  const [, month, day] = iso.split('-')
  return `${day}/${month}`
}

function getIsoWeek(date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = target.getUTCDay() || 7
  target.setUTCDate(target.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1))
  return Math.ceil((((target - yearStart) / 86400000) + 1) / 7)
}

export function buildWeekRanges(referenceDate, count = 10) {
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

export function buildMonthRanges(referenceDate, count = 8) {
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

export function findCurrentWeekIndex(weeks) {
  if (!weeks.length) return 0
  const today = isoDate(new Date())
  const started = weeks.reduce((latest, week, index) => week.inicio <= today ? index : latest, -1)
  return started >= 0 ? started : 0
}

export function findCurrentMonthIndex(months) {
  if (!months.length) return 0
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const started = months.reduce((latest, month, index) => month.id <= currentMonth ? index : latest, -1)
  return started >= 0 ? started : 0
}

export function extractSnapshotPipeIds(payload = {}) {
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

function hasUsableSnapshotPayload(snapshot) {
  return Boolean(snapshot?.payload && typeof snapshot.payload === 'object' && !Array.isArray(snapshot.payload))
}

export function selectComercialSnapshot(snapshots = []) {
  const usableSnapshots = snapshots.filter(hasUsableSnapshotPayload)
  const explicitPipeSnapshot = usableSnapshots.find(snapshot =>
    extractSnapshotPipeIds(snapshot.payload).includes(PIPEFY_COMERCIAL_PIPE_ID)
  )

  if (explicitPipeSnapshot) {
    return { snapshot: explicitPipeSnapshot, statusMessage: 'Snapshot Pipefy carregado' }
  }

  const snapshotsWithPipeId = usableSnapshots.filter(snapshot => extractSnapshotPipeIds(snapshot.payload).length > 0)
  if (snapshotsWithPipeId.length > 0) {
    return { snapshot: null, statusMessage: '' }
  }

  if (usableSnapshots[0]) {
    return {
      snapshot: usableSnapshots[0],
      statusMessage: 'Snapshot sem pipe_id explicito. Assumindo pipeline 307256948.',
    }
  }

  return { snapshot: null, statusMessage: '' }
}

export async function fetchLatestComercialSnapshot({
  lookback = COMERCIAL_SNAPSHOT_LOOKBACK,
  timeoutMs = COMERCIAL_SNAPSHOT_TIMEOUT_MS,
  force = false,
} = {}) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      snapshot: null,
      statusMessage: '',
      error: 'Supabase nao configurado. Dados comerciais remotos indisponiveis.',
    }
  }

  const now = Date.now()
  if (!force && snapshotCache && now - snapshotCacheAt < COMERCIAL_SNAPSHOT_CACHE_TTL_MS) {
    return snapshotCache
  }

  if (snapshotFetchPromise) {
    return snapshotFetchPromise
  }

  snapshotFetchPromise = (async () => {
    try {
      const result = await Promise.race([
        supabase
          .from('comercial_dashboard_snapshots')
          .select('id, payload, synced_at')
          .eq('source', 'pipefy')
          .order('synced_at', { ascending: false })
          .limit(lookback),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs)),
      ])

      if (result.error) {
        if (snapshotCache?.snapshot) return snapshotCache
        return { snapshot: null, statusMessage: '', error: result.error.message || 'Erro ao carregar snapshot comercial.' }
      }

      const snapshots = Array.isArray(result.data) ? result.data : []
      const selected = selectComercialSnapshot(snapshots)
      if (!selected.snapshot) {
        return {
          snapshot: null,
          statusMessage: '',
          error: snapshots.length ? 'Nenhum snapshot do pipeline comercial encontrado.' : 'Nenhum snapshot comercial encontrado.',
        }
      }

      snapshotCache = { ...selected, error: '' }
      snapshotCacheAt = Date.now()
      return snapshotCache
    } catch (error) {
      if (snapshotCache?.snapshot) return snapshotCache
      return {
        snapshot: null,
        statusMessage: '',
        error: error?.message === 'timeout'
          ? 'Tempo esgotado ao carregar dados comerciais do Supabase.'
          : (error?.message || 'Erro ao carregar dados comerciais.'),
      }
    } finally {
      snapshotFetchPromise = null
    }
  })()

  return snapshotFetchPromise
}

function memberSignature(members = []) {
  return (members || [])
    .map(member => [
      member?.id,
      member?.supabaseId,
      member?.nome,
      member?.name,
      member?.email,
      member?.cargo,
    ].join(':'))
    .join('|')
}

function commercialSignature(commercial = {}) {
  const team = commercial?.equipe || {}
  return JSON.stringify({
    pipefyPipeId: commercial?.pipefyPipeId,
    hunters: team.hunters || [],
    closers: team.closers || [],
  })
}

function dashboardCacheKey(snapshot, members, commercial) {
  if (!snapshot?.payload) return ''
  return [
    snapshot.id || '',
    snapshot.synced_at || '',
    memberSignature(members),
    commercialSignature(commercial),
  ].join('::')
}

export function buildRemoteDashboardData(snapshot, members, commercial) {
  if (!snapshot?.payload) return null
  const cacheKey = dashboardCacheKey(snapshot, members, commercial)
  if (cacheKey && dashboardDataCache.has(cacheKey)) {
    return dashboardDataCache.get(cacheKey)
  }

  const referenceDate = snapshot.synced_at || snapshot.payload?.periodo?.atualizadoEm || new Date().toISOString()
  const aovivo = mapComercialSnapshot(snapshot.payload, { members, commercial })
  const semanas = buildWeekRanges(referenceDate, 10)
    .map(range => mapComercialSnapshot(snapshot.payload, { members, commercial, range }))
  const meses = buildMonthRanges(referenceDate, 8)
    .map(range => mapComercialSnapshot(snapshot.payload, { members, commercial, range }))

  const data = {
    ...commercial,
    aovivo,
    semanas,
    meses,
  }

  if (cacheKey) {
    dashboardDataCache.set(cacheKey, data)
    while (dashboardDataCache.size > DASHBOARD_DATA_CACHE_LIMIT) {
      dashboardDataCache.delete(dashboardDataCache.keys().next().value)
    }
  }

  return data
}
