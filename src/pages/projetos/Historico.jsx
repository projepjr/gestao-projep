import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { History, Activity, MessageSquare, CheckCircle2, FolderKanban } from 'lucide-react'
import { useData } from '../../contexts/DataContext'

const fmtDate = iso => {
  if (!iso) return ''
  try { return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}

const EVENT_TYPE = {
  log:     { Icon: Activity,     cls: 'bg-[#CE7028]',   label: 'Alteração' },
  obs:     { Icon: MessageSquare, cls: 'bg-blue-500',   label: 'Observação' },
  tarefa:  { Icon: CheckCircle2, cls: 'bg-green-500',   label: 'Atividade' },
  projeto: { Icon: FolderKanban, cls: 'bg-purple-500',  label: 'Projeto' },
}

export default function Historico() {
  const navigate = useNavigate()
  const { projects } = useData()
  const all = projects || []

  const [search, setSearch] = useState('')
  const [filterProject, setFilterProject] = useState('')

  const events = useMemo(() => {
    const list = []
    all.forEach(p => {
      ;(p.historico || []).forEach(h => list.push({
        id: `log-${h.id}-${p.id}`, tipo: 'log',
        texto: h.acao, detalhe: h.detalhes || '',
        projetoId: p.id, projetoNome: p.nome,
        autor: h.usuarioNome || '', ts: h.criadoEm,
      }))
      ;(p.observacoes || []).forEach(o => list.push({
        id: `obs-${o.id}-${p.id}`, tipo: 'obs',
        texto: `Observação: ${o.titulo}`, detalhe: o.conteudo ? o.conteudo.slice(0, 80) : '',
        projetoId: p.id, projetoNome: p.nome,
        autor: o.autorNome || '', ts: o.criadoEm,
      }))
      ;(p.tarefas || []).filter(t => t.status === 'concluida').forEach(t => list.push({
        id: `tarefa-${t.id}-${p.id}`, tipo: 'tarefa',
        texto: `Atividade concluída: ${t.nome}`, detalhe: t.fase || '',
        projetoId: p.id, projetoNome: p.nome,
        autor: t.responsavelNome || '', ts: t.atualizadoEm || t.criadoEm,
      }))
    })
    return list
      .filter(e => {
        if (filterProject && e.projetoId !== filterProject) return false
        if (search) {
          const q = search.toLowerCase()
          return e.texto.toLowerCase().includes(q) || e.projetoNome.toLowerCase().includes(q) || e.autor.toLowerCase().includes(q)
        }
        return true
      })
      .sort((a, b) => new Date(b.ts) - new Date(a.ts))
  }, [all, search, filterProject])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-[#CE7028]/10 border border-[#CE7028]/20 flex items-center justify-center">
          <History className="w-4 h-4 text-[#CE7028]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Histórico</h1>
          <p className="text-gray-600 text-xs">Alterações, observações e atividades concluídas em todos os projetos</p>
        </div>
      </div>

      <div className="flex gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar no histórico…"
          className="flex-1 bg-[#111111] border border-[#1E1E1E] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#CE7028] transition-colors placeholder-gray-700" />
        <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
          className="bg-[#111111] border border-[#1E1E1E] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CE7028] cursor-pointer">
          <option value="">Todos os projetos</option>
          {all.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
      </div>

      <div className="flex items-center gap-2 text-gray-600 text-xs">
        <span>{events.length} evento(s)</span>
      </div>

      {events.length === 0 ? (
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-md py-16 text-center">
          <History className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Nenhum evento encontrado</p>
        </div>
      ) : (
        <div className="relative pl-5">
          <div className="absolute left-1.5 top-0 bottom-0 w-px bg-[#1E1E1E]" />
          <div className="space-y-3">
            {events.map(e => {
              const cfg = EVENT_TYPE[e.tipo] || EVENT_TYPE.log
              const Icon = cfg.Icon
              return (
                <div key={e.id} className="relative">
                  <div className={`absolute -left-[14px] w-2.5 h-2.5 rounded-full ${cfg.cls} border-2 border-[#0A0A0A] flex-shrink-0`} />
                  <div className="bg-[#111111] border border-[#1E1E1E] rounded-md px-4 py-3 ml-2 hover:border-[#CE7028]/20 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm">{e.texto}</p>
                        {e.detalhe && <p className="text-gray-500 text-xs mt-0.5">{e.detalhe}</p>}
                        <div className="flex items-center gap-3 mt-1">
                          <button onClick={() => navigate(`/projetos/gestao/${e.projetoId}`)}
                            className="text-[#CE7028]/70 hover:text-[#FF882D] text-[10px] transition-colors">
                            {e.projetoNome}
                          </button>
                          {e.autor && <span className="text-gray-700 text-[10px]">{e.autor}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase text-white ${cfg.cls}`}>
                          {cfg.label}
                        </span>
                        <span className="text-gray-700 text-[10px] whitespace-nowrap">{fmtDate(e.ts)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
