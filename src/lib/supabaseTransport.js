export const SERVICE_RESTRICTED_MESSAGE = 'O serviço está temporariamente bloqueado por limite de uso. Contate a administração. Sua senha não foi validada.'
const COOLDOWN_MS = 5 * 60 * 1000

function requestScope(input) {
  const rawUrl = typeof input === 'string' || input instanceof URL
    ? String(input)
    : input?.url

  try {
    const pathname = new URL(rawUrl).pathname
    if (pathname.startsWith('/auth/v1')) return 'auth'
    if (pathname.startsWith('/rest/v1')) return 'rest'
    if (pathname.startsWith('/storage/v1')) return 'storage'
    if (pathname.startsWith('/realtime/v1')) return 'realtime'
    if (pathname.startsWith('/functions/v1')) return 'functions'
  } catch {
    // Unknown URLs share a conservative fallback bucket.
  }

  return 'other'
}

// A quota failure in the database must not block an independent Auth request.
// Each Supabase service gets its own cooldown and probes again after five
// minutes. Writes are never retried automatically.
export function createSupabaseFetch(fetcher = (...args) => fetch(...args), now = Date.now) {
  const blockedUntil = new Map()
  return async (input, init) => {
    const scope = requestScope(input)
    if (now() < (blockedUntil.get(scope) || 0)) {
      return new Response(JSON.stringify({ message: SERVICE_RESTRICTED_MESSAGE }), {
        status: 402, headers: { 'Content-Type': 'application/json' },
      })
    }
    const response = await fetcher(input, init)
    if (response.status === 402) blockedUntil.set(scope, now() + COOLDOWN_MS)
    else blockedUntil.delete(scope)
    return response
  }
}

export function loginErrorMessage(error) {
  if (error?.status === 402) return SERVICE_RESTRICTED_MESSAGE
  if (error?.code === 'invalid_credentials') return 'Email ou senha inválidos.'
  if (error?.code === 'email_not_confirmed') return 'Confirme seu e-mail antes de entrar.'
  if (error?.status === 429) return 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.'
  return 'Não foi possível acessar o serviço de autenticação. Tente novamente em alguns minutos.'
}
