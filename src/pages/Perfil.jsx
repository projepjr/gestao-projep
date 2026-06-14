import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import {
  Camera, Mail, Phone, Calendar, Star, Pin, Bell, Lock,
  CheckCircle, Clock, AlertCircle, TrendingUp, Briefcase,
  MessageSquare, Megaphone, ChevronLeft, Save, Eye, EyeOff,
  ToggleLeft, ToggleRight, Target, X, Pencil, Check,
} from 'lucide-react'

// ─── Default data ──────────────────────────────────────────

const ROLE_LABEL = { comercial: 'Comercial', gp: 'Gestão de Pessoas', presidente: 'Presidência' }
const ROLE_DEPT  = { comercial: 'Comercial', gp: 'Gestão de Pessoas', presidente: 'Diretoria'  }

const DEFAULT_FEEDBACKS = [
  {
    id: 1, from: 'Daniela Rocha', role: 'Dir. de Gestão de Pessoas', avatar: 'DR',
    date: '2026-06-10', stars: 5,
    text: 'Excelente desempenho este mês! Demonstrou proatividade nas prospecções e entregou resultados acima da meta. Continua no caminho certo para assumir papéis de liderança na equipe.',
  },
  {
    id: 2, from: 'Felipe Daniel', role: 'Presidente', avatar: 'FD',
    date: '2026-05-28', stars: 4,
    text: 'Ótimo trabalho na apresentação para o cliente TechStart. A proposta foi bem estruturada e o follow-up foi exemplar. Sugiro desenvolver ainda mais as habilidades de negociação avançada.',
  },
  {
    id: 3, from: 'Daniela Rocha', role: 'Dir. de Gestão de Pessoas', avatar: 'DR',
    date: '2026-05-05', stars: 4,
    text: 'Participação ativa nas reuniões de equipe. Bom engajamento com os novos processos do CRM. Pode melhorar o tempo de resposta nos follow-ups pendentes — disciplina é diferencial.',
  },
]

function getDefaultProfile() {
  return {
    photo: null,
    email: null,
    whatsapp: '(11) 99999-0000',
    joinDate: '2025-03-01',
    performance: {
      grade: 9.2,
      gradeHistory: [
        { month: 'Jan', grade: 7.2 }, { month: 'Fev', grade: 7.8 },
        { month: 'Mar', grade: 8.1 }, { month: 'Abr', grade: 8.5 },
        { month: 'Mai', grade: 8.9 }, { month: 'Jun', grade: 9.2 },
      ],
      goalsCompleted: 7,
      goalsTotal: 10,
    },
    projects: [
      { id: 1, name: 'Consultoria TechStart',  company: 'TechStart Ltda',  status: 'ativo',    role: 'Consultor Principal' },
      { id: 2, name: 'Transformação Digital',   company: 'Omega Digital',   status: 'ativo',    role: 'Analista'           },
      { id: 3, name: 'Pesquisa de Mercado',     company: 'Beta Solutions',  status: 'concluido',role: 'Pesquisador'        },
    ],
    tasks: [
      { id: 1, title: 'Enviar proposta para Delta Corp',         status: 'concluida',   due: '2026-06-10' },
      { id: 2, title: 'Reunião de alinhamento com TechStart',    status: 'em_andamento',due: '2026-06-14' },
      { id: 3, title: 'Elaborar relatório mensal de vendas',     status: 'pendente',    due: '2026-06-20' },
      { id: 4, title: 'Atualizar CRM com leads da semana',       status: 'pendente',    due: '2026-06-15' },
    ],
    communications: [
      { id: 1, type: 'pinned',  from: 'Diretoria',     avatar: 'DI', title: 'Planejamento Semestral 2026', body: 'A reunião de planejamento do segundo semestre será na sexta-feira, dia 20/06 às 18h. Presença obrigatória para todos os diretores.', date: '2026-06-12' },
      { id: 2, type: 'pinned',  from: 'Diretoria',     avatar: 'DI', title: 'Meta de receita — Junho',     body: 'A meta de receita para junho é R$ 80.000. Estamos em 73% do objetivo. Foco total nos fechamentos desta semana!',                   date: '2026-06-10' },
      { id: 3, type: 'message', from: 'Daniela Rocha', avatar: 'DR', title: 'Avaliação de desempenho',     body: 'Oi! Sua avaliação do mês foi ótima. Parabéns pelo resultado no pipeline. Vamos conversar na próxima semana.',                        date: '2026-06-11' },
      { id: 4, type: 'notice',  from: 'Sistema',       avatar: 'SY', title: 'Novo contrato cadastrado',    body: 'O contrato com Nexus Tech foi registrado com sucesso no sistema.',                                                                   date: '2026-06-09' },
    ],
    settings: {
      notifications: { email: true, system: true, whatsapp: false, weekly_report: true },
    },
  }
}

