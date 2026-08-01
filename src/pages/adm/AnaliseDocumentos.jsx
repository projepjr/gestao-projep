import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  Bot,
  FileSearch,
  History,
  Loader2,
  Paperclip,
  Send,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import {
  analyzeDocumentWithClaude,
  fetchDocumentAnalysisHistory,
  saveDocumentAnalysis,
} from '../../services/documentAnalysisService'

const ANALYSIS_TYPES = [
  {
    value: 'contrato-geral',
    label: 'Revisao geral',
    description: 'Riscos, pontos faltantes e melhorias antes da assinatura.',
  },
  {
    value: 'riscos',
    label: 'Riscos principais',
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
    description: 'Use para conversar livremente sobre o documento.',
  },
]

const QUICK_PROMPTS = [
  'Quero tirar uma duvida administrativa.',
  'Resuma os pontos mais importantes deste documento.',
  'Quais riscos a PROJEP deveria revisar antes de assinar?',
  'Existe alguma clausula que parece faltar ou estar incompleta?',
]

function renderInlineMarkdown(text) {
  const parts = `${text || ''}`.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold text-white">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index} className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-xs text-[#E8955A]">{part.slice(1, -1)}</code>
    }
    return part
  })
}

function MarkdownMessage({ text }) {
  const lines = `${text || ''}`.replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let paragraph = []
  let list = []

  const flushParagraph = () => {
    if (!paragraph.length) return
    blocks.push({ type: 'paragraph', text: paragraph.join(' ') })
    paragraph = []
  }

  const flushList = () => {
    if (!list.length) return
    blocks.push({ type: 'list', items: list })
    list = []
  }

  lines.forEach(rawLine => {
    const line = rawLine.trim()

    if (!line) {
      flushParagraph()
      flushList()
      return
    }

    if (/^---+$/.test(line)) {
      flushParagraph()
      flushList()
      blocks.push({ type: 'divider' })
      return
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/)
    if (heading) {
      flushParagraph()
      flushList()
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2] })
      return
    }

    const bullet = line.match(/^[-*]\s+(.+)$/)
    if (bullet) {
      flushParagraph()
      list.push(bullet[1])
      return
    }

    const numbered = line.match(/^\d+\.\s+(.+)$/)
    if (numbered) {
      flushParagraph()
      list.push(numbered[1])
      return
    }

    paragraph.push(line)
  })

  flushParagraph()
  flushList()

  return (
    <div className="space-y-3 text-sm leading-6 text-gray-200">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          const size = block.level === 1 ? 'text-lg' : block.level === 2 ? 'text-base' : 'text-sm'
          return (
            <h3 key={index} className={`${size} font-bold text-white`}>
              {renderInlineMarkdown(block.text)}
            </h3>
          )
        }

        if (block.type === 'list') {
          return (
            <ul key={index} className="ml-4 list-disc space-y-1 text-gray-200">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInlineMarkdown(item)}</li>
              ))}
            </ul>
          )
        }

        if (block.type === 'divider') {
          return <div key={index} className="h-px bg-[#2A2A2A]" />
        }

        return (
          <p key={index} className="text-gray-200">
            {renderInlineMarkdown(block.text)}
          </p>
        )
      })}
    </div>
  )
}

function isEmptyAssistantText(text) {
  const cleaned = `${text || ''}`.trim()
  if (!cleaned) return true
  if (['{}', '[]', 'null', 'undefined'].includes(cleaned.toLowerCase())) return true

  try {
    const parsed = JSON.parse(cleaned)
    if (parsed === null) return true
    if (Array.isArray(parsed) && parsed.length === 0) return true
    if (typeof parsed === 'object' && Object.keys(parsed).length === 0) return true
  } catch {
    // Respostas em texto/Markdown nao entram aqui.
  }

  return false
}

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

function buildConversationQuestion(messages, nextQuestion, analysisType) {
  const previous = messages
    .slice(-6)
    .map(message => `${message.role === 'assistant' ? 'IA' : 'Usuario'}: ${message.text}`)
    .join('\n\n')

  if (!previous) return nextQuestion

  return [
    'Continue a conversa abaixo sobre o mesmo documento.',
    `Tipo de analise selecionado: ${analysisType}.`,
    '',
    'Historico recente:',
    previous,
    '',
    'Nova pergunta do usuario:',
    nextQuestion,
  ].join('\n')
}

