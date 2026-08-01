import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  FileSearch,
  FileText,
  History,
  Loader2,
  MessageSquareText,
  ShieldCheck,
  Upload,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import {
  analyzeDocumentWithClaude,
  fetchDocumentAnalysisHistory,
  isDocumentAnalysisConfigured,
  saveDocumentAnalysis,
} from '../../services/documentAnalysisService'

const INPUT = 'w-full rounded border border-[#1E1E1E] bg-[#0D0D0D] px-3 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-700 focus:border-[#CE7028]'
const LABEL = 'mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500'

const ANALYSIS_TYPES = [
  {
    value: 'contrato-geral',
    label: 'Revisao geral do contrato',
    description: 'Analisa riscos, lacunas, pontos obrigatorios e inconsistencias.',
  },
  {
    value: 'riscos',
    label: 'Riscos e pontos de atencao',
    description: 'Foca no que pode gerar problema juridico, financeiro ou operacional.',
  },
  {
    value: 'checklist-projep',
    label: 'Checklist PROJEP',
    description: 'Confere se o documento parece pronto para validacao interna.',
  },
  {
    value: 'pergunta-livre',
    label: 'Pergunta livre',
    description: 'Use para tirar uma duvida especifica sobre o arquivo.',
  },
]

function formatBytes(bytes = 0) {
  if (!bytes) return '0 KB'
  const units = ['B', 'KB', 'MB']
  let value = Number(bytes)
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`
}

function InfoCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded border border-[#1E1E1E] bg-[#111111] p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#CE7028]" />
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-gray-500">{children}</p>
    </div>
  )
}

function ResultBlock({ result }) {
  if (!result) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded border border-dashed border-[#1E1E1E] bg-[#111111] p-8 text-center">
        <Bot className="h-10 w-10 text-gray-700" />
        <h2 className="mt-4 text-lg font-bold text-white">Nenhuma analise ainda.</h2>
        <p className="mt-2 max-w-md text-sm text-gray-500">
          Envie um contrato ou documento para a IA analisar dentro do fluxo seguro do n8n.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded border border-[#1E1E1E] bg-[#111111]">
      <div className="flex items-center justify-between border-b border-[#1E1E1E] p-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Resultado da IA</p>
          <h2 className="mt-1 text-lg font-bold text-white">Analise do documento</h2>
        </div>
        <CheckCircle2 className="h-5 w-5 text-green-400" />
      </div>
      <div className="max-h-[560px] overflow-auto p-5">
        <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-gray-200">
          {result.text}
        </pre>
      </div>
    </div>
  )
}

export default function AnaliseDocumentos() {
  const { user } = useAuth()
  const [file, setFile] = useState(null)
  const [analysisType, setAnalysisType] = useState(ANALYSIS_TYPES[0].value)
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const selectedType = useMemo(
    () => ANALYSIS_TYPES.find(type => type.value === analysisType) || ANALYSIS_TYPES[0],
    [analysisType],
  )

  useEffect(() => {
    let mounted = true
    fetchDocumentAnalysisHistory(user).then(rows => {
      if (mounted) setHistory(rows)
    })
    return () => { mounted = false }
  }, [user])

  const handleAnalyze = async event => {
    event.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const analysis = await analyzeDocumentWithClaude({
        file,
        question,
        analysisType,
        user,
      })
      setResult(analysis)
      const saveResult = await saveDocumentAnalysis({
        user,
        file,
        question,
        analysisType,
        result: analysis,
      })
      if (saveResult.saved) {
        const rows = await fetchDocumentAnalysisHistory(user)
        setHistory(rows)
      }
    } catch (err) {
      setError(err?.message || 'Nao foi possivel analisar o documento.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded border border-[#CE7028]/30 bg-[#CE7028]/10 text-[#CE7028]">
              <FileSearch className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Analise de Documentos</h1>
              <p className="mt-1 text-gray-500">Use IA para revisar contratos, propostas e documentos do Adm e Fin.</p>
            </div>
          </div>
        </div>

        <div className={`rounded border px-3 py-2 text-xs font-bold ${
          isDocumentAnalysisConfigured
            ? 'border-green-900/40 bg-green-950/20 text-green-400'
            : 'border-yellow-900/40 bg-yellow-950/20 text-yellow-400'
        }`}>
          {isDocumentAnalysisConfigured ? 'Webhook n8n configurado' : 'Webhook n8n pendente'}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <InfoCard icon={ShieldCheck} title="Chave da IA protegida">
          A chave Claude/Anthropic deve ficar no n8n. O navegador envia apenas o arquivo e a pergunta para o webhook.
        </InfoCard>
        <InfoCard icon={FileText} title="Documentos aceitos">
          O fluxo foi preparado para PDF, texto, Markdown, HTML e documentos convertidos pelo n8n.
        </InfoCard>
        <InfoCard icon={MessageSquareText} title="Uso recomendado">
          Faca perguntas objetivas: riscos do contrato, clausulas faltantes, pontos financeiros ou pendencias.
        </InfoCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form onSubmit={handleAnalyze} className="space-y-4 rounded border border-[#1E1E1E] bg-[#111111] p-5">
          <div>
            <label className={LABEL}>Arquivo</label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded border border-dashed border-[#CE7028]/35 bg-[#CE7028]/5 p-6 text-center transition-colors hover:border-[#CE7028] hover:bg-[#CE7028]/10">
              <Upload className="h-8 w-8 text-[#CE7028]" />
              <span className="mt-3 text-sm font-bold text-white">
                {file ? file.name : 'Clique para escolher um documento'}
              </span>
              <span className="mt-1 text-xs text-gray-500">
                {file ? `${file.type || 'arquivo'} - ${formatBytes(file.size)}` : 'PDF, TXT, MD, HTML, DOCX/RTF via n8n'}
              </span>
              <input
                type="file"
                accept=".pdf,.txt,.md,.html,.htm,.docx,.rtf"
                className="hidden"
                onChange={event => setFile(event.target.files?.[0] || null)}
              />
            </label>
          </div>

          <div>
            <label className={LABEL}>Tipo de analise</label>
            <select value={analysisType} onChange={event => setAnalysisType(event.target.value)} className={INPUT}>
              {ANALYSIS_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">{selectedType.description}</p>
          </div>

          <div>
            <label className={LABEL}>Pergunta ou instrucao</label>
            <textarea
              value={question}
              onChange={event => setQuestion(event.target.value)}
              rows={5}
              placeholder="Ex: analise os riscos deste contrato e diga o que precisa ser revisado antes da assinatura."
              className={INPUT}
            />
          </div>

          {error && (
            <div className="flex gap-3 rounded border border-red-900/40 bg-red-950/20 p-3 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !file}
            className="flex w-full items-center justify-center gap-2 rounded bg-[#CE7028] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#B8621F] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
            {loading ? 'Analisando...' : 'Analisar documento'}
          </button>
        </form>

        <ResultBlock result={result} />
      </div>

      <div className="rounded border border-[#1E1E1E] bg-[#111111]">
        <div className="flex items-center gap-2 border-b border-[#1E1E1E] p-4">
          <History className="h-4 w-4 text-[#CE7028]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Historico recente</h2>
        </div>
        {history.length > 0 ? (
          <div className="divide-y divide-[#1E1E1E]">
            {history.map(item => (
              <div key={item.id} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{item.file_name || 'Documento sem nome'}</p>
                  <p className="text-xs text-gray-500">{item.analysis_type || 'analise'} - {item.created_at ? new Date(item.created_at).toLocaleString('pt-BR') : 'sem data'}</p>
                </div>
                <span className="rounded border border-green-900/30 bg-green-950/20 px-2 py-1 text-xs font-bold text-green-400">
                  Concluida
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-gray-500">
            Nenhum historico encontrado no Supabase ainda.
          </div>
        )}
      </div>
    </div>
  )
}
