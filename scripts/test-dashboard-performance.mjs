import assert from 'node:assert/strict'
import { Worker } from 'node:worker_threads'
import { createDashboardCalculator, dashboardContext } from '../src/services/comercialDashboardPeriods.js'
import { mapComercialSnapshot } from '../src/services/comercialSnapshotMapper.js'

const workerUrl = new URL('../src/services/comercialDashboardWorker.js', import.meta.url).href
let starts = 0
const calculator = createDashboardCalculator(() => {
  starts++
  const thread = new Worker(`
    const { parentPort } = await import('node:worker_threads');
    globalThis.self = { postMessage: data => parentPort.postMessage(data) };
    await import(${JSON.stringify(workerUrl)});
    parentPort.on('message', data => self.onmessage({ data }));
  `, { eval: true })
  const adapter = { postMessage: data => thread.postMessage(data), terminate: () => thread.terminate() }
  thread.on('message', data => adapter.onmessage?.({ data }))
  thread.on('error', error => adapter.onerror?.(error))
  return adapter
})
const members = [{ id: 'hunter', nome: 'Hunter Teste', email: 'hunter@example.test' }]
const commercial = { equipe: { hunters: [{ userId: 'hunter', pipefyName: 'Hunter Teste' }], closers: [] } }
const payload = { raw: { cards: [{
  id: 'card', title: 'Empresa teste', created_at: '2026-09-21T12:00:00Z',
  current_phase: { name: 'Diagnostica Agendada' },
  fields: [
    { label: 'Responsavel', value: 'Hunter Teste' },
    { label: 'Quem marcou diagnostica?', value: 'Hunter Teste' },
    { label: 'Data e hora da diagnostica agendada', value: '25/09/2026 10:00' },
  ],
  phases_history: [{ phase: { name: 'Diagnostica Agendada' }, firstTimeIn: '2026-09-21T12:00:00Z' }],
}] } }
const snapshot = { id: 'test', synced_at: '2026-09-22T00:00:00Z', payload }
const context = dashboardContext(snapshot, members, commercial)
assert.equal(dashboardContext(snapshot, structuredClone(members), structuredClone(commercial)), context)
const ranges = [{ inicio: '2026-09-20', fim: '2026-09-26' }, { inicio: '2026-09-13', fim: '2026-09-19' }]
try {
  const request = calculator.calculate(context, ranges)
  assert.equal(calculator.calculate(context, structuredClone(ranges)), request)
  const results = await request
  for (let index = 0; index < ranges.length; index++) {
    const { raw, ...expected } = mapComercialSnapshot(payload, { members, commercial, range: ranges[index] })
    void raw
    // Without a supplied sync date the mapper stamps the current time.
    delete expected.ultimaAtualizacao
    const { ultimaAtualizacao, ...actual } = results[index]
    void ultimaAtualizacao
    assert.deepEqual(actual, expected)
    assert.equal('raw' in results[index], false)
  }
  assert.equal(results[0].hunters[0].diagnosticasAgendadas, 1)
  assert.equal(results[1].hunters[0].diagnosticasAgendadas, 0)
  assert.equal(await calculator.calculate(context, ranges), results)
  assert.equal(starts, 1)

  const obsolete = calculator.calculate(context, [null])
  const rejected = assert.rejects(obsolete, /atualizados/)
  const updatedSnapshot = { ...snapshot, synced_at: '2026-09-23T00:00:00Z', payload: { raw: { cards: [] } } }
  const updated = await calculator.calculate(dashboardContext(updatedSnapshot, members, commercial), ranges)
  await rejected
  assert.equal(starts, 2)
  assert.equal(updated[0].hunters[0].diagnosticasAgendadas, 0)
  console.log('Dashboard: worker parity, cache reuse, concurrent requests and snapshot invalidation passed.')
} finally {
  calculator.dispose()
}
