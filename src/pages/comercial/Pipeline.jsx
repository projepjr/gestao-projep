import { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { Plus, X, Calendar, User, Trash2, Edit2 } from 'lucide-react'

const STAGES = [
  { id: 'prospeccao', label: 'Prospecção', color: 'border-gray-600', dot: 'bg-gray-500', header: 'bg-gray-500/5' },
  { id: 'contato', label: 'Contato', color: 'border-blue-600', dot: 'bg-blue-500', header: 'bg-blue-500/5' },
  { id: 'proposta', label: 'Proposta', color: 'border-yellow-600', dot: 'bg-yellow-500', header: 'bg-yellow-500/5' },
  { id: 'negociacao', label: 'Negociação', color: 'border-[#CE7028]', dot: 'bg-[#CE7028]', header: 'bg-[#CE7028]/5' },
  { id: 'fechado', label: 'Fechado', color: 'border-green-600', dot: 'bg-green-500', header: 'bg-green-500/5' },
]

const EMPTY_LEAD = { company: '', contact: '', email: '', phone: '', value: '', stage: 'prospeccao', hunter: '', closer: '', notes: '', date: new Date().toISOString().split('T')[0] }

const INPUT_CLS = "w-full bg-[#0D0D0D] border border-[#1E1E1E] rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#CE7028] transition-colors placeholder-gray-700"
const LABEL_CLS = "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block"

function LeadCard({ lead, onMove, onDelete, onEdit }) {
  const stages = STAGES.map(s => s.id)
  const currentIdx = stages.indexOf(lead.stage)

  return (
    <div className="bg-[#0D0D0D] border border-[#1E1E1E] rounded p-4 hover:border-[#CE7028]/30 transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{lead.company}</p>
          <p className="text-gray-600 text-xs mt-0.5">{lead.contact}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(lead)} className="p-1 rounded text-gray-600 hover:text-[#FF882D] hover:bg-[#CE7028]/10 transition-all">
            <Edit2 className="w-3 h-3" />
          </button>
          <button onClick={() => onDelete(lead.id)} className="p-1 rounded text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="text-green-400 font-bold text-sm mb-3 tabular-nums">R$ {Number(lead.value).toLocaleString('pt-BR')}</div>

      <div className="space-y-1 text-xs text-gray-600">
        {lead.hunter && <div className="flex items-center gap-1.5"><User className="w-3 h-3" /><span>{lead.hunter}</span></div>}
        {lead.date && <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /><span>{new Date(lead.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span></div>}
      </div>

      <div className="flex gap-1 mt-3 pt-3 border-t border-[#1E1E1E]">
        {currentIdx > 0 && (
          <button onClick={() => onMove(lead.id, stages[currentIdx - 1])} className="flex-1 py-1.5 text-xs bg-[#1A1A1A] hover:bg-[#222] text-gray-500 hover:text-white rounded transition-all">
            ← Voltar
          </button>
        )}
        {currentIdx < stages.length - 1 && (
          <button onClick={() => onMove(lead.id, stages[currentIdx + 1])} className="flex-1 py-1.5 text-xs bg-[#CE7028]/10 hover:bg-[#CE7028]/20 text-[#FF882D] rounded transition-all">
            Avançar →
          </button>
        )}
      </div>
    </div>
  )
}

function Modal({ lead, onClose, onSave }) {
  const [form, setForm] = useState(lead || EMPTY_LEAD)
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...form, value: Number(form.value) })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-[#1E1E1E] rounded-md w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E1E1E]">
          <h3 className="text-white font-semibold">{lead?.id ? 'Editar Lead' : 'Novo Lead'}</h3>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={LABEL_CLS}>Empresa *</label>
              <input required value={form.company} onChange={e => set('company', e.target.value)} className={INPUT_CLS} placeholder="Nome da empresa" />
            </div>
            <div>
              <label className={LABEL_CLS}>Contato *</label>
              <input required value={form.contact} onChange={e => set('contact', e.target.value)} className={INPUT_CLS} placeholder="Nome do contato" />
            </div>
            <div>
              <label className={LABEL_CLS}>Valor (R$) *</label>
              <input required type="number" value={form.value} onChange={e => set('value', e.target.value)} className={INPUT_CLS} placeholder="0" />
            </div>
            <div>
              <label className={LABEL_CLS}>Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={INPUT_CLS} placeholder="email@empresa.com" />
            </div>
            <div>
              <label className={LABEL_CLS}>Telefone</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} className={INPUT_CLS} placeholder="(11) 99999-0000" />
            </div>
            <div>
              <label className={LABEL_CLS}>Hunter</label>
              <input value={form.hunter} onChange={e => set('hunter', e.target.value)} className={INPUT_CLS} placeholder="Responsável pela prospecção" />
            </div>
            <div>
              <label className={LABEL_CLS}>Closer</label>
              <input value={form.closer} onChange={e => set('closer', e.target.value)} className={INPUT_CLS} placeholder="Responsável pelo fechamento" />
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
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className={`${INPUT_CLS} resize-none`} placeholder="Anotações sobre o lead..." />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded border border-[#1E1E1E] text-gray-500 hover:text-white hover:border-[#2A2A2A] text-sm transition-all">Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 rounded bg-[#CE7028] hover:bg-[#B5611F] text-white font-semibold text-sm transition-colors">{lead?.id ? 'Salvar' : 'Criar Lead'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Pipeline() {
  const { leads, addLead, updateLead, deleteLead, moveLead } = useData()
  const [showModal, setShowModal] = useState(false)
  const [editLead, setEditLead] = useState(null)

  const handleSave = (data) => {
    if (data.id) updateLead(data.id, data)
    else addLead(data)
  }

  const handleClose = () => {
    setShowModal(false)
    setEditLead(null)
  }

  const totalValue = leads.reduce((s, l) => s + Number(l.value), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Pipeline de Vendas</h1>
          <p className="text-gray-500 text-sm mt-1">{leads.length} leads • R$ {totalValue.toLocaleString('pt-BR')} em pipeline</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#CE7028] hover:bg-[#B5611F] text-white font-semibold px-4 py-2.5 rounded text-sm transition-colors">
          <Plus className="w-4 h-4" /> Novo Lead
        </button>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {STAGES.map(stage => {
            const stageLeads = leads.filter(l => l.stage === stage.id)
            const stageValue = stageLeads.reduce((s, l) => s + Number(l.value), 0)
            return (
              <div key={stage.id} className="w-72 flex-shrink-0">
                <div className={`${stage.header} border-t-2 ${stage.color} px-4 py-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${stage.dot}`} />
                    <span className="text-white font-semibold text-sm">{stage.label}</span>
                    <span className="bg-[#1A1A1A] text-gray-500 text-xs rounded px-1.5 py-0.5">{stageLeads.length}</span>
                  </div>
                  <span className="text-xs text-gray-600 tabular-nums">R$ {stageValue.toLocaleString('pt-BR')}</span>
                </div>
                <div className="bg-[#111111] border border-[#1E1E1E] border-t-0 p-3 space-y-3 min-h-[200px]">
                  {stageLeads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} onMove={moveLead} onDelete={deleteLead} onEdit={(l) => { setEditLead(l); setShowModal(true) }} />
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="flex items-center justify-center h-24 text-gray-700 text-sm border border-dashed border-[#1E1E1E] rounded">
                      Sem leads
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showModal && <Modal lead={editLead} onClose={handleClose} onSave={handleSave} />}
    </div>
  )
}
