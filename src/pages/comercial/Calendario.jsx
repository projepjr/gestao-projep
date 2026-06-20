import { useMemo, useState } from 'react'
import {
  CalendarDays, ChevronLeft, ChevronRight, Plus, X, Clock, Building2,
  User, Video, Phone, MessageCircle, Edit2, Trash2, CheckCircle2,
  AlertTriangle, RotateCcw, Search, CircleDollarSign, ClipboardList,
  Users,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const idsEqual = (a, b) => String(a ?? '') === String(b ?? '')

const STATUS = {
  agendada: {
    label: 'Agendada',
    cls: 'bg-blue-500/10 text-blue-300 border-blue-500/25',
    dot: 'bg-blue-400',
    day: 'bg-blue-500/15 border-blue-500/30 text-blue-200',
  },
  realizada: {
    label: 'Realizada',
    cls: 'bg-green-500/10 text-green-300 border-green-500/25',
    dot: 'bg-green-400',
    day: 'bg-green-500/15 border-green-500/30 text-green-200',
  },
  follow_up: {
    label: 'Follow-up',
    cls: 'bg-[#CE7028]/10 text-[#FF882D] border-[#CE7028]/30',
    dot: 'bg-[#CE7028]',
    day: 'bg-[#CE7028]/15 border-[#CE7028]/30 text-[#FFB178]',
  },
  noshow: {
    label: 'No-show',
    cls: 'bg-red-500/10 text-red-300 border-red-500/25',
    dot: 'bg-red-400',
    day: 'bg-red-500/15 border-red-500/30 text-red-200',
  },
  cancelada: {
    label: 'Cancelada',
    cls: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    dot: 'bg-gray-500',
    day: 'bg-gray-500/10 border-gray-500/20 text-gray-400',
  },
}

const TYPES = [
  { value: 'diagnostico', label: 'Diagnóstico' },
  { value: 'proposta', label: 'Proposta' },
  { value: 'negociacao', label: 'Negociação' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'kickoff', label: 'Kickoff' },
  { value: 'outro', label: 'Outro' },
]

const CHANNELS = [
  { value: 'Google Meet', label: 'Google Meet', Icon: Video },
  { value: 'Telefone', label: 'Telefone', Icon: Phone },
  { value: 'WhatsApp', label: 'WhatsApp', Icon: MessageCircle },
  { value: 'Presencial', label: 'Presencial', Icon: Building2 },
]

const PRIORITIES = {
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
}

const INPUT = 'w-full bg-[#0D0D0D] border border-[#1E1E1E] rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#CE7028] transition-colors placeholder-gray-700'
const LABEL = 'text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block'

function todayISO() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function toDate(date) {
  return new Date(`${date}T12:00:00`)
}

function toISO(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function fmtDate(date) {
  return toDate(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function fmtMoney(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function getResponsibleIds(meeting) {
  const ids = Array.isArray(meeting?.responsavelIds)
    ? meeting.responsavelIds
    : meeting?.responsavelId ? [meeting.responsavelId] : []

  return [...new Set(ids.map(id => String(id)).filter(Boolean))]
}

function monthLabel(date) {
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

function buildCalendarDays(monthDate) {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const first = new Date(year, month, 1)
  const start = new Date(year, month, 1 - first.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    return {
      iso: toISO(day),
      number: day.getDate(),
      inMonth: day.getMonth() === month,
    }
  })
}

function normalizeMeeting(meeting, leads, members, commercial) {
  const lead = leads.find(item => idsEqual(item.id, meeting.leadId))
  const responsibleIds = getResponsibleIds(meeting)
  const responsibleMembers = responsibleIds
    .map(id => members.find(member => idsEqual(member.id, id)))
    .filter(Boolean)
  const responsibleMember = responsibleMembers.length
    ? { nome: responsibleMembers.map(member => member.nome).join(', ') }
    : null
  const responsibleCommercial = [...(commercial.hunters || []), ...(commercial.closers || [])]
    .find(item => idsEqual(item.id, meeting.responsavelId))

  return {
    ...meeting,
    empresa: meeting.empresa || lead?.company || 'Empresa não informada',
    contato: meeting.contato || lead?.contact || '',
    valorEstimado: meeting.valorEstimado ?? lead?.value ?? 0,
    status: meeting.status || 'agendada',
    tipo: meeting.tipo || 'diagnostico',
    canal: meeting.canal || 'Google Meet',
    prioridade: meeting.prioridade || 'media',
    horaInicio: meeting.horaInicio || '',
    horaFim: meeting.horaFim || '',
    responsavelIds: responsibleIds,
    responsaveis: responsibleMembers,
    responsavelNome: responsibleMember?.nome || responsibleCommercial?.nome || 'Sem responsável',
  }
}

function StatCard({ label, value, accent, helper }) {
  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-4">
      <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">{label}</p>
      <p className="text-2xl font-bold text-white mt-2 tabular-nums">{value}</p>
      <p className="text-xs mt-1" style={{ color: accent }}>{helper}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  const config = STATUS[status] || STATUS.agendada
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-[11px] font-semibold ${config.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

function MeetingCard({ meeting, onEdit, onDelete, onStatus }) {
  const channel = CHANNELS.find(item => item.value === meeting.canal) || CHANNELS[0]
  const ChannelIcon = channel.Icon

  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-4 hover:border-[#CE7028]/35 transition-colors group">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <StatusBadge status={meeting.status} />
            <span className="text-[11px] text-gray-600 uppercase tracking-wider font-semibold">{TYPES.find(t => t.value === meeting.tipo)?.label || meeting.tipo}</span>
          </div>
          <h3 className="text-white font-bold text-sm truncate">{meeting.empresa}</h3>
          <p className="text-gray-500 text-xs mt-0.5">{meeting.titulo || 'Reunião comercial'}</p>
        </div>
        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(meeting)} className="p-1.5 rounded text-gray-600 hover:text-[#FF882D] hover:bg-[#CE7028]/10 transition-all">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(meeting.id)} className="p-1.5 rounded text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-2 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" />{meeting.horaInicio || '--:--'}{meeting.horaFim ? ` - ${meeting.horaFim}` : ''}</div>
        <div className="flex items-center gap-2"><ChannelIcon className="w-3.5 h-3.5" />{meeting.canal}</div>
        <div className="flex items-center gap-2"><User className="w-3.5 h-3.5" />{meeting.contato || 'Contato não informado'}</div>
        <div className="flex items-center gap-2"><CircleDollarSign className="w-3.5 h-3.5" />{fmtMoney(meeting.valorEstimado)}</div>
      </div>

      <div className="mt-3 flex items-start gap-2 text-xs text-gray-500">
        <User className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        <div className="flex flex-wrap gap-1.5">
          {(meeting.responsaveis || []).length > 0 ? (
            meeting.responsaveis.map(member => (
              <span key={member.id} className="px-2 py-1 rounded border border-[#CE7028]/25 bg-[#CE7028]/10 text-[#FF882D] font-semibold">
                {member.nome}
              </span>
            ))
          ) : (
            <span>{meeting.responsavelNome}</span>
          )}
        </div>
      </div>

      {meeting.pauta && (
        <div className="mt-4 p-3 rounded bg-[#0D0D0D] border border-[#1E1E1E]">
          <p className="text-[10px] uppercase tracking-wider text-gray-600 font-bold mb-1">Pauta</p>
          <p className="text-gray-400 text-xs leading-relaxed">{meeting.pauta}</p>
        </div>
      )}

      {meeting.proximoPasso && (
        <div className="mt-2 flex items-start gap-2 text-xs text-[#FF882D]">
          <RotateCcw className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>{meeting.proximoPasso}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-[#1E1E1E]">
        <button onClick={() => onStatus(meeting.id, 'realizada')} className="px-2.5 py-1.5 rounded text-[11px] bg-green-500/10 text-green-300 hover:bg-green-500/15 transition-colors">
          Realizada
        </button>
        <button onClick={() => onStatus(meeting.id, 'follow_up')} className="px-2.5 py-1.5 rounded text-[11px] bg-[#CE7028]/10 text-[#FF882D] hover:bg-[#CE7028]/20 transition-colors">
          Follow-up
        </button>
        <button onClick={() => onStatus(meeting.id, 'noshow')} className="px-2.5 py-1.5 rounded text-[11px] bg-red-500/10 text-red-300 hover:bg-red-500/15 transition-colors">
          No-show
        </button>
      </div>
    </div>
  )
}

function MeetingModal({ meeting, selectedDate, leads, members, onClose, onSave }) {
  const [error, setError] = useState('')
  const [responsibleOpen, setResponsibleOpen] = useState(false)
  const [responsibleSearch, setResponsibleSearch] = useState('')
  const [form, setForm] = useState(() => ({
    titulo: '',
    empresa: '',
    contato: '',
    tipo: 'diagnostico',
    data: selectedDate,
    horaInicio: '09:00',
    horaFim: '10:00',
    status: 'agendada',
    canal: 'Google Meet',
    prioridade: 'media',
    valorEstimado: '',
    pauta: '',
    proximoPasso: '',
    observacoes: '',
    ...(meeting || {}),
    leadId: meeting?.leadId || '',
    responsavelIds: getResponsibleIds(meeting),
  }))

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))
  const responsibleIds = getResponsibleIds(form)
  const selectedResponsibles = responsibleIds
    .map(id => members.find(member => idsEqual(member.id, id)))
    .filter(Boolean)
  const filteredResponsibles = members.filter(member => {
    const term = responsibleSearch.trim().toLowerCase()
    return !term || [member.nome, member.cargo, member.setor].some(value => `${value || ''}`.toLowerCase().includes(term))
  })

  const toggleResponsible = memberId => {
    setForm(prev => {
      const id = String(memberId)
      const current = getResponsibleIds(prev)
      const next = current.some(item => idsEqual(item, id))
        ? current.filter(item => !idsEqual(item, id))
        : [...current, id]
      return { ...prev, responsavelIds: next }
    })
  }

  const selectLead = (leadId) => {
    const lead = leads.find(item => String(item.id) === String(leadId))
    setForm(prev => ({
      ...prev,
      leadId,
      empresa: lead?.company || prev.empresa,
      contato: lead?.contact || prev.contato,
      valorEstimado: lead?.value || prev.valorEstimado,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = onSave({
      ...form,
      leadId: form.leadId || null,
      responsavelIds: getResponsibleIds(form),
      responsavelId: getResponsibleIds(form)[0] || null,
      valorEstimado: Number(form.valorEstimado || 0),
    })
    if (result?.success === false) return setError(result.error)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-[#1E1E1E] rounded-md w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[#111111] z-10 flex items-center justify-between px-6 py-4 border-b border-[#1E1E1E]">
          <div>
            <h3 className="text-white font-bold">{meeting?.id ? 'Editar reunião' : 'Nova reunião'}</h3>
            <p className="text-gray-600 text-xs mt-0.5">Organize agenda, status e próximos passos comerciais.</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <div className="bg-red-950/40 border border-red-900/40 text-red-300 text-sm rounded px-3 py-2">{error}</div>}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Lead vinculado</label>
              <select value={form.leadId} onChange={e => selectLead(e.target.value)} className={INPUT}>
                <option value="">Sem vínculo com lead</option>
                {leads.map(lead => <option key={lead.id} value={lead.id}>{lead.company}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Responsáveis</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setResponsibleOpen(value => !value)}
                  className={`${INPUT} min-h-[50px] flex items-center justify-between gap-3 text-left`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Users className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <span className={`truncate ${selectedResponsibles.length ? 'text-white' : 'text-gray-600'}`}>
                      {selectedResponsibles.length
                        ? selectedResponsibles.map(member => member.nome).join(', ')
                        : 'Selecionar responsáveis'}
                    </span>
                  </div>
                  <span className="bg-[#CE7028]/15 text-[#FF882D] border border-[#CE7028]/25 px-2 py-0.5 rounded text-[11px] font-bold flex-shrink-0">
                    {selectedResponsibles.length}
                  </span>
                </button>

                {responsibleOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-[#111111] border border-[#1E1E1E] rounded-md shadow-2xl overflow-hidden">
                    <div className="p-2 border-b border-[#1E1E1E]">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                        <input
                          value={responsibleSearch}
                          onChange={e => setResponsibleSearch(e.target.value)}
                          className={`${INPUT} pl-8 py-2 text-xs`}
                          placeholder="Buscar por nome, cargo ou setor"
                        />
                      </div>
                    </div>
                    <div className="max-h-[190px] overflow-y-auto p-1">
                      {filteredResponsibles.map(member => {
                        const checked = responsibleIds.some(id => idsEqual(id, member.id))
                        return (
                          <button
                            type="button"
                            key={member.id}
                            onClick={() => toggleResponsible(member.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-colors ${checked ? 'bg-[#CE7028]/12' : 'hover:bg-white/5'}`}
                          >
                            <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${checked ? 'bg-[#CE7028] border-[#CE7028]' : 'border-[#3A3A3A]'}`}>
                              {checked && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className={`block text-sm font-semibold truncate ${checked ? 'text-white' : 'text-gray-300'}`}>{member.nome}</span>
                              <span className="block text-[11px] text-gray-600 truncate">{member.cargo}</span>
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {selectedResponsibles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedResponsibles.slice(0, 3).map(member => (
                    <span key={member.id} className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#CE7028]/10 border border-[#CE7028]/20 text-[#FF882D] text-[11px] font-semibold">
                      {member.nome.split(' ')[0]}
                      <button type="button" onClick={() => toggleResponsible(member.id)} className="hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {selectedResponsibles.length > 3 && (
                    <span className="px-2 py-1 rounded bg-[#1A1A1A] text-gray-500 text-[11px] font-semibold">
                      +{selectedResponsibles.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Empresa *</label>
              <input value={form.empresa} onChange={e => set('empresa', e.target.value)} required className={INPUT} placeholder="Ex: Grupo Alpha" />
            </div>
            <div>
              <label className={LABEL}>Contato</label>
              <input value={form.contato} onChange={e => set('contato', e.target.value)} className={INPUT} placeholder="Nome do contato" />
            </div>
          </div>

          <div>
            <label className={LABEL}>Título da reunião</label>
            <input value={form.titulo} onChange={e => set('titulo', e.target.value)} className={INPUT} placeholder="Ex: Diagnóstico inicial" />
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className={LABEL}>Data *</label>
              <input type="date" value={form.data} onChange={e => set('data', e.target.value)} required className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Início</label>
              <input type="time" value={form.horaInicio} onChange={e => set('horaInicio', e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Fim</label>
              <input type="time" value={form.horaFim} onChange={e => set('horaFim', e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Valor estimado</label>
              <input type="number" value={form.valorEstimado} onChange={e => set('valorEstimado', e.target.value)} className={INPUT} placeholder="0" />
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className={LABEL}>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className={INPUT}>
                {Object.entries(STATUS).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Tipo</label>
              <select value={form.tipo} onChange={e => set('tipo', e.target.value)} className={INPUT}>
                {TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Canal</label>
              <select value={form.canal} onChange={e => set('canal', e.target.value)} className={INPUT}>
                {CHANNELS.map(channel => <option key={channel.value} value={channel.value}>{channel.label}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Prioridade</label>
              <select value={form.prioridade} onChange={e => set('prioridade', e.target.value)} className={INPUT}>
                {Object.entries(PRIORITIES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={LABEL}>Pauta</label>
            <textarea value={form.pauta} onChange={e => set('pauta', e.target.value)} rows={3} className={INPUT} placeholder="O que precisa ser tratado na reunião?" />
          </div>

          <div>
            <label className={LABEL}>Próximo passo</label>
            <input value={form.proximoPasso} onChange={e => set('proximoPasso', e.target.value)} className={INPUT} placeholder="Ex: enviar proposta, reagendar, fazer follow-up..." />
          </div>

          <div>
            <label className={LABEL}>Observações</label>
            <textarea value={form.observacoes} onChange={e => set('observacoes', e.target.value)} rows={3} className={INPUT} placeholder="Detalhes importantes, objeções, contexto do cliente..." />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#1E1E1E]">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded bg-[#1A1A1A] text-gray-400 hover:text-white transition-colors">Cancelar</button>
            <button type="submit" className="px-5 py-2.5 rounded bg-[#CE7028] hover:bg-[#B5611F] text-white font-semibold transition-colors">
              Salvar reunião
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CalendarioComercial() {
  const { user } = useAuth()
  const {
    commercial,
    leads,
    meetings,
    members,
    addMeeting,
    updateMeeting,
    deleteMeeting,
  } = useData()

  const today = todayISO()
  const [monthDate, setMonthDate] = useState(() => toDate(today))
  const [selectedDate, setSelectedDate] = useState(today)
  const [statusFilter, setStatusFilter] = useState('todos')
  const [query, setQuery] = useState('')
  const [modalMeeting, setModalMeeting] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const normalizedMeetings = useMemo(
    () => meetings.map(meeting => normalizeMeeting(meeting, leads, members, commercial)),
    [commercial, leads, meetings, members],
  )

  const filteredMeetings = useMemo(() => {
    const term = query.trim().toLowerCase()
    return normalizedMeetings
      .filter(meeting => statusFilter === 'todos' || meeting.status === statusFilter)
      .filter(meeting => !term || [meeting.empresa, meeting.contato, meeting.titulo, meeting.pauta, meeting.proximoPasso].some(value => `${value || ''}`.toLowerCase().includes(term)))
      .sort((a, b) => `${a.data} ${a.horaInicio || ''}`.localeCompare(`${b.data} ${b.horaInicio || ''}`))
  }, [normalizedMeetings, query, statusFilter])

  const meetingsByDate = useMemo(() => filteredMeetings.reduce((acc, meeting) => {
    if (!acc[meeting.data]) acc[meeting.data] = []
    acc[meeting.data].push(meeting)
    return acc
  }, {}), [filteredMeetings])

  const monthMeetings = useMemo(() => {
    const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`
    return filteredMeetings.filter(meeting => meeting.data?.startsWith(monthKey))
  }, [filteredMeetings, monthDate])

  const selectedMeetings = meetingsByDate[selectedDate] || []
  const days = useMemo(() => buildCalendarDays(monthDate), [monthDate])

  const stats = {
    total: monthMeetings.length,
    agendadas: monthMeetings.filter(m => m.status === 'agendada').length,
    realizadas: monthMeetings.filter(m => m.status === 'realizada').length,
    followUps: monthMeetings.filter(m => m.status === 'follow_up').length,
    noShows: monthMeetings.filter(m => m.status === 'noshow').length,
  }

  const openNew = (date = selectedDate) => {
    setModalMeeting(null)
    setSelectedDate(date)
    setShowModal(true)
  }

  const openEdit = meeting => {
    setModalMeeting(meeting)
    setShowModal(true)
  }

  const saveMeeting = data => (
    modalMeeting?.id ? updateMeeting(modalMeeting.id, data) : addMeeting({
      ...data,
      responsavelIds: data.responsavelIds?.length ? data.responsavelIds : [user?.id].filter(Boolean),
      responsavelId: data.responsavelIds?.[0] || user?.id,
    })
  )

  const removeMeeting = id => {
    if (window.confirm('Remover esta reunião do calendário?')) deleteMeeting(id)
  }

  const changeMonth = offset => {
    setMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1))
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#FF882D] mb-2">
            <CalendarDays className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Agenda Comercial</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Calendário de Reuniões</h1>
          <p className="text-gray-500 text-sm mt-1">Controle diagnósticos, propostas, follow-ups e no-shows por data.</p>
        </div>
        <button onClick={() => openNew()} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-[#CE7028] hover:bg-[#B5611F] text-white font-semibold text-sm transition-colors">
          <Plus className="w-4 h-4" /> Nova reunião
        </button>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard label="Reuniões no mês" value={stats.total} accent="#CE7028" helper="Total filtrado" />
        <StatCard label="Agendadas" value={stats.agendadas} accent="#60A5FA" helper="Ainda vão acontecer" />
        <StatCard label="Realizadas" value={stats.realizadas} accent="#4ADE80" helper="Compareceram" />
        <StatCard label="Follow-up" value={stats.followUps} accent="#FF882D" helper="Retorno pendente" />
        <StatCard label="No-shows" value={stats.noShows} accent="#F87171" helper="Não compareceram" />
      </div>

      <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-4">
        <div className="flex flex-col xl:flex-row xl:items-center gap-3 xl:justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => changeMonth(-1)} className="w-9 h-9 rounded border border-[#1E1E1E] text-gray-500 hover:text-white hover:border-[#CE7028] transition-colors flex items-center justify-center">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="min-w-[190px] text-center">
              <p className="text-white font-bold capitalize">{monthLabel(monthDate)}</p>
              <button onClick={() => { setMonthDate(toDate(today)); setSelectedDate(today) }} className="text-[11px] text-[#FF882D] hover:text-[#CE7028] font-semibold">
                Ir para hoje
              </button>
            </div>
            <button onClick={() => changeMonth(1)} className="w-9 h-9 rounded border border-[#1E1E1E] text-gray-500 hover:text-white hover:border-[#CE7028] transition-colors flex items-center justify-center">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <input value={query} onChange={e => setQuery(e.target.value)} className={`${INPUT} pl-9`} placeholder="Buscar empresa, contato ou pauta..." />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={`${INPUT} md:w-44`}>
              <option value="todos">Todos os status</option>
              {Object.entries(STATUS).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-[1fr_420px] gap-5 items-start">
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-md overflow-hidden">
          <div className="grid grid-cols-7 border-b border-[#1E1E1E] bg-[#0D0D0D]">
            {WEEK_DAYS.map(day => (
              <div key={day} className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-gray-600">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map(day => {
              const dayMeetings = meetingsByDate[day.iso] || []
              const selected = selectedDate === day.iso
              const isToday = today === day.iso
              return (
                <button
                  key={day.iso}
                  onClick={() => setSelectedDate(day.iso)}
                  onDoubleClick={() => openNew(day.iso)}
                  className={`min-h-[132px] border-r border-b border-[#1E1E1E] p-2 text-left transition-colors hover:bg-[#161616] ${selected ? 'bg-[#CE7028]/10 ring-1 ring-inset ring-[#CE7028]/45' : ''} ${!day.inMonth ? 'opacity-35' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${isToday ? 'bg-[#CE7028] text-white' : selected ? 'text-white' : 'text-gray-500'}`}>
                      {day.number}
                    </span>
                    {dayMeetings.length > 0 && <span className="text-[10px] text-gray-600 font-semibold">{dayMeetings.length}</span>}
                  </div>
                  <div className="space-y-1">
                    {dayMeetings.slice(0, 3).map(meeting => (
                      <div key={meeting.id} className={`truncate rounded border px-1.5 py-1 text-[10px] font-semibold ${STATUS[meeting.status]?.day || STATUS.agendada.day}`}>
                        {meeting.horaInicio && `${meeting.horaInicio} · `}{meeting.empresa}
                      </div>
                    ))}
                    {dayMeetings.length > 3 && (
                      <div className="text-[10px] text-gray-600 font-semibold px-1">+{dayMeetings.length - 3} reunião(ões)</div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <aside className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5 sticky top-20">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wider font-bold">Dia selecionado</p>
              <h2 className="text-white text-lg font-bold capitalize mt-1">{fmtDate(selectedDate)}</h2>
              <p className="text-gray-500 text-sm mt-1">{selectedMeetings.length} reunião(ões)</p>
            </div>
            <button onClick={() => openNew(selectedDate)} className="p-2 rounded bg-[#CE7028]/10 text-[#FF882D] hover:bg-[#CE7028]/20 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {selectedMeetings.length === 0 ? (
            <div className="border border-dashed border-[#2A2A2A] rounded-md p-6 text-center">
              <ClipboardList className="w-8 h-8 text-gray-700 mx-auto mb-3" />
              <p className="text-white font-semibold text-sm">Nenhuma reunião neste dia</p>
              <p className="text-gray-600 text-xs mt-1">Clique em “Nova reunião” para organizar a agenda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedMeetings.map(meeting => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onEdit={openEdit}
                  onDelete={removeMeeting}
                  onStatus={(id, status) => updateMeeting(id, { status })}
                />
              ))}
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-[#1E1E1E]">
            <div className="flex items-start gap-2 text-xs text-gray-600">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 text-[#CE7028]" />
              <span>Duplo clique em um dia do calendário também cria uma reunião naquela data.</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-gray-600 mt-2">
              <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-green-500" />
              <span>Use os botões rápidos dos cards para atualizar status sem abrir o formulário.</span>
            </div>
          </div>
        </aside>
      </div>

      {showModal && (
        <MeetingModal
          meeting={modalMeeting}
          selectedDate={selectedDate}
          leads={leads}
          members={members}
          onClose={() => setShowModal(false)}
          onSave={saveMeeting}
        />
      )}
    </div>
  )
}


