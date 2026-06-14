import { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { Plus, X, User, Calendar, Star, Trash2, Edit2 } from 'lucide-react'

const STAGES = [
  { id: 'inscricao', label: 'Inscrição', color: 'border-gray-600', dot: 'bg-gray-500', header: 'bg-gray-500/5' },
  { id: 'prova', label: 'Prova', color: 'border-blue-600', dot: 'bg-blue-500', header: 'bg-blue-500/5' },
  { id: 'entrevista_rh', label: 'Entrevista RH', color: 'border-yellow-600', dot: 'bg-yellow-500', header: 'bg-yellow-500/5' },
  { id: 'entrevista_diretoria', label: 'Dir. Executiva', color: 'border-[#CE7028]', dot: 'bg-[#CE7028]', header: 'bg-[#CE7028]/5' },
  { id: 'aprovado', label: 'Aprovado', color: 'border-green-600', dot: 'bg-green-500', header: 'bg-green-500/5' },
]

const EMPTY = { name: '', role: '', stage: 'inscricao', date: new Date().toISOString().split('T')[0], score: 0, notes: '' }

const INPUT_CLS = "w-full bg-[#0D0D0D] border border-[#1E1E1E] rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#CE7028] transition-colors placeholder-gray-700"
const LABEL_CLS = "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block"

function CandidateCard({ candidate, onMove, onDelete, onEdit }) {
  const stageIds = STAGES.map(s => s.id)
  const currentIdx = stageIds.indexOf(candidate.stage)

  return (
    <div className="bg-[#0D0D0D] border border-[#1E1E1E] rounded p-4 hover:border-[#CE7028]/20 transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white font-semibold text-sm">{candidate.name}</p>
          <p className="text-gray-600 text-xs mt-0.5">{candidate.role}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(candidate)} className="p-1 rounded text-gray-600 hover:text-[#FF882D] hover:bg-[#CE7028]/10 transition-all">
            <Edit2 className="w-3 h-3" />
          </button>
          <button onClick={() => onDelete(candidate.id)} className="p-1 rounded text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {candidate.score > 0 && (
        <div className="flex items-center gap-1.5 mb-2">
          <Star className="w-3 h-3 text-yellow-500" />
          <span className="text-yellow-400 text-xs font-bold tabular-nums">{candidate.score} pts</span>
        </div>
      )}

      {candidate.date && (
        <div className="flex items-center gap-1.5 text-gray-600 text-xs mb-2">
          <Calendar className="w-3 h-3" />
          {new Date(candidate.date + 'T12:00:00').toLocaleDateString('pt-BR')}
        </div>
      )}

      {candidate.notes && (
        <p className="text-gray-600 text-xs leading-relaxed mb-3 line-clamp-2">{candidate.notes}</p>
      )}

      <div className="flex gap-1 pt-3 border-t border-[#1E1E1E]">
        {currentIdx > 0 && (
          <button onClick={() => onMove(candidate.id, stageIds[currentIdx - 1])} className="flex-1 py-1.5 text-xs bg-[#1A1A1A] hover:bg-[#222] text-gray-500 hover:text-white rounded transition-all">
            ← Voltar
          </button>
        )}
        {currentIdx < stageIds.length - 1 && (
          <button onClick={() => onMove(candidate.id, stageIds[currentIdx + 1])} className="flex-1 py-1.5 text-xs bg-blue-900/20 hover:bg-blue-900/30 text-blue-400 rounded transition-all">
            Avançar →
          </button>
        )}
        {candidate.stage !== 'reprovado' && (
          <button onClick={() => onMove(candidate.id, 'reprovado')} className="py-1.5 px-2 text-xs bg-red-950/30 hover:bg-red-950/50 text-red-500 rounded transition-all">
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

function Modal({ candidate, onClose, onSave }) {
  const [form, setForm] = useState(candidate || EMPTY)
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...form, score: Number(form.score) })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-[#1E1E1E] rounded-md w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E1E1E]">
          <h3 className="text-white font-semibold">{candidate?.id ? 'Editar Candidato' : 'Novo Candidato'}</h3>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={LABEL_CLS}>Nome *</label>
              <input required value={form.name} onChange={e => set('name', e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Vaga *</label>
              <input required value={form.role} onChange={e => set('role', e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Pontuação</label>
              <input type="number" min="0" max="100" value={form.score} onChange={e => set('score', e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Etapa</label>
              <select value={form.stage} onChange={e => set('stage', e.target.value)} className={INPUT_CLS}>
                {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>Data</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={INPUT_CLS} />
            </div>
            <div className="col-span-2">
              <label className={LABEL_CLS}>Observações</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} className={`${INPUT_CLS} resize-none`} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded border border-[#1E1E1E] text-gray-500 hover:text-white text-sm transition-all">Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 rounded bg-[#CE7028] hover:bg-[#B5611F] text-white font-semibold text-sm transition-colors">{candidate?.id ? 'Salvar' : 'Adicionar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProcessoSeletivo() {
  const { process, addCandidate, updateCandidate, deleteCandidate } = useData()
  const [showModal, setShowModal] = useState(false)
  const [editCandidate, setEditCandidate] = useState(null)

  const handleMove = (id, stage) => updateCandidate(id, { stage })
  const handleSave = (data) => {
    if (data.id) updateCandidate(data.id, data)
    else addCandidate(data)
  }

  const active = process.filter(p => p.stage !== 'reprovado')
  const reprovados = process.filter(p => p.stage === 'reprovado')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Processo Seletivo</h1>
          <p className="text-gray-500 text-sm mt-1">{active.length} candidatos ativos • {reprovados.length} reprovados</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#CE7028] hover:bg-[#B5611F] text-white font-semibold px-4 py-2.5 rounded text-sm transition-colors">
          <Plus className="w-4 h-4" /> Novo Candidato
        </button>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {STAGES.map(stage => {
            const stageCandidates = active.filter(p => p.stage === stage.id)
            return (
              <div key={stage.id} className="w-64 flex-shrink-0">
                <div className={`${stage.header} border-t-2 ${stage.color} px-4 py-3 flex items-center gap-2`}>
                  <span className={`w-2 h-2 rounded-full ${stage.dot}`} />
                  <span className="text-white font-semibold text-sm">{stage.label}</span>
                  <span className="bg-[#1A1A1A] text-gray-500 text-xs rounded px-1.5 py-0.5 ml-auto">{stageCandidates.length}</span>
                </div>
                <div className="bg-[#111111] border border-[#1E1E1E] border-t-0 p-3 space-y-3 min-h-[200px]">
                  {stageCandidates.map(c => (
                    <CandidateCard key={c.id} candidate={c} onMove={handleMove} onDelete={deleteCandidate} onEdit={(c) => { setEditCandidate(c); setShowModal(true) }} />
                  ))}
                  {stageCandidates.length === 0 && (
                    <div className="flex items-center justify-center h-24 text-gray-700 text-sm border border-dashed border-[#1E1E1E] rounded">
                      Nenhum candidato
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {reprovados.length > 0 && (
        <div className="bg-[#111111] border border-red-900/30 rounded-md p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Reprovados ({reprovados.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {reprovados.map(c => (
              <div key={c.id} className="flex items-center gap-3 p-3 bg-red-950/10 border border-red-900/20 rounded">
                <div className="w-8 h-8 bg-red-950/30 rounded flex items-center justify-center">
                  <User className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{c.name}</p>
                  <p className="text-gray-600 text-xs">{c.role}</p>
                </div>
                <button onClick={() => deleteCandidate(c.id)} className="p-1 text-gray-700 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <Modal candidate={editCandidate} onClose={() => { setShowModal(false); setEditCandidate(null) }} onSave={handleSave} />
      )}
    </div>
  )
}
