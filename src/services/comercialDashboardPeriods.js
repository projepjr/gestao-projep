const contexts = new WeakMap()

export function dashboardContext(snapshot, members, commercial) {
  if (!snapshot?.payload) return null
  const people = members.map(({ id, supabaseId, nome, name, email, cargo }) => ({
    id, supabaseId, nome, name, email, cargo,
  }))
  const team = { equipe: commercial.equipe, pipefyPipeId: commercial.pipefyPipeId }
  const key = JSON.stringify([snapshot.id, snapshot.synced_at, people, team])
  const cached = contexts.get(snapshot.payload)
  if (cached?.key === key) return cached
  const context = { key, payload: snapshot.payload, members: people, commercial: team }
  contexts.set(snapshot.payload, context)
  return context
}

export function createDashboardCalculator(makeWorker) {
  let worker = null
  let activeContext = null
  let nextId = 0
  const pending = new Map()
  const results = new Map()
  const inFlight = new Map()

  const reset = (message) => {
    worker?.terminate()
    worker = null
    activeContext = null
    results.clear()
    inFlight.clear()
    for (const request of pending.values()) {
      clearTimeout(request.timer)
      request.reject(new Error(message))
    }
    pending.clear()
  }

  return {
    calculate(context, ranges) {
      if (activeContext !== context) {
        reset('Os dados foram atualizados.')
        try {
          worker = makeWorker()
          activeContext = context
          worker.onmessage = ({ data }) => {
            const request = pending.get(data.id)
            if (!request) return
            pending.delete(data.id)
            inFlight.delete(request.key)
            clearTimeout(request.timer)
            if (data.error) request.reject(new Error(data.error))
            else {
              results.set(request.key, data.periods)
              if (results.size > 64) results.delete(results.keys().next().value)
              request.resolve(data.periods)
            }
          }
          worker.onerror = () => reset('Não foi possível calcular os indicadores. Tente novamente.')
          worker.onmessageerror = worker.onerror
          worker.postMessage({ type: 'initialize', context })
        } catch {
          reset('Não foi possível iniciar o cálculo dos indicadores.')
          return Promise.reject(new Error('Não foi possível iniciar o cálculo dos indicadores.'))
        }
      }
      const key = JSON.stringify(ranges)
      if (results.has(key)) return Promise.resolve(results.get(key))
      if (inFlight.has(key)) return inFlight.get(key)
      const promise = new Promise((resolve, reject) => {
        const id = ++nextId
        const timer = setTimeout(() => reset('O cálculo demorou mais que o esperado. Tente novamente.'), 60000)
        pending.set(id, { resolve, reject, key, timer })
        try {
          worker.postMessage({ type: 'calculate', id, ranges })
        } catch {
          reset('Não foi possível calcular os indicadores. Tente novamente.')
        }
      })
      inFlight.set(key, promise)
      return promise
    },
    dispose: () => reset('Cálculo encerrado.'),
  }
}

export const dashboardCalculator = createDashboardCalculator(
  () => new Worker(new URL('./comercialDashboardWorker.js', import.meta.url), { type: 'module' }),
)
