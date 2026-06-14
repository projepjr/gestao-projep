import { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { Plus, X, FileText, Calendar, User, Trash2, Edit2 } from 'lucide-react'

const STATUS = {
  ativo: { label: 'Ativo', className: 'bg-green-500/10 text-green-400 border-green-700/30' },
  pausado: { label: 'Pausado', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-700/30' },
  concluido: { label: 'Concluído', className: 'bg-blue-500/10 text-blue-400 border-blue-700/30' },
  cancelado: { label: 'Cancelado', className: 'bg-red-500/10 text-red-400 border-red-700/30' },
}

const EMPTY = { company: '', value: '', startDate: '', endDate: '', status: 'ativo', description: '', responsible: '', deliveries: 1, deliveriesDone: 0 }

const INPUT_CLS = "w-full bg-[#0D0D0D] border border-[#1E1E1E] rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#CE7028] transition-colors placeholder-gray-700"
const LABEL_CLS = "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block"

function Modal({ contract, onClose, onSave }) {
  const [form, setForm] = useState(contract || EMPTY)
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...form, value: Number(form.value), deliveries: Number(form.deliveries), deliveriesDone: Number(form.deliveriesDone) })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-[#1E1E1E] rounded-md w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E1E1E]">
          <h3 className="text-white font-semibold">{contract?.id ? 'Editar Contrato' : 'Novo Contrato'}</h3>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={LABEL_CLS}>Empresa *</label>
              <input required value={form.company} onChange={e => set('company', e.target.value)} className={INPUT_CLS} placeholder="Nome da empresa" />
            </div>
            <div>
              <label className={LABEL_CLS}>Valor (R$) *</label>
              <input required type="number" value={form.value} onChange={e => set('value', e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className={INPUT_CLS}>
                {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>Início</label>
              <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Término</label>
              <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Entregas Totais</label>
              <input type="number" min="1" value={form.deliveries} onChange={e => set('deliveries', e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Entregas Feitas</label>
              <input type="number" min="0" value={form.deliveriesDone} onChange={e => set('deliveriesDone', e.target.value)} className={INPUT_CLS} />
            </div>
            <div className="col-span-2">
              <label className={LABEL_CLS}>Responsável</label>
              <input value={form.responsible} onChange={e => set('responsible', e.target.value)} className={INPUT_CLS} placeholder="Nome do responsável" />
            </div>
            <div className="col-span-2">
              <label className={LABEL_CLS}>Descrição</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} className={`${INPUT_CLS} resize-none`} placeholder="Descrição do projeto..." />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded border border-[#1E1E1E] text-gray-500 hover:text-white text-sm transition-all">Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 rounded bg-[#CE7028] hover:bg-[#B5611F] text-white font-semibold text-sm transition-colors">{contract?.id ? 'Salvar' : 'Criar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Contratos() {
  const { contracts, addContract, updateContract, deleteContract } = useData()
  const [showModal, setShowModal] = useState(false)
  const [editContract, setEditContract] = useState(null)
  const [filter, setFilter] = useState('todos')

  const filtered = filter === 'todos' ? contracts : contracts.filter(c => c.status === filter)
  const totalActive = contracts.filter(c => c.status === 'ativo').reduce((s, c) => s + c.value, 0)

  const handleSave = (data) => {
    if (data.id) updateContract(data.id, data)
    else addContract(data)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Contratos & Projetos</h1>
          <p className="text-gray-500 text-sm mt-1">{contracts.filter(c => c.status === 'ativo').length} ativos • R$ {totalActive.toLocaleString('pt-BR')}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#CE7028] hover:bg-[#B5611F] text-white font-semibold px-4 py-2.5 rounded text-sm transition-colors">
          <Plus className="w-4 h-4" /> Novo Contrato
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['todos', 'ativo', 'pausado', 'concluido', 'cancelado'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${filter === f ? 'bg-[#CE7028] text-white' : 'bg-[#111111] border border-[#1E1E1E] text-gray-500 hover:border-[#2A2A2A] hover:text-white'}`}
          >
            {f === 'todos' ? 'Todos' : STATUS[f]?.label}
            <span className="ml-2 text-xs opacity-60">
              {f === 'todos' ? contracts.length : contracts.filter(c => c.status === f).length}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(contract => {
          const progress = contract.deliveries > 0 ? (contract.deliveriesDone / contract.deliveries) * 100 : 0
          const s = STATUS[contract.status]
          return (
            <div key={contract.id} className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5 hover:border-[#CE7028]/20 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold">{contract.company}</h3>
                  <p className="text-gray-600 text-xs mt-0.5">{contract.description}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditContract(contract); setShowModal(true) }} className="p-1.5 rounded text-gray-600 hover:text-[#FF882D] hover:bg-[#CE7028]/10 transition-all">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteContract(contract.id)} className="p-1.5 rounded text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-2xl font-bold text-white mb-4 tabular-nums">R$ {contract.value.toLocaleString('pt-BR')}</div>

              <div className="space-y-1.5 text-xs text-gray-600 mb-4">
                {contract.responsible && <div className="flex items-center gap-2"><User className="w-3 h-3" />{contract.responsible}</div>}
                {contract.startDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {new Date(contract.startDate + 'T12:00:00').toLocaleDateString('pt-BR')} → {contract.endDate ? new Date(contract.endDate + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-600">Progresso das entregas</span>
                  <span className="text-xs text-gray-400 font-semibold tabular-nums">{contract.deliveriesDone}/{contract.deliveries}</span>
                </div>
                <div className="h-1.5 bg-[#1E1E1E] rounded-full overflow-hidden">
                  <div className="h-full bg-[#CE7028] transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold border ${s.className}`}>
                {s.label}
              </span>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-700">
            <FileText className="w-10 h-10 mb-3 opacity-30" />
            <p>Nenhum contrato encontrado</p>
          </div>
        )}
      </div>

      {showModal && (
        <Modal contract={editContract} onClose={() => { setShowModal(false); setEditContract(null) }} onSave={handleSave} />
      )}
    </div>
  )
}
