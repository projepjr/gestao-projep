import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { mapComercialSnapshot } from './comercialSnapshotMapper'

export const PIPEFY_COMERCIAL_PIPE_ID = '307256948'
export const COMERCIAL_SNAPSHOT_LOOKBACK = 5
export const COMERCIAL_SNAPSHOT_TIMEOUT_MS = 15000
const DASHBOARD_DATA_CACHE_LIMIT = 6
const SNAPSHOT_CACHE_DB_NAME = 'gestao-projep-cache'
const SNAPSHOT_CACHE_DB_VERSION = 1
const SNAPSHOT_CACHE_STORE_NAME = 'commercial-snapshots'
const SNAPSHOT_CACHE_RECORD_KEY = `pipefy-${PIPEFY_COMERCIAL_PIPE_ID}`

let snapshotCache = null
let snapshotFetchPromise = null
let snapshotHydrationPromise = null
const dashboardDataCache = new Map()

function sameSnapshotVersion(first, second) {
  return Boolean(
    first?.id
    && second?.id
    && String(first.id) === String(second.id)
    && String(first.synced_at || '') === String(second.synced_at || ''),
  )
}

export function getCachedComercialSnapshot() {
  return snapshotCache
}

function openSnapshotCacheDatabase() {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null)

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(SNAPSHOT_CACHE_DB_NAME, SNAPSHOT_CACHE_DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(SNAPSHOT_CACHE_STORE_NAME)) {
        database.createObjectStore(SNAPSHOT_CACHE_STORE_NAME, { keyPath: 'key' })
      }
    }
  })
}

async function readPersistedSnapshotCache() {
  const database = await openSnapshotCacheDatabase()
  if (!database) return null

  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(SNAPSHOT_CACHE_STORE_NAME, 'readonly')
      const request = transaction.objectStore(SNAPSHOT_CACHE_STORE_NAME).get(SNAPSHOT_CACHE_RECORD_KEY)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  } finally {
    database.close()
  }
}

async function persistSnapshotCache(result) {
  const database = await openSnapshotCacheDatabase()
  if (!database) return

  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(SNAPSHOT_CACHE_STORE_NAME, 'readwrite')
      transaction.onerror = () => reject(transaction.error)
      transaction.oncomplete = () => resolve()
      transaction.objectStore(SNAPSHOT_CACHE_STORE_NAME).put({
        key: SNAPSHOT_CACHE_RECORD_KEY,
        version: SNAPSHOT_CACHE_DB_VERSION,
        cachedAt: Date.now(),
        result,
      })
    })
  } finally {
    database.close()
  }
}

async function hydrateSnapshotCache() {
  if (snapshotCache?.snapshot) return snapshotCache
  if (snapshotHydrationPromise) return snapshotHydrationPromise

  snapshotHydrationPromise = (async () => {
    try {
      const persisted = await readPersistedSnapshotCache()
      if (persisted?.version !== SNAPSHOT_CACHE_DB_VERSION || !persisted?.result?.snapshot) return null

      const selected = selectComercialSnapshot([persisted.result.snapshot])
      if (!selected.snapshot) return null

      snapshotCache = {
        ...selected,
        statusMessage: 'Snapshot Pipefy carregado do cache',
        error: '',
      }
      return snapshotCache
    } catch (error) {
      console.warn('[Comercial] Nao foi possivel ler o cache persistente:', error)
      return null
    } finally {
      snapshotHydrationPromise = null
    }
  })()

  return snapshotHydrationPromise
}

