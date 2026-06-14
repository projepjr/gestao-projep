import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Search, X, Send, Pin, Users, MessageSquare, Circle } from 'lucide-react'

// ── Static data ───────────────────────────────────────────────

const MEMBERS_DATA = [
  { id:  1, nome: 'Ana Silva',       cargo: 'Hunter',            setor: 'Comercial',         status: 'online',  avatar: 'AS', color: '#CE7028' },
  { id:  2, nome: 'João Silva',      cargo: 'Hunter',            setor: 'Comercial',         status: 'online',  avatar: 'JS', color: '#B5611F' },
  { id:  3, nome: 'Ana Costa',       cargo: 'Hunter',            setor: 'Comercial',         status: 'offline', avatar: 'AC', color: '#8B4513' },
  { id:  4, nome: 'Pedro Alves',     cargo: 'Hunter',            setor: 'Comercial',         status: 'online',  avatar: 'PA', color: '#A0522D' },
  { id:  5, nome: 'Lucas Mendes',    cargo: 'Hunter',            setor: 'Comercial',         status: 'offline', avatar: 'LM', color: '#CD853F' },
  { id:  6, nome: 'Mariana Lima',    cargo: 'Closer',            setor: 'Comercial',         status: 'online',  avatar: 'ML', color: '#2A6B69' },
  { id:  7, nome: 'Rafael Souza',    cargo: 'Closer',            setor: 'Comercial',         status: 'offline', avatar: 'RS', color: '#044947' },
  { id:  8, nome: 'Camila Rocha',    cargo: 'Closer',            setor: 'Comercial',         status: 'online',  avatar: 'CR', color: '#056561' },
  { id:  9, nome: 'Daniela Rocha',   cargo: 'Dir. de GP',        setor: 'Gestão de Pessoas', status: 'online',  avatar: 'DR', color: '#3D5A80' },
  { id: 10, nome: 'Bruno Costa',     cargo: 'Analista de GP',    setor: 'Gestão de Pessoas', status: 'online',  avatar: 'BC', color: '#293241' },
  { id: 11, nome: 'Carlos Mendes',   cargo: 'Presidente',        setor: 'Presidência',       status: 'online',  avatar: 'CM', color: '#1A1A2E' },
  { id: 12, nome: 'Beatriz Santos',  cargo: 'Dir. de Marketing', setor: 'Marketing',         status: 'online',  avatar: 'BS', color: '#7B2D8B' },
  { id: 13, nome: 'Fernando Lima',   cargo: 'Ger. de Projetos',  setor: 'Projetos',          status: 'offline', avatar: 'FL', color: '#1565C0' },
  { id: 14, nome: 'Gabriela Costa',  cargo: 'Dir. Financeira',   setor: 'Adm. e Financeiro', status: 'online',  avatar: 'GC', color: '#2E7D32' },
]

const CONVERSATIONS = [
  { id: 'avisos',      name: 'Avisos Gerais',  type: 'channel', avatar: 'AG', color: '#CE7028', pinned: true,  lastMsg: 'Prazo pesquisa de clima: amanhã 14/06.',            time: '14:30', unread: 2 },
  { id: 'dm-daniela',  name: 'Daniela Rocha',  type: 'dm',      avatar: 'DR', color: '#3D5A80', pinned: false, lastMsg: 'Pode ver o feedback completo no seu perfil.',       time: '11:46', unread: 0 },
  { id: 'dm-carlos',   name: 'Carlos Mendes',  type: 'dm',      avatar: 'CM', color: '#1A1A2E', pinned: false, lastMsg: 'Excelente trabalho no fechamento com a Delta Corp!',time: '16:00', unread: 1 },
  { id: 'dm-mariana',  name: 'Mariana Lima',   type: 'dm',      avatar: 'ML', color: '#2A6B69', pinned: false, lastMsg: 'Foram 11 contratos esse mês, bom resultado!',       time: '09:08', unread: 0 },
]

