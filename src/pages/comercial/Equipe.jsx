import { useEffect, useMemo, useState } from 'react'
import { Check, Edit2, Link2, Plus, Search, Trash2, Users, X } from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'
import { extractPipefyPeopleFromSnapshot } from '../../services/comercialSnapshotMapper'
import UserAvatar from '../../components/UserAvatar'

const PIPEFY_COMERCIAL_PIPE_ID = '307210845'

const INPUT = 'w-full bg-[#0D0D0D] border border-[#1E1E1E] rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#CE7028] transition-colors placeholder-gray-700'
const LABEL = 'text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block'

const ROLE_META = {
  hunters: {
    label: 'Hunters',
    description: 'Quem aparece na tabela de prospecção e agendamento.',
    empty: 'Nenhum hunter configurado ainda.',
  },
  closers: {
    label: 'Closers',
    description: 'Quem aparece na tabela de negociação e fechamento.',
    empty: 'Nenhum closer configurado ainda.',
  },
}

const emptyForm = { id: null, userId: '', pipefyName: '', pipefyAliases: '', active: true }

const idsEqual = (a, b) => String(a ?? '') === String(b ?? '')
const memberMatchesId = (member, id) =>
  idsEqual(member?.id, id) ||
  idsEqual(member?.supabaseId, id)

function normalizeEntry(entry) {
  return {
    id: entry.id,
    userId: entry.userId,
    pipefyName: entry.pipefyName || '',
    pipefyAliases: Array.isArray(entry.pipefyAliases) ? entry.pipefyAliases.join(', ') : entry.pipefyAliases || '',
    active: entry.active !== false,
  }
}