function loadProfile(userId) {
  try {
    const raw = localStorage.getItem(`ej_profile_${userId}`)
    return raw ? { ...getDefaultProfile(), ...JSON.parse(raw) } : getDefaultProfile()
  } catch { return getDefaultProfile() }
}

function saveProfile(userId, data) {
  localStorage.setItem(`ej_profile_${userId}`, JSON.stringify(data))
}

// ─── Line Chart ────────────────────────────────────────────

function LineChart({ data }) {
  const W = 400, H = 80, PX = 24, PY = 10
  const maxG = 10
  const pts = data.map((d, i) => ({
    x: PX + (i / (data.length - 1)) * (W - PX * 2),
    y: PY + (1 - d.grade / maxG) * (H - PY * 2),
    ...d,
  }))
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L ${pts[pts.length - 1].x},${H} L ${pts[0].x},${H} Z`
  return (
    <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CE7028" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#CE7028" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[2, 4, 6, 8, 10].map(v => {
        const y = PY + (1 - v / maxG) * (H - PY * 2)
        return (
          <g key={v}>
            <line x1={PX} y1={y} x2={W - PX} y2={y} stroke="#1E1E1E" strokeWidth="1" />
            <text x={PX - 6} y={y + 3.5} textAnchor="end" fill="#4B5563" fontSize="8">{v}</text>
          </g>
        )
      })}
      <path d={areaPath} fill="url(#cg)" />
      <path d={linePath} stroke="#CE7028" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="#CE7028" />
          <circle cx={p.x} cy={p.y} r="6" fill="#CE7028" fillOpacity="0.15" />
          <text x={p.x} y={H + 15} textAnchor="middle" fill="#6B7280" fontSize="9">{p.month}</text>
        </g>
      ))}
    </svg>
  )
}

// ─── Star Rating ───────────────────────────────────────────

function StarRating({ grade }) {
  const filled = Math.round(grade)
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 10 }, (_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < filled ? 'text-[#CE7028] fill-[#CE7028]' : 'text-[#2A2A2A]'}`} />
      ))}
      <span className="ml-2 text-white font-bold text-lg tabular-nums">{grade.toFixed(1)}</span>
      <span className="text-gray-600 text-sm">/10</span>
    </div>
  )
}

// ─── Photo Crop Modal ──────────────────────────────────────