const DEFAULT_MESSAGES = {
  'avisos': [
    { id: 1, from: 'Carlos Mendes',  fromRole: 'Presidente',        avatar: 'CM', color: '#1A1A2E', text: 'Bem-vindos ao canal de avisos oficiais da PROJEP. Apenas a diretoria pode publicar aqui.', time: '08:00', date: '2026-06-10', system: true },
    { id: 2, from: 'Carlos Mendes',  fromRole: 'Presidente',        avatar: 'CM', color: '#1A1A2E', text: 'Reunião de planejamento do segundo semestre confirmada para sexta-feira, 20/06, às 18h. Presença obrigatória para todos os diretores e gerentes.', time: '09:15', date: '2026-06-12' },
    { id: 3, from: 'Daniela Rocha',  fromRole: 'Dir. de GP',        avatar: 'DR', color: '#3D5A80', text: 'Lembrando a todos: prazo para a pesquisa de clima organizacional é amanhã, 14/06. Acessem o link enviado por e-mail e levem de 5 a 10 minutos para responder.', time: '14:30', date: '2026-06-13' },
  ],
  'dm-daniela': [
    { id: 1, from: 'Daniela Rocha', avatar: 'DR', color: '#3D5A80', text: 'Oi! Queria parabenizar pelo resultado excelente deste mês. Superou as expectativas!', time: '11:30', date: '2026-06-11' },
    { id: 2, from: 'me', text: 'Obrigado, Dani! Foi um esforço de toda a equipe, estou muito feliz com o resultado.', time: '11:43', date: '2026-06-11' },
    { id: 3, from: 'Daniela Rocha', avatar: 'DR', color: '#3D5A80', text: 'Com certeza! Sua avaliação mensal já está disponível — pode acessar no seu perfil.', time: '11:46', date: '2026-06-11' },
  ],
  'dm-carlos': [
    { id: 1, from: 'Carlos Mendes', avatar: 'CM', color: '#1A1A2E', text: 'Parabéns pelo fechamento com a Delta Corp! Foi um trabalho de muita persistência.', time: '16:00', date: '2026-06-10' },
    { id: 2, from: 'me', text: 'Obrigado, presidente! Foi um processo de quase 3 semanas, mas valeu muito a pena.', time: '16:15', date: '2026-06-10' },
    { id: 3, from: 'Carlos Mendes', avatar: 'CM', color: '#1A1A2E', text: 'Excelente. Continue assim — você tem perfil para liderar a equipe em breve.', time: '16:18', date: '2026-06-10' },
  ],
  'dm-mariana': [
    { id: 1, from: 'me', text: 'Mariana, você já enviou o relatório de closings do mês para o Carlos?', time: '09:00', date: '2026-06-13' },
    { id: 2, from: 'Mariana Lima', avatar: 'ML', color: '#2A6B69', text: 'Sim! Acabei de mandar há pouco. Foram 11 contratos fechados este mês — bom resultado para toda a equipe!', time: '09:08', date: '2026-06-13' },
    { id: 3, from: 'me', text: 'Perfeito, obrigado por avisar!', time: '09:11', date: '2026-06-13' },
  ],
}

const SETOR_COLORS = {
  'Comercial':          'bg-[#CE7028]/10 text-[#FF882D] border-[#CE7028]/20',
  'Gestão de Pessoas':  'bg-blue-950/30 text-blue-400 border-blue-900/30',
  'Presidência':        'bg-purple-950/30 text-purple-400 border-purple-900/30',
  'Marketing':          'bg-pink-950/30 text-pink-400 border-pink-900/30',
  'Projetos':           'bg-cyan-950/30 text-cyan-400 border-cyan-900/30',
  'Adm. e Financeiro':  'bg-green-950/30 text-green-400 border-green-900/30',
}

// ── Helpers ───────────────────────────────────────────────────

function loadMessages() {
  try { return JSON.parse(localStorage.getItem('ej_messages')) || DEFAULT_MESSAGES }
  catch { return DEFAULT_MESSAGES }
}

function saveMessages(data) {
  localStorage.setItem('ej_messages', JSON.stringify(data))
}

// ── Member card ───────────────────────────────────────────────