function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  const assistantText = isEmptyAssistantText(message.text)
    ? 'A IA nao retornou uma resposta valida. Tente enviar a pergunta novamente em alguns instantes.'
    : message.text

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#CE7028]/15 text-[#CE7028]">
          <Bot className="h-4 w-4" />
        </div>
      )}

      <div className={`max-w-[82%] rounded-2xl px-4 py-3 ${
        isUser
          ? 'rounded-br-sm bg-[#CE7028] text-white'
          : 'rounded-bl-sm border border-[#1E1E1E] bg-[#161616] text-gray-200'
      }`}>
        <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-70">
          {isUser ? 'Voce' : 'Assistente'}
        </div>
        {isUser ? (
          <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.text}</p>
        ) : (
          <MarkdownMessage text={assistantText} />
        )}
      </div>

      {isUser && (
        <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#044947] text-white">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  )
}

export default function AnaliseDocumentos() {
  const { user } = useAuth()
  const [file, setFile] = useState(null)
  const [analysisType, setAnalysisType] = useState(ANALYSIS_TYPES[0].value)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)
  const fileInputRef = useRef(null)

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  const handleFileChange = selectedFile => {
    setFile(selectedFile)
    setError('')
    setMessages([])
  }

  const handleSend = async event => {
    event?.preventDefault()
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion || loading) return

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmedQuestion,
      createdAt: new Date().toISOString(),
    }

    const previousMessages = messages
    setMessages(current => [...current, userMessage])
    setQuestion('')
    setError('')
    setLoading(true)

    try {
      const analysis = await analyzeDocumentWithClaude({
        file,
        question: buildConversationQuestion(previousMessages, trimmedQuestion, selectedType.label),
        analysisType,
        user,
      })

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: analysis.text,
        createdAt: new Date().toISOString(),
      }

      setMessages(current => [...current, assistantMessage])

      const saveResult = await saveDocumentAnalysis({
        user,
        file,
        question: trimmedQuestion,
        analysisType,
        result: analysis,
      })

      if (saveResult.saved) {
        const rows = await fetchDocumentAnalysisHistory(user)
        setHistory(rows)
      }
    } catch (err) {
      setError(err?.message || 'Nao foi possivel analisar o documento agora.')
      setMessages(current => current.filter(message => message.id !== userMessage.id))
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend(event)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded border border-[#CE7028]/30 bg-[#CE7028]/10 text-[#CE7028]">
            <FileSearch className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Analise de Documentos</h1>
            <p className="mt-1 text-gray-500">Converse com a IA sobre contratos, propostas e documentos do Adm e Fin.</p>
          </div>
        </div>
      </div>

      <section className="mx-auto flex h-[calc(100vh-230px)] min-h-[640px] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#1E1E1E] bg-[#111111] shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-4 border-b border-[#1E1E1E] p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Chat com IA</p>
            <h2 className="mt-1 truncate text-lg font-bold text-white">
              {file ? file.name : 'Chat livre com IA'}
            </h2>
            <p className="mt-1 text-xs text-gray-600">{selectedType.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {file && (
              <div className="flex max-w-full items-center gap-2 rounded-full border border-[#CE7028]/30 bg-[#CE7028]/10 px-3 py-2 text-xs text-gray-300">
                <Paperclip className="h-3.5 w-3.5 flex-shrink-0 text-[#CE7028]" />
                <span className="max-w-[220px] truncate font-bold text-white">{file.name}</span>
                <span className="text-gray-500">{formatBytes(file.size)}</span>
                <button
                  type="button"
                  onClick={() => handleFileChange(null)}
                  className="ml-1 rounded-full p-1 text-gray-500 transition-colors hover:bg-red-950/40 hover:text-red-300"
                  aria-label="Remover documento"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <div>
              <span className="sr-only">Tipo de conversa</span>
              <select
                value={analysisType}
                onChange={event => setAnalysisType(event.target.value)}
                className="h-10 rounded-full border border-[#1E1E1E] bg-[#0D0D0D] px-3 text-xs font-bold text-gray-300 outline-none transition-colors hover:border-[#CE7028]/60 focus:border-[#CE7028]"
                title="Tipo de conversa"
              >
                {ANALYSIS_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#CE7028]/10 text-[#CE7028]">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-5">
          {messages.length === 0 ? (
            <div className="flex min-h-full flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#CE7028]/10 text-[#CE7028]">
                <Bot className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-white">Converse com a IA sobre o documento</h3>
              <p className="mt-2 max-w-lg text-sm leading-6 text-gray-500">
                Faca uma pergunta livre ou anexe um documento pelo clipe para pedir uma analise mais especifica.
              </p>
              <div className="mt-5 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
                {QUICK_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setQuestion(prompt)}
                    className="rounded-xl border border-[#1E1E1E] bg-[#0D0D0D] p-3 text-left text-sm text-gray-300 transition-colors hover:border-[#CE7028]/60 hover:text-white"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map(message => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#CE7028]/15 text-[#CE7028]">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl rounded-bl-sm border border-[#1E1E1E] bg-[#161616] px-4 py-3 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-[#CE7028]" />
                      Analisando...
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {error && (
          <div className="mx-5 mb-3 flex gap-3 rounded border border-red-900/40 bg-red-950/20 p-3 text-sm text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSend} className="border-t border-[#1E1E1E] p-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md,.html,.htm,.docx,.rtf"
            className="hidden"
            onChange={event => {
              handleFileChange(event.target.files?.[0] || null)
              event.target.value = ''
            }}
          />
          <div className="flex items-end gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
                file
                  ? 'border-[#CE7028]/50 bg-[#CE7028]/10 text-[#CE7028]'
                  : 'border-[#1E1E1E] text-gray-500 hover:border-[#CE7028]/60 hover:text-[#CE7028]'
              }`}
              title={file ? 'Trocar documento' : 'Anexar documento'}
              aria-label={file ? 'Trocar documento' : 'Anexar documento'}
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <textarea
              value={question}
              onChange={event => setQuestion(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={file ? 'Pergunte algo sobre o documento...' : 'Pergunte livremente ou anexe um documento pelo clipe...'}
              className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-[#1E1E1E] bg-[#0D0D0D] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-700 focus:border-[#CE7028]"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#CE7028] text-white transition-colors hover:bg-[#B8621F] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Enviar pergunta"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </form>
      </section>

      <section className="mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border border-[#1E1E1E] bg-[#111111]">
        <div className="flex items-center gap-2 border-b border-[#1E1E1E] p-4">
          <History className="h-4 w-4 text-[#CE7028]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Historico recente</h2>
        </div>
        {history.length > 0 ? (
          <div className="divide-y divide-[#1E1E1E]">
            {history.map(item => (
              <div key={item.id} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="truncate text-sm font-bold text-white">{item.file_name || 'Documento sem nome'}</p>
                <p className="text-xs text-gray-500">
                  {item.created_at ? new Date(item.created_at).toLocaleString('pt-BR') : 'sem data'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-sm text-gray-500">
            Nenhum historico encontrado ainda.
          </div>
        )}
      </section>
    </div>
  )
}
