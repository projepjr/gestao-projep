const REFRESH_WEBHOOK_URL = import.meta.env.VITE_N8N_GLOBAL_REFRESH_WEBHOOK_URL

export const isN8nRefreshConfigured = Boolean(REFRESH_WEBHOOK_URL)

export async function triggerN8nRefresh(payload = {}) {
  if (!isN8nRefreshConfigured) {
    return { triggered: false, reason: 'N8N_WEBHOOK_NOT_CONFIGURED' }
  }

  const response = await fetch(REFRESH_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source: 'gestao-projep',
      action: 'global-refresh',
      requestedAt: new Date().toISOString(),
      ...payload,
    }),
  })

  if (!response.ok) {
    throw new Error(`Falha ao acionar n8n (${response.status})`)
  }

  return { triggered: true }
}