function MemberCard({ member, onClick }) {
  return (
    <div onClick={() => onClick(member)} className="bg-[#111111] border border-[#1E1E1E] rounded-md p-4 cursor-pointer hover:border-[#CE7028]/30 hover:bg-[#161616] transition-all group">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-3">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: member.color }}>
            {member.avatar}
          </div>
          <span className={`absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-[#111111] ${member.status === 'online' ? 'bg-green-400' : 'bg-gray-600'}`} />
        </div>
        <p className="text-white text-sm font-semibold leading-tight mb-0.5">{member.nome}</p>
        <p className="text-gray-500 text-xs mb-2">{member.cargo}</p>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${SETOR_COLORS[member.setor] || 'bg-gray-800 text-gray-400 border-gray-700'}`}>
          {member.setor}
        </span>
      </div>
    </div>
  )
}

// ── Member detail modal ───────────────────────────────────────

function MemberModal({ member, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#111111] border border-[#1E1E1E] rounded-md w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E1E1E]">
          <h3 className="text-white font-semibold text-sm">Perfil do Membro</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 text-center">
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto" style={{ background: member.color }}>
              {member.avatar}
            </div>
            <span className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-[#111111] ${member.status === 'online' ? 'bg-green-400' : 'bg-gray-600'}`} />
          </div>
          <h2 className="text-white font-bold text-lg mb-1">{member.nome}</h2>
          <p className="text-[#FF882D] text-sm font-medium mb-1">{member.cargo}</p>
          <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded border mb-4 ${SETOR_COLORS[member.setor] || 'bg-gray-800 text-gray-400 border-gray-700'}`}>
            {member.setor}
          </span>
          <div className={`flex items-center justify-center gap-1.5 text-xs font-medium ${member.status === 'online' ? 'text-green-400' : 'text-gray-500'}`}>
            <Circle className={`w-2 h-2 fill-current`} />
            {member.status === 'online' ? 'Online agora' : 'Offline'}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Chat ──────────────────────────────────────────────────────

function Chat({ user }) {
  const [selectedConv, setSelectedConv] = useState('avisos')
  const [messages,     setMessages]     = useState(loadMessages)
  const [inputMsg,     setInputMsg]     = useState('')
  const [convSearch,   setConvSearch]   = useState('')
  const messagesEndRef = useRef(null)

  const conv = CONVERSATIONS.find(c => c.id === selectedConv)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConv, messages])

  const canPost = selectedConv !== 'avisos' || ['presidente', 'gp'].includes(user?.role)

  const sendMessage = (e) => {
    e?.preventDefault()
    if (!inputMsg.trim() || !canPost) return
    const msg = {
      id:   Date.now(),
      from: 'me',
      text: inputMsg.trim(),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
    }
    const updated = { ...messages, [selectedConv]: [...(messages[selectedConv] || []), msg] }
    setMessages(updated)
    saveMessages(updated)
    setInputMsg('')
  }

  const filteredConvs = CONVERSATIONS.filter(c =>
    c.name.toLowerCase().includes(convSearch.toLowerCase())
  )

  const convMsgs = messages[selectedConv] || []

  const groupByDate = (msgs) => {
    const groups = {}
    msgs.forEach(m => {
      const d = m.date || '2026-06-13'
      if (!groups[d]) groups[d] = []
      groups[d].push(m)
    })
    return groups
  }

  const fmtDate = (iso) => {
    const today = new Date().toISOString().split('T')[0]
    if (iso === today) return 'Hoje'
    const d = new Date(iso + 'T12:00:00')
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  const grouped = groupByDate(convMsgs)

  return (
    <div className="flex h-[calc(100vh-180px)] min-h-[500px] bg-[#111111] border border-[#1E1E1E] rounded-md overflow-hidden">

      {/* Left: Conversation list */}
      <div className="w-72 flex-shrink-0 border-r border-[#1E1E1E] flex flex-col">
        <div className="px-4 py-3 border-b border-[#1E1E1E]">
          <p className="text-white font-semibold text-sm mb-3">Mensagens</p>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
            <input
              value={convSearch}
              onChange={e => setConvSearch(e.target.value)}
              placeholder="Buscar conversa..."
              className="w-full bg-[#0D0D0D] border border-[#1E1E1E] rounded pl-8 pr-3 py-2 text-white text-xs focus:outline-none focus:border-[#CE7028] transition-colors placeholder-gray-700"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Pinned */}
          {filteredConvs.filter(c => c.pinned).map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedConv(c.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-[#1E1E1E]/50 transition-colors hover:bg-white/5 ${selectedConv === c.id ? 'bg-[#CE7028]/10 border-l-2 border-l-[#CE7028]' : ''}`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: c.color }}>
                  {c.avatar}
                </div>
                <Pin className="absolute -top-1 -right-1 w-3 h-3 text-[#CE7028]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className={`text-xs font-semibold truncate ${selectedConv === c.id ? 'text-[#FF882D]' : 'text-white'}`}>{c.name}</p>
                  <span className="text-[10px] text-gray-600 flex-shrink-0">{c.time}</span>
                </div>
                <p className="text-gray-600 text-[11px] truncate mt-0.5">{c.lastMsg}</p>
              </div>
              {c.unread > 0 && (
                <span className="bg-[#CE7028] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0">{c.unread}</span>
              )}
            </button>
          ))}

          {/* DMs */}
          <div className="px-4 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Diretas</p>
          </div>
          {filteredConvs.filter(c => !c.pinned).map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedConv(c.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-[#1E1E1E]/50 transition-colors hover:bg-white/5 ${selectedConv === c.id ? 'bg-[#CE7028]/10 border-l-2 border-l-[#CE7028]' : ''}`}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: c.color }}>
                {c.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className={`text-xs font-semibold truncate ${selectedConv === c.id ? 'text-[#FF882D]' : 'text-white'}`}>{c.name}</p>
                  <span className="text-[10px] text-gray-600 flex-shrink-0">{c.time}</span>
                </div>
                <p className="text-gray-600 text-[11px] truncate mt-0.5">{c.lastMsg}</p>
              </div>
              {c.unread > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0">{c.unread}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#1E1E1E] bg-[#0D0D0D]">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: conv?.color }}>
              {conv?.avatar}
            </div>
            {conv?.pinned && <Pin className="absolute -top-1 -right-1 w-3 h-3 text-[#CE7028]" />}
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">{conv?.name}</p>
            <p className="text-gray-600 text-[10px]">
              {conv?.type === 'channel' ? 'Canal de avisos — somente leitura para membros' : 'Conversa direta'}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {Object.entries(grouped).map(([date, msgs]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-[#1E1E1E]" />
                <span className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider px-2">{fmtDate(date)}</span>
                <div className="flex-1 h-px bg-[#1E1E1E]" />
              </div>
              {msgs.map(msg => {
                const isMe = msg.from === 'me'
                return (
                  <div key={msg.id} className={`flex items-end gap-2.5 mb-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mb-0.5" style={{ background: msg.color || '#CE7028' }}>
                        {msg.avatar || '?'}
                      </div>
                    )}
                    <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      {!isMe && (
                        <span className="text-[10px] text-gray-600 mb-1 ml-1">
                          {msg.from}{msg.fromRole ? ` · ${msg.fromRole}` : ''}
                        </span>
                      )}
                      <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? 'bg-[#CE7028] text-white rounded-br-sm'
                          : msg.system
                            ? 'bg-[#1E1E1E] text-gray-400 italic text-xs'
                            : 'bg-[#1A1A1A] text-gray-200 border border-[#2A2A2A] rounded-bl-sm'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-gray-700 mt-1 mx-1">{msg.time}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {canPost ? (
          <form onSubmit={sendMessage} className="flex items-center gap-3 px-4 py-3 border-t border-[#1E1E1E] bg-[#0D0D0D]">
            <input
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) sendMessage(e) }}
              placeholder={`Mensagem para ${conv?.name}...`}
              className="flex-1 bg-[#111111] border border-[#1E1E1E] rounded-full px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#CE7028] transition-colors placeholder-gray-700"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim()}
              className="w-9 h-9 bg-[#CE7028] hover:bg-[#B5611F] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2 px-5 py-3.5 border-t border-[#1E1E1E] bg-[#0A0A0A]">
            <div className="flex-1 text-center text-xs text-gray-600 py-1">
              Apenas a diretoria pode postar neste canal
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────

export default function Membros() {
  const { user } = useAuth()
  const [activeTab,      setActiveTab]      = useState('membros')
  const [search,         setSearch]         = useState('')
  const [selectedMember, setSelectedMember] = useState(null)

  const filtered = MEMBERS_DATA.filter(m =>
    m.nome.toLowerCase().includes(search.toLowerCase()) ||
    m.setor.toLowerCase().includes(search.toLowerCase()) ||
    m.cargo.toLowerCase().includes(search.toLowerCase())
  )

  const onlineCount  = MEMBERS_DATA.filter(m => m.status === 'online').length
  const offlineCount = MEMBERS_DATA.filter(m => m.status === 'offline').length

  return (
    <div className="space-y-5 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Membros</h1>
        <p className="text-gray-600 text-sm mt-0.5">{onlineCount} online · {offlineCount} offline</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-[#161616] border border-[#1E1E1E] rounded p-1 gap-0.5 w-fit">
        {[
          { key: 'membros',      label: 'Diretório',     icon: Users           },
          { key: 'comunicacao',  label: 'Comunicação',   icon: MessageSquare   },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-all ${activeTab === key ? 'bg-[#CE7028] text-white' : 'text-gray-500 hover:text-gray-200'}`}
          >
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* ── Tab: Diretório ─────────────────────────── */}
      {activeTab === 'membros' && (
        <div>
          {/* Search */}
          <div className="relative mb-5 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome, cargo ou setor..."
              className="w-full bg-[#111111] border border-[#1E1E1E] rounded pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#CE7028] transition-colors placeholder-gray-700"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum membro encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
              {filtered.map(m => (
                <MemberCard key={m.id} member={m} onClick={setSelectedMember} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Comunicação ───────────────────────── */}
      {activeTab === 'comunicacao' && <Chat user={user} />}

      {/* Member detail modal */}
      {selectedMember && <MemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />}
    </div>
  )
}