function TeamTable({ role, entries, members, onEdit, onRemove, onToggle }) {
  const meta = ROLE_META[role]
  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-md overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1E1E1E] flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-sm uppercase tracking-wider">{meta.label}</h2>
          <p className="text-gray-600 text-xs mt-0.5">{meta.description}</p>
        </div>
        <span className="text-[10px] text-gray-500 bg-[#0D0D0D] border border-[#1E1E1E] px-2 py-1 rounded">
          {entries.filter(item => item.active !== false).length} ativo(s)
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="p-8 text-center">
          <Users className="w-8 h-8 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{meta.empty}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E1E1E] text-left">
                <th className="px-5 py-3 text-xs text-gray-600 uppercase tracking-wider">Membro do site</th>
                <th className="px-5 py-3 text-xs text-gray-600 uppercase tracking-wider">E-mail no Pipefy</th>
                <th className="px-5 py-3 text-xs text-gray-600 uppercase tracking-wider">Aliases</th>
                <th className="px-5 py-3 text-xs text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-xs text-gray-600 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => {
                const member = members.find(item => memberMatchesId(item, entry.userId))
                return (
                  <tr key={entry.id} className="border-b border-[#0D0D0D] hover:bg-[#0D0D0D]/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={member} size={32} textClassName="text-xs" />
                        <div>
                          <p className="text-white font-semibold">{member?.nome || 'Membro removido'}</p>
                          <p className="text-gray-600 text-xs">{member?.cargo || 'Sem cargo'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-300">{entry.pipefyName}</td>
                    <td className="px-5 py-3 text-gray-500 max-w-sm truncate">
                      {(entry.pipefyAliases || []).length ? entry.pipefyAliases.join(', ') : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => onToggle(entry)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded border transition-colors ${
                          entry.active !== false
                            ? 'text-green-400 bg-green-950/30 border-green-900/30'
                            : 'text-gray-500 bg-[#0D0D0D] border-[#1E1E1E]'
                        }`}
                      >
                        {entry.active !== false ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => onEdit(entry)} className="p-2 rounded text-gray-500 hover:text-[#CE7028] hover:bg-[#CE7028]/10 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => onRemove(entry.id)} className="p-2 rounded text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function EquipeComercial() {
  const { members, commercial, updateCommercialTeam } = useData()
  const [role, setRole] = useState('hunters')
  const [form, setForm] = useState(emptyForm)
  const [query, setQuery] = useState('')
  const [snapshot, setSnapshot] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    async function loadSnapshot() {
      if (!isSupabaseConfigured || !supabase) return
      const { data, error } = await supabase
        .from('comercial_dashboard_snapshots')
        .select('payload, synced_at')
        .eq('source', 'pipefy')
        .order('synced_at', { ascending: false })
        .limit(1)
      if (!cancelled && !error) {
        const snapshots = Array.isArray(data) ? data : []
        setSnapshot(snapshots.find(row => {
          const payload = row.payload || {}
          const pipeIds = [
            payload.pipe?.id,
            payload.raw?.pipe?.id,
            payload.raw?.data?.pipe?.id,
            ...(payload.pipes || []).map(pipe => pipe.id),
            ...(payload.raw?.pipes || []).map(pipe => pipe.id),
          ].filter(Boolean).map(String)

          return pipeIds.includes(PIPEFY_COMERCIAL_PIPE_ID)
        }) || null)
      }
    }
    loadSnapshot()
    return () => { cancelled = true }
  }, [])

  const entries = commercial.equipe?.[role] || []
  const pipefyPeople = useMemo(
    () => extractPipefyPeopleFromSnapshot(snapshot?.payload),
    [snapshot],
  )
  const filteredPeople = useMemo(() => {
    const text = query.trim().toLowerCase()
    return pipefyPeople
      .filter(person => !text || `${person.label} ${person.name || ''} ${person.source}`.toLowerCase().includes(text))
      .slice(0, 30)
  }, [pipefyPeople, query])

  const activeMembers = members.filter(member => member.status === 'ativo')

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const resetForm = () => {
    setForm(emptyForm)
    setMessage('')
  }

  const save = event => {
    event.preventDefault()
    if (!form.userId || !form.pipefyName.trim()) {
      setMessage('Selecione um membro do site e informe o e-mail usado no Pipefy.')
      return
    }

    const payload = {
      id: form.id || `${role}-${form.userId}-${Date.now()}`,
      userId: form.userId,
      pipefyName: form.pipefyName.trim(),
      pipefyAliases: form.pipefyAliases,
      active: form.active,
    }
    const next = form.id
      ? entries.map(item => idsEqual(item.id, form.id) ? payload : item)
      : [...entries, payload]
    const result = updateCommercialTeam(role, next)
    if (result?.success === false) {
      setMessage(result.error)
      return
    }
    setMessage('Vínculo salvo com sucesso.')
    setForm(emptyForm)
  }

  const remove = id => {
    const result = updateCommercialTeam(role, entries.filter(item => !idsEqual(item.id, id)))
    setMessage(result?.success === false ? result.error : 'Vínculo removido.')
  }

  const toggle = entry => {
    const result = updateCommercialTeam(role, entries.map(item =>
      idsEqual(item.id, entry.id) ? { ...item, active: item.active === false } : item
    ))
    setMessage(result?.success === false ? result.error : 'Status atualizado.')
  }

  const selectPipefyPerson = person => {
    set('pipefyName', person.email || person.value)
    if (person.aliases?.length) {
      const currentAliases = `${form.pipefyAliases || ''}`
        .split(',')
        .map(alias => alias.trim())
        .filter(Boolean)
      const nextAliases = [...new Set([...currentAliases, ...person.aliases])]
      set('pipefyAliases', nextAliases.join(', '))
    }
    setQuery('')
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Equipe Comercial</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Associe membros do site aos e-mails do Pipefy para alimentar Hunters e Closers corretamente.
          </p>
        </div>
        {snapshot?.synced_at && (
          <span className="text-xs text-gray-600">
            E-mails lidos do último snapshot: {new Date(snapshot.synced_at).toLocaleString('pt-BR')}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {Object.entries(ROLE_META).map(([key, meta]) => (
          <button
            key={key}
            onClick={() => { setRole(key); resetForm() }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold border transition-all ${
              role === key
                ? 'bg-[#CE7028] border-[#CE7028] text-white'
                : 'bg-[#111111] border-[#1E1E1E] text-gray-500 hover:text-white hover:border-[#CE7028]/50'
            }`}
          >
            <Users className="w-4 h-4" />
            {meta.label}
            <span className="text-xs opacity-70">{(commercial.equipe?.[key] || []).filter(item => item.active !== false).length}</span>
          </button>
        ))}
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_420px] gap-5">
        <TeamTable
          role={role}
          entries={entries}
          members={members}
          onEdit={entry => setForm(normalizeEntry(entry))}
          onRemove={remove}
          onToggle={toggle}
        />

        <div className="space-y-5">
          <form onSubmit={save} className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-sm uppercase tracking-wider">
                  {form.id ? 'Editar vínculo' : `Adicionar ${ROLE_META[role].label.slice(0, -1)}`}
                </h2>
                <p className="text-gray-600 text-xs mt-0.5">Use o e-mail do usuário no Pipefy. Se os cards usam nome, coloque o nome em aliases.</p>
              </div>
              {form.id && (
                <button type="button" onClick={resetForm} className="p-2 rounded text-gray-500 hover:text-white hover:bg-white/5">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div>
              <label className={LABEL}>Membro do site</label>
              <select value={form.userId} onChange={event => set('userId', event.target.value)} className={INPUT}>
                <option value="">Selecione um membro</option>
                {activeMembers.map(member => (
                  <option key={member.id} value={member.id}>{member.nome} — {member.cargo}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={LABEL}>E-mail no Pipefy</label>
              <div className="relative">
                <input
                  value={form.pipefyName}
                  onChange={event => set('pipefyName', event.target.value)}
                  placeholder="Ex: caiquepalauro12@gmail.com"
                  className={`${INPUT} pr-10`}
                />
                <Link2 className="w-4 h-4 text-gray-700 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className={LABEL}>Nomes/aliases extras</label>
              <input
                value={form.pipefyAliases}
                onChange={event => set('pipefyAliases', event.target.value)}
                placeholder="Separados por vírgula. Ex: Caique Palauro, Caíque"
                className={INPUT}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={form.active}
                onChange={event => set('active', event.target.checked)}
                className="accent-[#CE7028]"
              />
              Ativo na dashboard
            </label>

            {message && <p className="text-xs text-[#FF882D]">{message}</p>}

            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[#CE7028] hover:bg-[#FF882D] text-white font-semibold py-2.5 rounded transition-colors">
              {form.id ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {form.id ? 'Salvar alterações' : 'Adicionar vínculo'}
            </button>
          </form>

          <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-white font-bold text-sm uppercase tracking-wider">E-mails encontrados no Pipefy</h2>
                <p className="text-gray-600 text-xs mt-0.5">Clique para preencher o campo acima.</p>
              </div>
            </div>
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-gray-700 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Buscar e-mail ou nome..."
                className={`${INPUT} pl-9`}
              />
            </div>
            <div className="space-y-2 max-h-[330px] overflow-y-auto">
              {filteredPeople.length === 0 ? (
                <p className="text-sm text-gray-600 py-4">
                  Nenhum e-mail encontrado no snapshot atual. Você ainda pode digitar manualmente.
                </p>
              ) : filteredPeople.map(person => (
                <button
                  key={`${person.value}-${person.source}`}
                  type="button"
                  onClick={() => selectPipefyPerson(person)}
                  className="w-full text-left border border-[#1E1E1E] bg-[#0D0D0D] hover:border-[#CE7028]/50 rounded p-3 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-white text-sm font-semibold truncate">{person.email || person.label}</p>
                    <span className="text-[10px] text-gray-600">{person.count} card(s)</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {[person.name, person.source].filter(Boolean).join(' · ')}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