async function executeSupabaseQuery(query, timeoutMs) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const result = await query.abortSignal(controller.signal)
    if (controller.signal.aborted) throw new Error('timeout')
    return result
  } catch (error) {
    if (controller.signal.aborted) throw new Error('timeout', { cause: error })
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

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
  if (!force) {
    const cached = snapshotCache?.snapshot ? snapshotCache : await hydrateSnapshotCache()
    if (cached?.snapshot) return cached
  }

  if (!isSupabaseConfigured || !supabase) {
    return {
      snapshot: snapshotCache?.snapshot || null,
      statusMessage: snapshotCache?.statusMessage || '',
      error: 'Supabase nao configurado. Dados comerciais remotos indisponiveis.',
    }
  }

  if (snapshotFetchPromise) {
    return snapshotFetchPromise
  }

  snapshotFetchPromise = (async () => {
    try {
      // Fetch lightweight metadata first. Snapshot payloads contain all Pipefy
      // cards and can be several megabytes each, so downloading the whole
      // lookback multiplies transfer time and can freeze slower clients.
      const metadataResult = await executeSupabaseQuery(
        supabase
          .from('comercial_dashboard_snapshots')
          .select('id, synced_at')
          .eq('source', 'pipefy')
          .order('synced_at', { ascending: false })
          .limit(lookback),
        timeoutMs,
      )

      if (metadataResult.error) {
        if (snapshotCache?.snapshot) return snapshotCache
        return {
          snapshot: null,
          statusMessage: '',
          error: metadataResult.error.message || 'Erro ao carregar snapshot comercial.',
        }
      }

      const metadata = Array.isArray(metadataResult.data) ? metadataResult.data : []
      if (!metadata.length) {
        return { snapshot: null, statusMessage: '', error: 'Nenhum snapshot comercial encontrado.' }
      }

      // Usually the first row is accepted. Older payloads are loaded only when
      // an explicit pipe id proves that a newer row belongs to another pipe.
      for (const item of metadata) {
        const payloadResult = await executeSupabaseQuery(
          supabase
            .from('comercial_dashboard_snapshots')
            .select('id, payload, synced_at')
            .eq('id', item.id)
            .maybeSingle(),
          timeoutMs,
        )

        if (payloadResult.error) {
          if (snapshotCache?.snapshot) return snapshotCache
          return {
            snapshot: null,
            statusMessage: '',
            error: payloadResult.error.message || 'Erro ao carregar snapshot comercial.',
          }
        }

        const selected = selectComercialSnapshot(payloadResult.data ? [payloadResult.data] : [])
        if (!selected.snapshot) continue

        snapshotCache = { ...selected, error: '' }
        dashboardDataCache.clear()
        try {
          await persistSnapshotCache(snapshotCache)
        } catch (error) {
          console.warn('[Comercial] Nao foi possivel salvar o cache persistente:', error)
        }
        return snapshotCache
      }

      return {
        snapshot: null,
        statusMessage: '',
        error: 'Nenhum snapshot do pipeline comercial encontrado.',
      }
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

export async function refreshComercialSnapshotIfChanged({
  timeoutMs = COMERCIAL_SNAPSHOT_TIMEOUT_MS,
} = {}) {
  const cached = snapshotCache?.snapshot ? snapshotCache : await hydrateSnapshotCache()

  if (!isSupabaseConfigured || !supabase) {
    return cached || {
      snapshot: null,
      statusMessage: '',
      error: 'Supabase nao configurado. Dados comerciais remotos indisponiveis.',
    }
  }

  try {
    const result = await executeSupabaseQuery(
      supabase
        .from('comercial_dashboard_snapshots')
        .select('id, synced_at')
        .eq('source', 'pipefy')
        .order('synced_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      timeoutMs,
    )

    if (result.error || !result.data) {
      return cached || {
        snapshot: null,
        statusMessage: '',
        error: result.error?.message || 'Nenhum snapshot comercial encontrado.',
      }
    }

    if (sameSnapshotVersion(cached?.snapshot, result.data)) {
      return { ...cached, changed: false }
    }

    const latest = await fetchLatestComercialSnapshot({ timeoutMs, force: true })
    return { ...latest, changed: Boolean(latest.snapshot) }
  } catch (error) {
    return cached || {
      snapshot: null,
      statusMessage: '',
      error: error?.message === 'timeout'
        ? 'Tempo esgotado ao verificar a atualizacao comercial.'
        : (error?.message || 'Erro ao verificar a atualizacao comercial.'),
    }
  }
}

export function subscribeToComercialSnapshotUpdates(handler) {
  if (!isSupabaseConfigured || !supabase || typeof handler !== 'function') return () => {}

  let debounceId = null
  const channel = supabase
    .channel(`comercial-snapshot-${Math.random().toString(36).slice(2)}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'comercial_dashboard_snapshots',
      filter: 'source=eq.pipefy',
    }, () => {
      clearTimeout(debounceId)
      debounceId = setTimeout(handler, 500)
    })
    .subscribe()

  return () => {
    clearTimeout(debounceId)
    supabase.removeChannel(channel)
  }
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
