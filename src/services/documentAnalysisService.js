import { supabase, isSupabaseConfigured } from '../lib/supabase'

const WEBHOOK_URL = import.meta.env.VITE_N8N_DOCUMENT_ANALYSIS_WEBHOOK_URL
const DEFAULT_TIMEOUT_MS = 120_000

export const isDocumentAnalysisConfigured = Boolean(WEBHOOK_URL)

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error || new Error('Nao foi possivel ler o arquivo.'))
    reader.readAsDataURL(file)
  })
}

function extractBase64(dataUrl) {
  return `${dataUrl || ''}`.split(',').at(1) || ''
}

function normalizeN8nResponse(payload) {
  const data = Array.isArray(payload) ? payload[0] : payload
  const json = data?.json || data
  const content = json?.content || json?.analysis || json?.resultado || json?.result || json?.message || json?.answer || json?.output || json?.response

  if (Array.isArray(content)) {
    const text = content
      .map(item => item?.text || item?.content || '')
      .filter(Boolean)
      .join('\n\n')
    return { ...json, text }
  }

  if (typeof content === 'string') return { ...json, text: content }
  if (typeof json === 'string') return { text: json }

  return { ...json, text: json?.text || '' }
}

function hasUsefulAiText(text) {
  const cleaned = `${text || ''}`.trim()
  return Boolean(cleaned && cleaned !== '{}' && cleaned !== '[]' && cleaned !== 'null')
}

export async function analyzeDocumentWithClaude({ file, question, analysisType, user }) {
  if (!WEBHOOK_URL) {
    throw new Error('Webhook de analise de documentos nao configurado. Configure VITE_N8N_DOCUMENT_ANALYSIS_WEBHOOK_URL.')
  }

  const dataUrl = file ? await readFileAsDataUrl(file) : null
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

  let response
  try {
    response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        source: 'gestao-projep',
        module: 'adm-fin.document-analysis',
        requestedAt: new Date().toISOString(),
        requestedBy: user ? {
          id: user.id,
          supabaseId: user.supabaseId,
          nome: user.nome || user.name,
          email: user.email,
        } : null,
        analysisType,
        question,
        mode: file ? 'document-chat' : 'free-chat',
        documentRequired: false,
        hasFile: Boolean(file),
        file: file ? {
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          base64: extractBase64(dataUrl),
        } : null,
      }),
    })
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('A analise demorou demais para responder. Tente novamente em alguns instantes.')
    }
    throw error
  } finally {
    window.clearTimeout(timeoutId)
  }

  const raw = await response.text()
  let payload = raw
  try {
    payload = raw ? JSON.parse(raw) : {}
  } catch {
    payload = { text: raw }
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error || raw || `Erro ${response.status} ao analisar documento.`
    throw new Error(message)
  }

  const normalized = normalizeN8nResponse(payload)
  if (!hasUsefulAiText(normalized.text)) {
    console.warn('[AnaliseDocumentos] Webhook retornou resposta vazia ou invalida:', payload)
    throw new Error('A IA nao retornou uma resposta valida. Tente novamente em instantes.')
  }

  return normalized
}

export async function saveDocumentAnalysis({ user, file, question, analysisType, result }) {
  if (!isSupabaseConfigured || !supabase) return { saved: false, reason: 'missing-supabase' }

  const row = {
    profile_id: user?.supabaseId || user?.id || null,
    file_name: file?.name || null,
    file_type: file?.type || null,
    file_size: file?.size || null,
    analysis_type: analysisType || null,
    question: question || null,
    result,
    status: 'completed',
  }

  const { error } = await supabase.from('document_analyses').insert(row)
  if (error) {
    console.warn('[Supabase] Historico de analise de documentos indisponivel:', error.message || error)
    return { saved: false, error }
  }

  return { saved: true }
}

export async function fetchDocumentAnalysisHistory(user) {
  if (!isSupabaseConfigured || !supabase || !user) return []

  const ids = [user.supabaseId, user.id].filter(Boolean)
  if (!ids.length) return []

  const { data, error } = await supabase
    .from('document_analyses')
    .select('*')
    .in('profile_id', ids)
    .order('created_at', { ascending: false })
    .limit(12)

  if (error) {
    console.warn('[Supabase] Historico de analise de documentos indisponivel:', error.message || error)
    return []
  }

  return data || []
}
