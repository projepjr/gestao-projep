const REFRESH_WEBHOOK_URL = import.meta.env.VITE_N8N_GLOBAL_REFRESH_WEBHOOK_URL
const DEFAULT_TIMEOUT_MS = 45_000

export const isN8nRefreshConfigured = Boolean(REFRESH_WEBHOOK_URL)

export async function triggerN8nRefresh(payload = {}, options = {}) {
  if (!isN8nRefreshConfigured) {
    return { triggered: false, reason: 'N8N_WEBHOOK_NOT_CONFIGURED' }
  }

  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  let response
  try {
    response = await fetch(REFRESH_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        source: 'gestao-projep',
        action: 'global-refresh',
        requestedAt: new Date().toISOString(),
        ...payload,
      }),
    })
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('O n8n demorou demais para responder. Tente atualizar novamente em alguns instantes.')
    }
    throw error
  } finally {
    window.clearTimeout(timeoutId)
  }

  if (!response.ok) {
    throw new Error(`Falha ao acionar n8n (${response.status})`)
  }

  return { triggered: true }
}
