import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { Send, Pin, Search, Hash, Users, MessageSquare, Mail, Phone, X } from 'lucide-react'
import UserAvatar from '../components/UserAvatar'
import { canPostAnnouncements } from '../config/authorization'

// ── Colors ────────────────────────────────────────────────────
const AVATAR_COLORS = ['#3D5A80','#2A6B69','#7B2D8B','#1A3A5C','#5C3A1A','#1A4A5C','#4A1A5C']
const idsEqual = (a, b) => String(a ?? '') === String(b ?? '')
const matchesUserId = (id, member) => Boolean(member) && (
  idsEqual(id, member.id) ||
  idsEqual(id, member.supabaseId)
)
const memberColor = (id) => {
  const hash = String(id ?? '')
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

// ── Fixed channel ─────────────────────────────────────────────
const AVISOS_CONV = {
  id: 'avisos', name: 'Avisos Gerais', type: 'channel',
  avatar: 'AG', color: '#CE7028', pinned: true,
  subtitle: 'Canal oficial da diretoria',
}

// ── Date helpers ──────────────────────────────────────────────
function fmtDate(iso) {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const diff = Math.round((today - new Date(iso + 'T00:00:00')) / 86400000)
    if (diff === 0) return 'Hoje'
    if (diff === 1) return 'Ontem'
    return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  } catch { return iso }
}

function dateNow() { return new Date().toISOString().split('T')[0] }

function presentMessage(message, members) {
  const timestamp = message.timestamp || new Date().toISOString()
  const sender = message.remetenteId === 'system'
    ? null
    : members.find(member => matchesUserId(message.remetenteId, member))
  return {
    id: message.id,
    senderId: message.remetenteId,
    from: message.remetenteId === 'system' ? 'Sistema' : (sender?.nome || 'Membro removido'),
    avatar: message.remetenteId === 'system' ? 'SY' : (sender?.avatar || '?'),
    user: sender,
    color: message.remetenteId === 'system' ? '#444' : memberColor(message.remetenteId),
    text: message.texto,
    time: new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    date: timestamp.split('T')[0],
    system: message.remetenteId === 'system',
  }
}

