export const SERVICE_RESTRICTED_MESSAGE = 'O serviço está temporariamente bloqueado por limite de uso. Contate a administração. Sua senha não foi validada.'
const COOLDOWN_MS = 5 * 60 * 1000

// Keep the restriction in memory: after five minutes the next request probes
// the service again. Never retry writes automatically.
export function createSupabaseFetch(fetcher = (...args) => fetch(...args), now = Date.now) {
  let blockedUntil = 0
  return async (input, init) => {
    if (now() < blockedUntil) {
      return new Response(JSON.stringify({ message: SERVICE_RESTRICTED_MESSAGE }), {
        status: 402, headers: { 'Content-Type': 'application/json' },
      })
    }
    const response = await fetcher(input, init)
    if (response.status === 402) blockedUntil = now() + COOLDOWN_MS
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