function PhotoCropModal({ src, onSave, onClose }) {
  const [offset, setOffset]   = useState({ x: 0, y: 0 })
  const [zoom, setZoom]       = useState(1)
  const [naturalSz, setNaturalSz] = useState({ w: 0, h: 0 })
  const [dragging, setDragging]   = useState(false)
  const imgRef    = useRef(null)
  const dragStart = useRef(null)

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging || !dragStart.current) return
      setOffset({
        x: dragStart.current.ox + e.clientX - dragStart.current.sx,
        y: dragStart.current.oy + e.clientY - dragStart.current.sy,
      })
    }
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [dragging])

  const handleMouseDown = (e) => {
    e.preventDefault()
    setDragging(true)
    dragStart.current = { sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y }
  }

  const handleSave = () => {
    const SIZE = 256
    const CONT = 200
    const canvas = document.createElement('canvas')
    canvas.width  = SIZE
    canvas.height = SIZE
    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2)
    ctx.clip()

    const img = new Image()
    img.onload = () => {
      const coverScale = Math.max(CONT / img.naturalWidth, CONT / img.naturalHeight)
      const ratio = SIZE / CONT
      const dw = img.naturalWidth  * coverScale * zoom * ratio
      const dh = img.naturalHeight * coverScale * zoom * ratio
      const dx = SIZE / 2 - dw / 2 + offset.x * ratio
      const dy = SIZE / 2 - dh / 2 + offset.y * ratio
      ctx.drawImage(img, dx, dy, dw, dh)
      onSave(canvas.toDataURL('image/jpeg', 0.9))
    }
    img.src = src
  }

  const coverScale = naturalSz.w
    ? Math.max(200 / naturalSz.w, 200 / naturalSz.h)
    : 1

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-[#1E1E1E] rounded-md w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E1E1E]">
          <h3 className="text-white font-semibold text-sm">Editar Foto de Perfil</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6">
          {/* Circular viewport */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div
              className="relative overflow-hidden border-2 border-[#CE7028]"
              style={{ width: 200, height: 200, borderRadius: '50%', cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}
              onMouseDown={handleMouseDown}
            >
              <img
                ref={imgRef}
                src={src}
                alt="Crop preview"
                draggable={false}
                onLoad={e => setNaturalSz({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
                style={{
                  position: 'absolute',
                  left: '50%', top: '50%',
                  width: naturalSz.w ? naturalSz.w * coverScale : '100%',
                  height: naturalSz.h ? naturalSz.h * coverScale : '100%',
                  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  transformOrigin: 'center center',
                  pointerEvents: 'none',
                  maxWidth: 'none',
                }}
              />
            </div>
            <p className="text-gray-600 text-xs">Arraste para reposicionar</p>
          </div>

          {/* Zoom slider */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Zoom</label>
              <span className="text-xs text-gray-500 tabular-nums">{zoom.toFixed(2)}×</span>
            </div>
            <input
              type="range" min="1" max="3" step="0.05" value={zoom}
              onChange={e => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 rounded appearance-none cursor-pointer accent-[#CE7028]"
            />
          </div>

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded border border-[#1E1E1E] text-gray-500 hover:text-white text-sm transition-all">Cancelar</button>
            <button onClick={handleSave} className="flex-1 py-2.5 rounded bg-[#CE7028] hover:bg-[#B5611F] text-white font-semibold text-sm transition-colors">Salvar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Inline field editor ───────────────────────────────────

function EditableField({ icon: Icon, label, value, onSave, type = 'text', readOnly = false }) {
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState(value)

  const commit = () => { onSave(draft); setEditing(false) }
  const cancel = () => { setDraft(value); setEditing(false) }

  return (
    <div className="flex items-center gap-2 group/field">
      <Icon className="w-4 h-4 text-gray-600 flex-shrink-0" />
      {editing ? (
        <div className="flex items-center gap-1.5 flex-1">
          <input
            type={type}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel() }}
            autoFocus
            className="flex-1 bg-[#0D0D0D] border border-[#CE7028] rounded px-2 py-1 text-white text-xs focus:outline-none"
          />
          <button onClick={commit} className="p-1 text-green-400 hover:text-green-300 transition-colors"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={cancel} className="p-1 text-gray-600 hover:text-gray-300 transition-colors"><X className="w-3.5 h-3.5" /></button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="text-gray-400 text-xs truncate flex-1">{value || <span className="text-gray-600 italic">Não informado</span>}</span>
          {!readOnly && (
            <button
              onClick={() => { setDraft(value); setEditing(true) }}
              className="p-1 text-gray-700 hover:text-[#CE7028] opacity-0 group-hover/field:opacity-100 transition-all"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Password Modal ────────────────────────────────────────

function PasswordModal({ onClose }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [show, setShow] = useState(false)
  const [msg,  setMsg]  = useState(null)
  const FIELD = "w-full bg-[#0D0D0D] border border-[#1E1E1E] rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#CE7028] transition-colors"

  const handleSubmit = (e) => {
    e.preventDefault()
    if (form.next !== form.confirm) { setMsg({ type: 'error', text: 'As senhas não coincidem' }); return }
    if (form.next.length < 6)       { setMsg({ type: 'error', text: 'Mínimo de 6 caracteres' });  return }
    setMsg({ type: 'success', text: 'Senha alterada com sucesso!' })
    setTimeout(onClose, 1200)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-[#1E1E1E] rounded-md w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E1E1E]">
          <h3 className="text-white font-semibold text-sm">Alterar Senha</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {[['current','Senha Atual'],['next','Nova Senha'],['confirm','Confirmar Nova Senha']].map(([k, lbl], i) => (
            <div key={k}>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">{lbl}</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} className={FIELD} required />
                {i === 0 && (
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300">
                    {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          ))}
          {msg && <p className={`text-xs px-3 py-2 rounded border ${msg.type === 'error' ? 'bg-red-950/40 border-red-900/40 text-red-400' : 'bg-green-950/40 border-green-900/40 text-green-400'}`}>{msg.text}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded border border-[#1E1E1E] text-gray-500 hover:text-white text-sm transition-all">Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 rounded bg-[#CE7028] hover:bg-[#B5611F] text-white font-semibold text-sm transition-colors">Alterar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const TASK_STATUS = {
  concluida:     { label: 'Concluída',    icon: CheckCircle, cls: 'text-green-400 bg-green-950/40 border-green-900/40'    },
  em_andamento:  { label: 'Em andamento', icon: Clock,       cls: 'text-[#FF882D] bg-[#CE7028]/10 border-[#CE7028]/20'    },
  pendente:      { label: 'Pendente',     icon: AlertCircle, cls: 'text-gray-400  bg-[#1A1A1A]    border-[#1E1E1E]'       },
}
const PROJECT_STATUS = {
  ativo:    'bg-green-950/40 text-green-400 border-green-900/30',
  concluido:'bg-blue-950/30  text-blue-400  border-blue-900/30',
  pausado:  'bg-yellow-950/30 text-yellow-400 border-yellow-900/30',
}

// ─── Main ──────────────────────────────────────────────────

export default function Perfil() {
  const { user, updateUserPhoto, updateCurrentUser } = useAuth()
  const { members, updateMember } = useData()
  const navigate = useNavigate()
  const fileRef  = useRef()

  const [editingName, setEditingName] = useState(false)
  const [nameDraft,   setNameDraft]   = useState('')

  const saveNameEdit = () => {
    const trimmed = nameDraft.trim()
    if (!trimmed) { setEditingName(false); return }
    updateCurrentUser({ name: trimmed })
    const member = members.find(m => m.id === user?.id)
    if (member) updateMember(member.id, { name: trimmed })
    setEditingName(false)
  }

  const [profile,          setProfile]          = useState(() => loadProfile(user?.id))
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [cropSrc,           setCropSrc]           = useState(null)
  const [saved,             setSaved]             = useState(false)

  const update = (key, value) => {
    setProfile(prev => {
      const next = { ...prev, [key]: value }
      saveProfile(user?.id, next)
      return next
    })
  }

  const updateNested = (path, value) => {
    setProfile(prev => {
      const keys = path.split('.')
      const next = { ...prev }
      let ref = next
      keys.slice(0, -1).forEach(k => { ref[k] = { ...ref[k] }; ref = ref[k] })
      ref[keys[keys.length - 1]] = value
      saveProfile(user?.id, next)
      return next
    })
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setCropSrc(ev.target.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleCropSave = (croppedPhoto) => {
    update('photo', croppedPhoto)
    updateUserPhoto(croppedPhoto)
    setCropSrc(null)
  }

  const handleSave = () => {
    saveProfile(user?.id, profile)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const dept      = ROLE_DEPT[user?.role]  || user?.role
  const roleLabel = ROLE_LABEL[user?.role] || user?.role
  const { performance, projects, tasks, communications, settings } = profile

  const pinnedComms = communications.filter(c => c.type === 'pinned')
  const messages    = communications.filter(c => c.type === 'message')
  const notices     = communications.filter(c => c.type === 'notice')
  const goalsPercent = performance.goalsTotal > 0
    ? Math.round((performance.goalsCompleted / performance.goalsTotal) * 100) : 0

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded text-gray-500 hover:text-white hover:bg-[#1E1E1E] transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Meu Perfil</h1>
            <p className="text-gray-500 text-sm mt-0.5">Informações pessoais e configurações</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2.5 rounded text-sm font-semibold transition-all ${saved ? 'bg-green-700 text-white' : 'bg-[#CE7028] hover:bg-[#B5611F] text-white'}`}
        >
          <Save className="w-4 h-4" />{saved ? 'Salvo!' : 'Salvar'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── LEFT COLUMN ─────────────────────── */}
        <div className="xl:col-span-1 space-y-4">

          {/* Header card */}
          <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-6">
            {/* Photo */}
            <div className="flex flex-col items-center mb-5">
              <div
                className="relative w-24 h-24 rounded-full cursor-pointer group"
                onClick={() => fileRef.current?.click()}
              >
                {profile.photo ? (
                  <img src={profile.photo} alt="Foto" className="w-full h-full object-cover rounded-full border-2 border-[#CE7028]" />
                ) : (
                  <div className="w-full h-full bg-[#CE7028] rounded-full border-2 border-[#CE7028] flex items-center justify-center text-white text-3xl font-bold">
                    {user?.avatar}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <p className="text-xs text-gray-600 mt-2">Clique para alterar</p>
            </div>

            <div className="text-center mb-5">
              {editingName ? (
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <input
                    value={nameDraft}
                    onChange={e => setNameDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveNameEdit(); if (e.key === 'Escape') setEditingName(false) }}
                    autoFocus
                    className="bg-[#0D0D0D] border border-[#CE7028] rounded px-2 py-1 text-white text-center font-bold text-base focus:outline-none w-44"
                  />
                  <button onClick={saveNameEdit} className="p-1 text-green-400 hover:text-green-300"><Check className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setEditingName(false)} className="p-1 text-gray-600 hover:text-gray-300"><X className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <div
                  className="flex items-center justify-center gap-1.5 mb-1 cursor-pointer group/name"
                  onClick={() => { setNameDraft(user?.name || ''); setEditingName(true) }}
                >
                  <h2 className="text-white font-bold text-lg">{user?.name}</h2>
                  <Pencil className="w-3 h-3 text-gray-700 opacity-0 group-hover/name:opacity-100 transition-opacity" />
                </div>
              )}
              <p className="text-[#FF882D] text-sm font-medium">{roleLabel}</p>
              <p className="text-gray-500 text-xs mt-0.5">{dept}</p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-4 h-4 text-gray-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-0.5">Membro desde</p>
                  <input type="date" value={profile.joinDate} onChange={e => update('joinDate', e.target.value)}
                    className="bg-transparent text-gray-300 text-xs focus:outline-none w-full" />
                </div>
              </div>

              <EditableField
                icon={Mail} label="Email"
                value={profile.email || user?.email}
                onSave={val => update('email', val)}
                type="email"
              />

              <EditableField
                icon={Phone} label="WhatsApp"
                value={profile.whatsapp}
                onSave={val => update('whatsapp', val)}
                type="tel"
              />
            </div>
          </div>

          {/* Settings */}
          <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-500" /> Notificações
            </h3>
            <div className="space-y-3">
              {[
                { key: 'email',        label: 'Alertas por Email'       },
                { key: 'system',       label: 'Notificações do Sistema' },
                { key: 'whatsapp',     label: 'Mensagens via WhatsApp'  },
                { key: 'weekly_report',label: 'Relatório Semanal'       },
              ].map(({ key, label }) => {
                const on = settings.notifications[key]
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">{label}</span>
                    <button onClick={() => updateNested(`settings.notifications.${key}`, !on)}
                      className={`transition-colors ${on ? 'text-[#CE7028]' : 'text-gray-700'}`}>
                      {on ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                  </div>
                )
              })}
            </div>
            <button onClick={() => setShowPasswordModal(true)}
              className="w-full mt-4 flex items-center justify-center gap-2 px-3 py-2.5 rounded border border-[#1E1E1E] text-gray-400 hover:text-white hover:border-[#2A2A2A] text-sm transition-all">
              <Lock className="w-4 h-4" /> Alterar Senha
            </button>
          </div>
        </div>

        {/* ── RIGHT COLUMN ─────────────────────── */}
        <div className="xl:col-span-2 space-y-4">

          {/* Performance */}
          <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-6">
            <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#CE7028]" /> Desempenho
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Nota Geral (GP)</p>
                <StarRating grade={performance.grade} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">
                  Metas — {performance.goalsCompleted}/{performance.goalsTotal} ({goalsPercent}%)
                </p>
                <div className="h-2 bg-[#1E1E1E] rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-[#CE7028] transition-all duration-700 rounded-full" style={{ width: `${goalsPercent}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-1.5">
                  <span>{performance.goalsCompleted} concluídas</span>
                  <span>{performance.goalsTotal - performance.goalsCompleted} pendentes</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Evolução — Últimos 6 meses</p>
              <div className="bg-[#0D0D0D] border border-[#1E1E1E] rounded p-4">
                <LineChart data={performance.gradeHistory} />
              </div>
            </div>

            {/* Feedbacks */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Feedbacks Recebidos
              </p>
              <div className="space-y-3">
                {DEFAULT_FEEDBACKS.map(fb => (
                  <div key={fb.id} className="p-4 bg-[#0D0D0D] border border-[#1E1E1E] rounded hover:border-[#CE7028]/20 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#CE7028]/20 border border-[#CE7028]/30 flex items-center justify-center text-[#CE7028] text-xs font-bold flex-shrink-0">
                          {fb.avatar}
                        </div>
                        <div>
                          <p className="text-white text-xs font-semibold">{fb.from}</p>
                          <p className="text-gray-600 text-[10px]">{fb.role}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < fb.stars ? 'text-[#CE7028] fill-[#CE7028]' : 'text-[#2A2A2A]'}`} />
                          ))}
                        </div>
                        <span className="text-gray-600 text-[10px]">
                          {new Date(fb.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">{fb.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Projects & Tasks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5">
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-500" /> Projetos
              </h3>
              <div className="space-y-3">
                {projects.map(p => (
                  <div key={p.id} className="p-3 bg-[#0D0D0D] border border-[#1E1E1E] rounded hover:border-[#CE7028]/20 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-white text-xs font-semibold truncate">{p.name}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold flex-shrink-0 ${PROJECT_STATUS[p.status] || 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                        {p.status === 'ativo' ? 'Ativo' : p.status === 'concluido' ? 'Concluído' : 'Pausado'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs">{p.company}</p>
                    <p className="text-[#FF882D] text-xs mt-1">{p.role}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5">
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-500" /> Tarefas Recentes
              </h3>
              <div className="space-y-2">
                {tasks.map(t => {
                  const s = TASK_STATUS[t.status]
                  const StatusIcon = s.icon
                  return (
                    <div key={t.id} className={`flex items-start gap-2.5 p-2.5 rounded border text-xs ${s.cls}`}>
                      <StatusIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{t.title}</p>
                        <p className="opacity-60 text-[10px] mt-0.5">Prazo: {new Date(t.due + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Communications */}
          <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-500" /> Comunicados
            </h3>
            {pinnedComms.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                  <Pin className="w-3 h-3 text-[#CE7028]" /> Fixados pela Diretoria
                </p>
                <div className="space-y-2">
                  {pinnedComms.map(c => (
                    <div key={c.id} className="p-4 bg-[#CE7028]/5 border border-[#CE7028]/20 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-[#CE7028] rounded text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">{c.avatar}</div>
                        <span className="text-[#FF882D] text-xs font-semibold">{c.from}</span>
                        <span className="text-gray-600 text-xs ml-auto">{new Date(c.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                      </div>
                      <p className="text-white text-sm font-semibold mb-1">{c.title}</p>
                      <p className="text-gray-400 text-xs leading-relaxed">{c.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {messages.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold mb-2">Mensagens</p>
                <div className="space-y-2">
                  {messages.map(c => (
                    <div key={c.id} className="flex items-start gap-3 p-3 bg-[#0D0D0D] border border-[#1E1E1E] rounded">
                      <div className="w-7 h-7 bg-blue-900/50 border border-blue-800/30 rounded-full flex items-center justify-center text-blue-300 text-[10px] font-bold flex-shrink-0">{c.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-white text-xs font-semibold">{c.from}</span>
                          <span className="text-gray-600 text-[10px]">{new Date(c.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed">{c.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {notices.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                  <Megaphone className="w-3 h-3" /> Avisos Gerais
                </p>
                <div className="space-y-2">
                  {notices.map(c => (
                    <div key={c.id} className="flex items-center gap-3 p-3 bg-[#0D0D0D] border border-[#1E1E1E] rounded text-xs text-gray-500">
                      <Bell className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="flex-1">{c.body}</span>
                      <span className="text-gray-700 flex-shrink-0">{new Date(c.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {cropSrc          && <PhotoCropModal src={cropSrc} onSave={handleCropSave} onClose={() => setCropSrc(null)} />}
      {showPasswordModal && <PasswordModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  )
}
