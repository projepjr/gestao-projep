import { mapComercialSnapshot } from './comercialSnapshotMapper.js'

export function createPeriodCalculator() {
  let context = null
  const cache = new Map()
  return {
    initialize(next) {
      context = next
      cache.clear()
    },
    calculate(ranges) {
      if (!context) throw new Error('Dados comerciais indisponíveis.')
      return ranges.map(range => {
        const key = JSON.stringify(range)
        if (cache.has(key)) return cache.get(key)
        const mapped = mapComercialSnapshot(context.payload, {
          members: context.members, commercial: context.commercial, range,
        })
        // Raw cards stay in the worker; only small, aggregated results reach React.
        const { raw, ...result } = mapped
        void raw
        cache.set(key, result)
        if (cache.size > 64) cache.delete(cache.keys().next().value)
        return result
      })
    },
  }
}

if (typeof self !== 'undefined') {
  const calculator = createPeriodCalculator()
  let queued = null
  let timer = null
  self.onmessage = ({ data }) => {
    try {
      if (data.type === 'initialize') {
        calculator.initialize(data.context)
        return
      }
      // If several filters arrive while busy, calculate only the latest one.
      if (queued) self.postMessage({ id: queued.id, error: 'Período substituído.' })
      queued = data
      clearTimeout(timer)
      timer = setTimeout(() => {
        const request = queued
        queued = null
        try {
          self.postMessage({ id: request.id, periods: calculator.calculate(request.ranges) })
        } catch (error) {
          self.postMessage({ id: request.id, error: error.message })
        }
      }, 0)
    } catch (error) {
      self.postMessage({ id: data.id, error: error.message })
    }
  }
}
