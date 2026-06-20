import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import {
  Camera, Mail, Phone, Calendar, Star, Pin, Bell, Lock,
  CheckCircle, Clock, AlertCircle, TrendingUp, Briefcase,
  MessageSquare, Megaphone, ChevronLeft, Eye, EyeOff,
  ToggleLeft, ToggleRight, Target, X, Pencil, Check,
} from 'lucide-react'

// ─── Line Chart ────────────────────────────────────────────

const idsEqual = (a, b) => String(a ?? '') === String(b ?? '')

function LineChart({ data }) {
  const W = 400, H = 80, PX = 24, PY = 10
  const maxG = 10
  const pts = data.map((d, i) => ({
    x: data.length <= 1 ? W / 2 : PX + (i / (data.length - 1)) * (W - PX * 2),
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

function boundPhotoOffset(candidate, naturalSize, zoom) {
  if (!naturalSize.w || !naturalSize.h) return candidate
  const coverScale = Math.max(200 / naturalSize.w, 200 / naturalSize.h)
  const maxX = Math.max(0, (naturalSize.w * coverScale * zoom - 200) / 2)
  const maxY = Math.max(0, (naturalSize.h * coverScale * zoom - 200) / 2)
  return {
    x: Math.max(-maxX, Math.min(maxX, candidate.x)),
    y: Math.max(-maxY, Math.min(maxY, candidate.y)),
  }
}

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
      setOffset(boundPhotoOffset({
        x: dragStart.current.ox + e.clientX - dragStart.current.sx,
        y: dragStart.current.oy + e.clientY - dragStart.current.sy,
      }, naturalSz, zoom))
    }
    const onUp = () => setDragging(false)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup',   onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup',   onUp)
    }
  }, [dragging, naturalSz, zoom])

  const handlePointerDown = (e) => {
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
              style={{ width: 200, height: 200, borderRadius: '50%', cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none', touchAction: 'none' }}
              onPointerDown={handlePointerDown}
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
              onChange={e => {
                const nextZoom = parseFloat(e.target.value)
                setZoom(nextZoom)
                setOffset(current => boundPhotoOffset(current, naturalSz, nextZoom))
              }}
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

function EditableField({ icon: Icon, value, onSave, type = 'text', readOnly = false }) {
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState(value)
  const [error,   setError]   = useState('')

  const commit = () => {
    const result = onSave(draft)
    if (result?.success === false) {
      setError(result.error)
      return
    }
    setError('')
    setEditing(false)
  }
  const cancel = () => { setDraft(value); setError(''); setEditing(false) }

  return (
    <div>
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
                onClick={() => { setDraft(value); setError(''); setEditing(true) }}
                className="p-1 text-gray-700 hover:text-[#CE7028] opacity-100 sm:opacity-0 sm:group-hover/field:opacity-100 transition-all"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-red-400 text-[10px] mt-1 ml-6">{error}</p>}
    </div>
  )
}

// ─── Password Modal ────────────────────────────────────────

function PasswordModal({ onClose, onChangePassword }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [show, setShow] = useState(false)
  const [msg,  setMsg]  = useState(null)
  const FIELD = "w-full bg-[#0D0D0D] border border-[#1E1E1E] rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#CE7028] transition-colors"

  const handleSubmit = (e) => {
    e.preventDefault()
    if (form.next !== form.confirm) { setMsg({ type: 'error', text: 'As senhas não coincidem' }); return }
    if (form.next.length < 6)       { setMsg({ type: 'error', text: 'Mínimo de 6 caracteres' });  return }
    const result = onChangePassword(form.current, form.next)
    if (!result.success) { setMsg({ type: 'error', text: result.error }); return }
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
  const { user, updateUserPhoto, updateCurrentUser, changePassword } = useAuth()
  const {
    members,
    evaluations,
    projects: storedProjects,
    notices: storedNotices,
    notifications,
  } = useData()
  const navigate = useNavigate()
  const fileRef  = useRef()

  const [editingName, setEditingName] = useState(false)
  const [nameDraft,   setNameDraft]   = useState('')
  const [nameError,   setNameError]   = useState('')

  const saveNameEdit = () => {
    const trimmed = nameDraft.trim()
    if (!trimmed) { setEditingName(false); return }
    const result = updateCurrentUser({ nome: trimmed })
    if (result?.success === false) {
      setNameError(result.error)
      return
    }
    setNameError('')
    setEditingName(false)
  }

  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [cropSrc,           setCropSrc]           = useState(null)
  const [photoError,        setPhotoError]        = useState('')

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoError('')
    if (!file.type.startsWith('image/')) {
      setPhotoError('Selecione um arquivo de imagem válido.')
      e.target.value = ''
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setPhotoError('A imagem deve ter no máximo 8 MB.')
      e.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => setCropSrc(ev.target.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleCropSave = (croppedPhoto) => {
    const result = updateUserPhoto(croppedPhoto)
    if (result?.success === false) return setPhotoError(result.error)
    setPhotoError('')
    setCropSrc(null)
  }

  const roleLabel = user?.cargo || ''
  const dept = user?.setor || ''
  const settings = user?.preferenciasNotificacao || {
    email: true, system: true, whatsapp: false, weekly_report: true,
  }
  const evaluation = evaluations.find(item => idsEqual(item.membroId, user?.id))
  const performance = {
    grade: evaluation?.nota ?? ((user?.performance || 0) / 10),
    gradeHistory: (evaluation?.historico || []).map(item => ({ month: item.mes, grade: item.nota })),
    goalsCompleted: (evaluation?.metas || []).filter(goal => goal.status === 'concluida').length,
    goalsTotal: (evaluation?.metas || []).length,
  }
  if (performance.gradeHistory.length === 0) {
    performance.gradeHistory = [{ month: 'Atual', grade: performance.grade }]
  }

  const feedbacks = (evaluation?.feedbacks || []).map(feedback => {
    const author = members.find(member => idsEqual(member.id, feedback.avaliadorId))
    return {
      id: feedback.id || `${feedback.avaliadorId}-${feedback.data}`,
      from: author?.nome || 'Membro removido',
      role: author?.cargo || '',
      avatar: author?.avatar || '?',
      date: feedback.data,
      stars: feedback.estrelas || 5,
      text: feedback.texto,
    }
  })

  const projects = storedProjects
    .filter(project =>
      idsEqual(project.responsavelId, user?.id) ||
      project.membros?.some(memberId => idsEqual(memberId, user?.id))
    )
    .map(project => ({
      id: project.id,
      name: project.nome,
      company: project.clienteNome,
      status: project.status,
      role: idsEqual(project.responsavelId, user?.id) ? 'Responsável' : 'Membro do projeto',
    }))

  const tasks = storedProjects.flatMap(project =>
    (project.tarefas || [])
      .filter(task => idsEqual(task.responsavelId, user?.id))
      .map(task => ({
        id: `${project.id}-${task.id}`,
        title: task.titulo,
        status: task.status === 'andamento' ? 'em_andamento' : task.status,
        due: task.prazo,
      }))
  )

  const pinnedComms = storedNotices.filter(notice => notice.fixado).map(notice => {
    const author = members.find(member => idsEqual(member.id, notice.autorId))
    return {
      id: notice.id,
      from: author?.nome || 'Diretoria',
      avatar: author?.avatar || 'DI',
      title: notice.titulo,
      body: notice.texto,
      date: notice.timestamp.split('T')[0],
    }
  })
  const notices = notifications
    .filter(notification => notification.usuarioId == null || idsEqual(notification.usuarioId, user?.id))
    .slice(0, 3)
    .map(notification => ({
      id: notification.id,
      body: notification.descricao,
      date: notification.timestamp.split('T')[0],
    }))
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
        <span className="text-[11px] text-gray-600">Alterações salvas automaticamente</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── LEFT COLUMN ─────────────────────── */}
        <div className="xl:col-span-1 space-y-4">

          {/* Header card */}
          <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-6">
            {user?.precisaAtualizarDados && (
              <div className="mb-5 rounded border border-[#CE7028]/30 bg-[#CE7028]/10 p-3 text-left">
                <p className="text-white text-sm font-semibold">Complete seus dados</p>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                  Seu acesso foi criado com dados temporários. Atualize nome, email, WhatsApp, foto e senha.
                </p>
              </div>
            )}
            {/* Photo */}
            <div className="flex flex-col items-center mb-5">
              <div
                className="relative w-24 h-24 rounded-full cursor-pointer group"
                onClick={() => fileRef.current?.click()}
              >
                {user?.fotoPerfil ? (
                  <img src={user.fotoPerfil} alt="Foto" className="w-full h-full object-cover rounded-full border-2 border-[#CE7028]" />
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
              {photoError && <p className="text-red-400 text-[10px] mt-1 text-center">{photoError}</p>}
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
                  onClick={() => { setNameDraft(user?.nome || ''); setEditingName(true) }}
                >
                  <h2 className="text-white font-bold text-lg">{user?.nome}</h2>
                  <Pencil className="w-3 h-3 text-gray-700 opacity-100 sm:opacity-0 sm:group-hover/name:opacity-100 transition-opacity" />
                </div>
              )}
              {nameError && <p className="text-red-400 text-[10px] mb-1">{nameError}</p>}
              <p className="text-[#FF882D] text-sm font-medium">{roleLabel}</p>
              <p className="text-gray-500 text-xs mt-0.5">{dept}</p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-4 h-4 text-gray-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-0.5">Membro desde</p>
                  <p className="text-gray-300 text-xs">
                    {user?.dataCadastro
                      ? new Date(`${user.dataCadastro}T12:00:00`).toLocaleDateString('pt-BR')
                      : 'Não informado'}
                  </p>
                </div>
              </div>

              <EditableField
                icon={Mail} label="Email"
                value={user?.email || ''}
                onSave={val => updateCurrentUser({
                  email: val,
                  precisaAtualizarDados: false,
                  emailTemporario: false,
                })}
                type="email"
              />

              <EditableField
                icon={Phone} label="WhatsApp"
                value={user?.telefone || ''}
                onSave={val => updateCurrentUser({ telefone: val })}
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
                const on = settings[key]
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">{label}</span>
                    <button onClick={() => updateCurrentUser({ preferenciasNotificacao: { ...settings, [key]: !on } })}
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
                {feedbacks.map(fb => (
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
                {feedbacks.length === 0 && <p className="text-gray-700 text-xs text-center py-6">Nenhum feedback recebido ainda.</p>}
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
      {showPasswordModal && <PasswordModal onClose={() => setShowPasswordModal(false)} onChangePassword={changePassword} />}
    </div>
  )
}
