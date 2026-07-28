import { useState, useMemo } from 'react'
import { MessageSquare, Plus, Edit2, Trash2, X } from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { useAuth } from '../../contexts/AuthContext'

const INPUT = 'w-full bg-[#0D0D0D] border border-[#1E1E1E] rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#CE7028] transition-colors placeholder-gray-700'
const LABEL = 'text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block'
const SELECT = `${INPUT} cursor-pointer`

const fmtDate = iso => {
  if (!iso) return ''
  try { return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}

export default function Observacoes() {
  const { user } = useAuth()
  const { projects, addObservacao, updateObservacao, deleteObservacao } = useData()
  const all = projects || []

  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [search, setSearch] = useState('')
  const [filterProject, setFilterProject] = useState('')
  const [form, setForm] = useState({ projetoId: '', titulo: '', conteudo: '' })

  const openCreate = () => {
    setForm({ projetoId: all[0]?.id || '', titulo: '', conteudo: '' })
    setEditData(null)
    setShowModal(true)
  }

  const openEdit = (obs, projetoId) => {
    setForm({ projetoId, titulo: obs.titulo, conteudo: obs.conteudo || '' })
    setEditData({ id: obs.id, projetoId })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.titulo.trim() || !form.projetoId) return
    if (editData) {
      updateObservacao(editData.projetoId, editData.id, { titulo: form.titulo, conteudo: form.conteudo })
    } else {
      addObservacao(form.projetoId, { titulo: form.titulo, conteudo: form.conteudo, autorNome: user?.nome || '', autorId: user?.id })
    }
    setShowModal(false)
  }

  const allObs = useMemo(() => {
    const list = []
    all.forEach(p => {
      (p.observacoes || []).forEach(o => list.push({ ...o, projetoId: p.id, projetoNome: p.nome }))
    })
    return list
      .filter(o => {
        if (filterProject && o.projetoId !== filterProject) return false
        if (search) {
          const q = search.toLowerCase()
          return o.titulo.toLowerCase().includes(q) || (o.conteudo || '').toLowerCase().includes(q) || o.projetoNome.toLowerCase().includes(q)
        }
        return true
      })
      .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
  }, [all, search, filterProject])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#CE7028]/10 border border-[#CE7028]/20 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-[#CE7028]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Observações</h1>
            <p className="text-gray-600 text-xs">Documentação por projeto — exclusiva do sistema</p>
          </div>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-1.5 bg-[#CE7028] hover:bg-[#B5611F] text-white text-sm font-semibold px-4 py-2 rounded transition-colors flex-shrink-0">
          <Plus className="w-4 h-4" /> Nova observação
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar observações…"
          className="flex-1 bg-[#111111] border border-[#1E1E1E] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#CE7028] transition-colors placeholder-gray-700" />
        <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
          className="bg-[#111111] border border-[#1E1E1E] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CE7028] cursor-pointer">
          <option value="">Todos os projetos</option>
          {all.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
      </div>

      <p className="text-gray-600 text-xs">{allObs.length} observação(ões)</p>

      {/* Feed */}
      {allObs.length === 0 ? (
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-md py-16 text-center">
          <MessageSquare className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Nenhuma observação encontrada</p>
          <button onClick={openCreate} className="mt-3 text-[#CE7028] text-sm hover:underline">
            Criar primeira observação
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {allObs.map(o => (
            <div key={`${o.projetoId}-${o.id}`}
              className="bg-[#111111] border border-[#1E1E1E] rounded-md p-4 group hover:border-[#CE7028]/20 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#CE7028]/10 text-[#FF882D] border border-[#CE7028]/20">
                      {o.projetoNome}
                    </span>
                    {o.editadoEm && (
                      <span className="text-gray-700 text-[10px]">(editado)</span>
                    )}
                  </div>
                  <p className="text-white font-semibold text-sm">{o.titulo}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {o.autorNome && <span className="text-gray-600 text-xs">{o.autorNome}</span>}
                    <span className="text-gray-700 text-xs">{fmtDate(o.criadoEm)}</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => openEdit(o, o.projetoId)}
                    className="p-1.5 rounded text-gray-600 hover:text-[#FF882D] hover:bg-[#CE7028]/10 transition-all">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteObservacao(o.projetoId, o.id)}
                    className="p-1.5 rounded text-gray-600 hover:text-red-400 hover:bg-red-950/30 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {o.conteudo && (
                <p className="text-gray-400 text-sm mt-2 leading-relaxed whitespace-pre-wrap border-t border-[#1A1A1A] pt-2">
                  {o.conteudo}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#111111] border border-[#1E1E1E] rounded-md w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E1E1E]">
              <h2 className="text-white font-bold">{editData ? 'Editar observação' : 'Nova observação'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-600 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {!editData && (
                <div>
                  <label className={LABEL}>Projeto *</label>
                  <select value={form.projetoId} onChange={e => setForm(f => ({ ...f, projetoId: e.target.value }))} className={SELECT}>
                    <option value="">Selecionar projeto</option>
                    {all.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className={LABEL}>Título *</label>
                <input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                  placeholder="Título da observação" className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Conteúdo</label>
                <textarea value={form.conteudo} onChange={e => setForm(f => ({ ...f, conteudo: e.target.value }))}
                  placeholder="Detalhes, anotações, próximos passos…" rows={5} className={`${INPUT} resize-none`} />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-[#1E1E1E] flex justify-end gap-2">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded border border-[#1E1E1E] text-gray-400 hover:text-white text-sm font-semibold transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={!form.titulo.trim() || (!editData && !form.projetoId)}
                className="px-4 py-2 rounded bg-[#CE7028] hover:bg-[#B5611F] disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                {editData ? 'Salvar' : 'Criar observação'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