// ── MemberCard ────────────────────────────────────────────────
function MemberCard({ member, onChat, isCurrentUser }) {
  const [showModal, setShowModal] = useState(false)
  const color = memberColor(member.id)

  return (
    <>
      <div
        className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5 hover:border-[#CE7028]/30 transition-all group cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <div className="flex flex-col items-center text-center">
          <UserAvatar user={member} size={64} fallbackColor={color} textClassName="text-xl" className="mb-3 ring-2 ring-transparent group-hover:ring-[#CE7028]/50 transition-all" />
          <h3 className="text-white font-semibold text-sm leading-tight">{member.nome}</h3>
          <p className="text-[#FF882D] text-xs mt-0.5">{member.cargo}</p>
          <p className="text-gray-600 text-xs mt-0.5">{member.setor}</p>

          <div className="flex flex-wrap gap-1 justify-center mt-3 mb-3">
            {member.skills?.slice(0, 2).map(s => (
              <span key={s} className="text-[10px] bg-[#1A1A1A] border border-[#2A2A2A] text-gray-500 px-1.5 py-0.5 rounded">
                {s}
              </span>
            ))}
          </div>

          {isCurrentUser ? (
            <span className="w-full py-2 text-xs font-semibold text-gray-600 border border-[#1E1E1E] rounded">Este é você</span>
          ) : (
            <button
              onClick={e => { e.stopPropagation(); onChat(member) }}
              className="w-full py-2 text-xs font-semibold bg-[#CE7028]/10 hover:bg-[#CE7028]/20 text-[#FF882D] border border-[#CE7028]/20 rounded transition-colors"
            >
              Enviar Mensagem
            </button>
          )}
        </div>
      </div>

      {/* Mini profile modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-[#111111] border border-[#1E1E1E] rounded-md w-full max-w-xs shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E1E1E]">
              <p className="text-white font-semibold text-sm">Perfil do Membro</p>
              <button onClick={() => setShowModal(false)} className="text-gray-600 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5">
              <div className="flex flex-col items-center mb-5">
                <UserAvatar user={member} size={80} fallbackColor={color} textClassName="text-2xl" className="mb-3" />
                <h3 className="text-white font-bold text-base">{member.nome}</h3>
                <p className="text-[#FF882D] text-sm">{member.cargo}</p>
                <p className="text-gray-600 text-xs mt-0.5">{member.setor}</p>
              </div>

              <div className="space-y-2 text-xs mb-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Mail className="w-3.5 h-3.5 text-gray-600" />
                  <span>{member.email || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Phone className="w-3.5 h-3.5 text-gray-600" />
                  <span>{member.telefone || '—'}</span>
                </div>
              </div>

              {member.skills?.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-2">Habilidades</p>
                  <div className="flex flex-wrap gap-1">
                    {member.skills.map(s => (
                      <span key={s} className="text-[10px] bg-[#1A1A1A] border border-[#2A2A2A] text-gray-400 px-2 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 text-center bg-[#0D0D0D] border border-[#1E1E1E] rounded p-2.5">
                  <p className="text-white font-bold text-sm">{member.performance || 0}%</p>
                  <p className="text-gray-600 text-[10px] mt-0.5">Desempenho</p>
                </div>
                <div className="flex-1 text-center bg-[#0D0D0D] border border-[#1E1E1E] rounded p-2.5">
                  <p className="text-white font-bold text-sm">{member.projects || 0}</p>
                  <p className="text-gray-600 text-[10px] mt-0.5">Projetos</p>
                </div>
              </div>

              {!isCurrentUser && (
                <button
                  onClick={() => { setShowModal(false); onChat(member) }}
                  className="w-full py-2.5 bg-[#CE7028] hover:bg-[#B5611F] text-white font-semibold text-sm rounded transition-colors"
                >
                  Enviar Mensagem
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── ConvItem ──────────────────────────────────────────────────
function ConvItem({ conv, active, lastMsg, unreadCount = 0, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
        ${active
          ? 'bg-[#CE7028]/15 border-l-2 border-l-[#CE7028]'
          : 'hover:bg-white/5 border-l-2 border-l-transparent'
        }`}
    >
      <div className="relative flex-shrink-0">
        <UserAvatar user={conv.user || { nome: conv.name, avatar: conv.avatar }} size={36} fallbackColor={conv.color} textClassName="text-xs" />
        {conv.pinned && <Pin className="absolute -top-1 -right-1.5 w-2.5 h-2.5 text-[#CE7028]" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold truncate ${active ? 'text-[#FF882D]' : 'text-white'}`}>{conv.name}</p>
        <p className="text-gray-600 text-[11px] truncate mt-0.5">
          {lastMsg && !lastMsg.system ? lastMsg.text : conv.subtitle}
        </p>
      </div>
      {unreadCount > 0 && (
        <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#CE7028] text-white text-[10px] font-bold flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}

// ── Main ──────────────────────────────────────────────────────
export default function Chat() {
  const { user } = useAuth()
  const { members, messages: storedMessages, sendMessage: persistMessage, markConversationRead } = useData()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedUserId = searchParams.get('user')
  const requestedConversation = members.some(member =>
    matchesUserId(requestedUserId, member) && !matchesUserId(requestedUserId, user) && member.status === 'ativo'
  ) ? `dm-${members.find(member => matchesUserId(requestedUserId, member))?.id}` : 'avisos'

  const [activeTab,    setActiveTab]    = useState('comunicacao')
  const selectedConv = requestedConversation
  const [input,        setInput]        = useState('')
  const [convSearch,   setConvSearch]   = useState('')
  const [memberSearch, setMemberSearch] = useState('')
  const [sendError,    setSendError]    = useState('')

  const messagesEnd = useRef(null)
  const inputRef    = useRef(null)

  // Build conversations from DataContext members (mesma fonte: db.get('usuarios'))
  const allConversations = [
    AVISOS_CONV,
    ...members.filter(member => !matchesUserId(member.id, user) && member.status === 'ativo').map(m => ({
      id:       `dm-${m.id}`,
      name:     m.nome,
      type:     'dm',
      avatar:   m.avatar,
      color:    memberColor(m.id),
      subtitle: m.cargo,
      pinned:   false,
      memberId: m.id,
      user:     m,
    })),
  ]

  const filteredConvs = allConversations.filter(c =>
    !convSearch || c.name.toLowerCase().includes(convSearch.toLowerCase())
  )
  const pinnedConvs = filteredConvs.filter(c => c.pinned)
  const dmConvs     = filteredConvs.filter(c => !c.pinned)

  const conv = allConversations.find(c => c.id === selectedConv) || AVISOS_CONV
  const convMessages = (() => {
    return storedMessages
      .filter(message => {
        if (selectedConv === 'avisos') return message.destinatarioId === 'avisos'
        return (
          (matchesUserId(message.remetenteId, user) && matchesUserId(message.destinatarioId, conv.user)) ||
          (matchesUserId(message.remetenteId, conv.user) && matchesUserId(message.destinatarioId, user))
        )
      })
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(message => presentMessage(message, members))
  })()

  const canPost = selectedConv !== 'avisos' || canPostAnnouncements(user)

  useEffect(() => {
    markConversationRead({
      userId: user?.id,
      memberId: selectedConv === 'avisos' ? null : conv.memberId,
      channelId: selectedConv === 'avisos' ? 'avisos' : null,
    })
  }, [conv.memberId, markConversationRead, selectedConv, user?.id])

  // Auto-scroll
  useEffect(() => {
    const t = setTimeout(() => messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }), 60)
    return () => clearTimeout(t)
  }, [selectedConv, convMessages.length])

  // Focus input on conversation switch
  useEffect(() => {
    if (activeTab === 'comunicacao' && canPost) inputRef.current?.focus()
  }, [selectedConv, activeTab, canPost])

  const sendMessage = () => {
    const text = input.trim()
    if (!text || !canPost) return

    setSendError('')
    const result = persistMessage({
      senderId: user.id,
      receiverId: selectedConv === 'avisos' ? null : conv.memberId,
      channelId: selectedConv === 'avisos' ? 'avisos' : null,
      content: text,
    })
    if (!result.success) return setSendError(result.error)
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  // Group messages by date
  const groupedMessages = convMessages.reduce((acc, msg) => {
    const d = msg.date || dateNow()
    if (!acc[d]) acc[d] = []
    acc[d].push(msg)
    return acc
  }, {})
  const sortedDates = Object.keys(groupedMessages).sort()

  const getLastMsg = (id) => {
    const target = allConversations.find(conversation => conversation.id === id)
    const matches = storedMessages
      .filter(message => id === 'avisos'
        ? message.destinatarioId === 'avisos'
        : (
          (matchesUserId(message.remetenteId, user) && matchesUserId(message.destinatarioId, target?.user)) ||
          (matchesUserId(message.remetenteId, target?.user) && matchesUserId(message.destinatarioId, user))
        ))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    return matches.length ? presentMessage(matches[matches.length - 1], members) : null
  }

  const goToChat = (member) => {
    setActiveTab('comunicacao')
    setSearchParams({ user: String(member.id) })
  }

  const selectConversation = conversationId => {
    if (conversationId === 'avisos') setSearchParams({})
    else setSearchParams({ user: conversationId.replace('dm-', '') })
  }

  const getUnreadCount = conversation => storedMessages.filter(message => {
    if (conversation.id === 'avisos') {
      return message.destinatarioId === 'avisos' && !(message.lidosPor || []).some(id => matchesUserId(id, user))
    }
    return matchesUserId(message.remetenteId, conversation.user) && matchesUserId(message.destinatarioId, user) && !message.lida
  }).length

  const filteredMembers = members.filter(m =>
    m.status === 'ativo' && (
      !memberSearch ||
      m.nome?.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.setor?.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.cargo?.toLowerCase().includes(memberSearch.toLowerCase())
    )
  )

  return (
    <div className="max-w-6xl">

      {/* ── Tabs ─────────────────────────────────────── */}
      <div className="flex items-center gap-1 mb-5">
        {[
          { id: 'membros',      label: 'Membros',      Icon: Users         },
          { id: 'comunicacao',  label: 'Comunicação',  Icon: MessageSquare },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded text-sm font-semibold transition-all ${
              activeTab === id
                ? 'bg-[#CE7028] text-white shadow-md'
                : 'text-gray-500 hover:text-white hover:bg-[#1A1A1A]'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {id === 'membros' && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === id ? 'bg-white/20 text-white' : 'bg-[#1A1A1A] text-gray-600'}`}>
                {members.filter(m => m.status === 'ativo').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Membros ─────────────────────────────── */}
      {activeTab === 'membros' && (
        <div>
          <div className="mb-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
              <input
                value={memberSearch}
                onChange={e => setMemberSearch(e.target.value)}
                placeholder="Buscar por nome, cargo ou setor..."
                className="w-full bg-[#111111] border border-[#1E1E1E] rounded pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#CE7028] transition-colors placeholder-gray-700"
              />
            </div>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="text-center py-16 text-gray-700 text-sm">Nenhum membro encontrado</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredMembers.map(m => (
                <MemberCard key={m.id} member={m} onChat={goToChat} isCurrentUser={matchesUserId(m.id, user)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Comunicação ─────────────────────────── */}
      {activeTab === 'comunicacao' && (
        <div className="flex h-[calc(100vh-190px)] min-h-[520px] bg-[#111111] border border-[#1E1E1E] rounded-md overflow-hidden">

          {/* Left: Conversations */}
          <aside className="w-72 flex-shrink-0 flex flex-col border-r border-[#1E1E1E]">
            <div className="px-4 py-3.5 border-b border-[#1E1E1E] bg-[#0D0D0D]">
              <p className="text-white font-bold text-sm mb-3">Mensagens</p>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600 pointer-events-none" />
                <input
                  value={convSearch}
                  onChange={e => setConvSearch(e.target.value)}
                  placeholder="Buscar conversa..."
                  className="w-full bg-[#161616] border border-[#1E1E1E] rounded pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#CE7028] transition-colors placeholder-gray-700"
                />
              </div>
            </div>

            {pinnedConvs.length > 0 && (
              <div className="border-b border-[#1E1E1E]/50">
                <div className="px-4 pt-2.5 pb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Canal</span>
                </div>
                {pinnedConvs.map(c => (
                  <ConvItem key={c.id} conv={c} active={selectedConv === c.id}
                    lastMsg={getLastMsg(c.id)} unreadCount={getUnreadCount(c)} onClick={() => selectConversation(c.id)} />
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              <div className="px-4 pt-3 pb-1">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">
                  Mensagens Diretas
                </span>
              </div>
              {dmConvs.map(c => (
                <ConvItem key={c.id} conv={c} active={selectedConv === c.id}
                  lastMsg={getLastMsg(c.id)} unreadCount={getUnreadCount(c)} onClick={() => selectConversation(c.id)} />
              ))}
            </div>
          </aside>

          {/* Right: Chat area */}
          <div className="flex-1 flex flex-col min-w-0">

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#1E1E1E] bg-[#0D0D0D] flex-shrink-0">
              <UserAvatar user={conv?.user || { nome: conv?.name, avatar: conv?.avatar }} size={32} fallbackColor={conv?.color} textClassName="text-xs" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm leading-tight">{conv?.name}</p>
                <p className="text-gray-600 text-[10px]">{conv?.subtitle}</p>
              </div>
              {conv?.type === 'channel' && !canPost && (
                <span className="text-[10px] text-gray-600 bg-[#1A1A1A] border border-[#1E1E1E] px-2 py-1 rounded flex-shrink-0">
                  Somente leitura
                </span>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
              {sortedDates.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-700 text-sm">Nenhuma mensagem ainda. Inicie a conversa!</p>
                </div>
              )}

              {sortedDates.map(date => (
                <div key={date}>
                  <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-[#1E1E1E]" />
                    <span className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider px-2 whitespace-nowrap">
                      {fmtDate(date)}
                    </span>
                    <div className="flex-1 h-px bg-[#1E1E1E]" />
                  </div>

                  {groupedMessages[date].map((msg, idx) => {
                    // Right side = message sent by current logged-in user
                    const isMe = matchesUserId(msg.senderId, user)
                    const prevMsg = idx > 0 ? groupedMessages[date][idx - 1] : null
                    const showSender = !isMe && (idx === 0 || prevMsg?.senderId !== msg.senderId)

                    return (
                      <div key={msg.id} className={`flex items-end gap-2 mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isMe ? (
                          showSender ? (
                            <UserAvatar
                              user={msg.user || { nome: msg.from, avatar: msg.avatar }}
                              size={28}
                              fallbackColor={msg.color || '#444'}
                              textClassName="text-[10px]"
                              className="mb-1"
                            />
                          ) : (
                            <div className="w-7 flex-shrink-0" />
                          )
                        ) : null}

                        <div className={`flex flex-col max-w-[68%] ${isMe ? 'items-end' : 'items-start'}`}>
                          {!isMe && showSender && (
                            <span className="text-[10px] text-gray-500 mb-1 ml-1">
                              {msg.from}{msg.fromRole ? ` · ${msg.fromRole}` : ''}
                            </span>
                          )}
                          <div className={`px-3.5 py-2.5 text-sm leading-relaxed break-words ${
                            msg.system
                              ? 'bg-transparent text-gray-600 text-xs italic px-0'
                              : isMe
                                ? 'bg-[#CE7028] text-white rounded-2xl rounded-br-sm'
                                : 'bg-[#1A1A1A] text-gray-200 border border-[#2A2A2A] rounded-2xl rounded-bl-sm'
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

              <div ref={messagesEnd} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 border-t border-[#1E1E1E] bg-[#0D0D0D]">
              {canPost ? (
                <div className="px-4 py-3">
                  {sendError && <p className="text-red-400 text-xs mb-2">{sendError}</p>}
                  <div className="flex items-center gap-3">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`Mensagem para ${conv?.name}…`}
                      className="flex-1 bg-[#111111] border border-[#1E1E1E] rounded-full px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#CE7028] transition-colors placeholder-gray-700"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim()}
                      className="w-9 h-9 bg-[#CE7028] hover:bg-[#B5611F] disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center px-4 py-4 text-xs text-gray-600">
                  <Hash className="w-3.5 h-3.5 mr-1.5" />
                  Apenas a diretoria pode postar neste canal
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
