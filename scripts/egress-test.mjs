import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createSupabaseFetch, loginErrorMessage } from '../src/lib/supabaseTransport.js'

let clock = 0
const requests = { rest: 0, auth: 0 }
const guardedFetch = createSupabaseFetch(async input => {
  const isAuth = new URL(String(input)).pathname.startsWith('/auth/v1')
  const scope = isAuth ? 'auth' : 'rest'
  requests[scope]++
  return new Response('{}', { status: scope === 'rest' && requests.rest === 1 ? 402 : 200 })
}, () => clock)
assert.equal((await guardedFetch('https://example.test/rest/v1/profiles')).status, 402)
assert.equal((await guardedFetch('https://example.test/rest/v1/sectors')).status, 402)
assert.equal(requests.rest, 1, 'restriction must suppress repeated calls to the same service')
assert.equal((await guardedFetch('https://example.test/auth/v1/token')).status, 200)
assert.equal(requests.auth, 1, 'a REST restriction must not block password validation in Auth')
clock = 300001
assert.equal((await guardedFetch('https://example.test/rest/v1/profiles')).status, 200)
assert.equal(requests.rest, 2, 'service must be probed again after cooldown')
assert.match(loginErrorMessage({ status: 402 }), /limite de uso/)
assert.match(loginErrorMessage({ code: 'invalid_credentials' }), /senha inválidos/)
assert.doesNotMatch(loginErrorMessage({ status: 500 }), /senha inválidos/)

// Exercise the production snapshot loader with a deterministic PostgREST adapter.
let version = { id: '1', synced_at: '2026-10-01T10:00:00Z', content_hash: 'a' }
let downloads = 0
const client = {
  rpc: () => ({
    abortSignal: async () => ({ data: [version] }),
    maybeSingle: () => ({ abortSignal: async () => ({ data: version }) }),
  }),
  from: () => ({
    select: () => ({
      eq: () => ({
        maybeSingle: () => ({
          abortSignal: async () => {
            downloads++
            return { data: { id: version.id, synced_at: version.synced_at,
              payload: { pipeId: '307256948', raw: { cards: [{ id: version.content_hash }] } } } }
          },
        }),
      }),
    }),
  }),
}
globalThis.__egressTestClient = client
const source = (await readFile(new URL('../src/services/comercialDashboardData.js', import.meta.url), 'utf8'))
  .replace("import { isSupabaseConfigured, supabase } from '../lib/supabase'",
    'const isSupabaseConfigured = true; const supabase = globalThis.__egressTestClient')
  .replace("import { mapComercialSnapshot } from './comercialSnapshotMapper'",
    'const mapComercialSnapshot = () => ({})')
const loader = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'))
await Promise.all([loader.fetchLatestComercialSnapshot(), loader.fetchLatestComercialSnapshot()])
assert.equal(downloads, 1, 'concurrent consumers share one download')
await loader.fetchLatestComercialSnapshot({ force: true })
assert.equal(downloads, 1, 'manual refresh must not re-download the same version')
version = { ...version, id: '2', synced_at: '2026-10-01T11:00:00Z' }
const unchanged = await loader.refreshComercialSnapshotIfChanged()
assert.equal(downloads, 1, 'new snapshot with identical contents must reuse cached data')
assert.equal(unchanged.snapshot.id, '2')
assert.equal(unchanged.snapshot.payload.periodo.atualizadoEm, version.synced_at)
version = { ...version, id: '3', content_hash: 'b' }
const changed = await loader.refreshComercialSnapshotIfChanged()
assert.equal(downloads, 2, 'changed business data must be downloaded')
assert.equal(changed.snapshot.payload.raw.cards[0].id, 'b')
delete globalThis.__egressTestClient
console.log('Egress and authentication regression checks passed.')
