import { useMemo, useState } from 'react'
import { BookUser, Briefcase, Mail, Phone, Search, Users, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import UserAvatar from '../components/UserAvatar'

const normalize = value => `${value || ''}`
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()

const idsEqual = (a, b) => String(a ?? '') === String(b ?? '')
const memberName = member => member?.name || member?.nome || 'Membro'
const memberRole = member => member?.cargo || member?.role || 'Membro PROJEP'
const memberSector = member => member?.setor || member?.department || 'Sem setor'
const memberPhone = member => member?.telefone || member?.phone || ''
const memberTags = member => member?.skills || member?.tags || []

function DetailRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 rounded border border-[#1E1E1E] bg-[#0D0D0D] p-3">
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#CE7028]" />
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</p>
        <p className="mt-1 text-sm text-white">{value}</p>
      </div>
    </div>
  )
}

function MemberModal({ member, onClose, isCurrentUser }) {
  const name = memberName(member)
  const role = memberRole(member)
  const sector = memberSector(member)
  const phone = memberPhone(member)
  const tags = memberTags(member)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded border border-[#1E1E1E] bg-[#111111] shadow-2xl"
        onClick={event => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#1E1E1E] p-5">
          <div className="flex items-center gap-4">
            <UserAvatar user={member} size={72} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{name}</h2>
                {isCurrentUser && (
                  <span className="rounded border border-[#CE7028]/40 bg-[#CE7028]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#FF882D]">
                    Voce
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400">{role}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-2 text-gray-500 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 p-5">
          <DetailRow icon={Briefcase} label="Setor" value={sector} />
          <DetailRow icon={Mail} label="Email" value={member.email} />
          <DetailRow icon={Phone} label="Telefone" value={phone} />

          {tags.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Tags</p>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span key={tag} className="rounded border border-[#1E1E1E] bg-[#0D0D0D] px-2 py-1 text-xs text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MemberCard({ member, onOpen, isCurrentUser }) {
  const name = memberName(member)
  const role = memberRole(member)
  const sector = memberSector(member)
  const tags = memberTags(member)

  return (
    <button
      type="button"
      onClick={() => onOpen(member)}
      className="group rounded border border-[#1E1E1E] bg-[#111111] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#CE7028]/60 hover:bg-[#151515]"
    >
      <div className="flex items-center gap-3">
        <UserAvatar user={member} size={42} textClassName="text-sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-bold text-white">{name}</h3>
            {isCurrentUser && (
              <span className="rounded bg-[#CE7028]/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#FF882D]">
                Voce
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-[#CE7028]">{role}</p>
          <p className="truncate text-xs text-gray-500">{sector}</p>
        </div>
      </div>

      <div className="mt-3 flex min-h-[24px] flex-wrap gap-1.5">
        {tags.slice(0, 3).map(tag => (
          <span key={tag} className="rounded border border-[#1E1E1E] bg-[#0D0D0D] px-2 py-0.5 text-[11px] text-gray-400">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-3 border-t border-[#1E1E1E] pt-2 text-[10px] font-semibold uppercase tracking-wider text-gray-600 transition-colors group-hover:text-[#CE7028]">
        Ver perfil resumido
      </div>
    </button>
  )
}

export default function Membros() {
  const { user } = useAuth()
  const { members } = useData()
  const [search, setSearch] = useState('')
  const [selectedMember, setSelectedMember] = useState(null)

  const activeMembers = useMemo(() => (
    (members || []).filter(member => member.status !== 'inativo')
  ), [members])

  const filteredMembers = useMemo(() => {
    const query = normalize(search)
    if (!query) return activeMembers
    return activeMembers.filter(member => {
      const haystack = normalize([
        member.name,
        member.nome,
        memberRole(member),
        memberSector(member),
        member.email,
        ...memberTags(member),
      ].filter(Boolean).join(' '))
      return haystack.includes(query)
    })
  }, [activeMembers, search])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded border border-[#CE7028]/30 bg-[#CE7028]/10 text-[#CE7028]">
              <BookUser className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Membros</h1>
              <p className="mt-1 text-gray-500">Diretorio com {activeMembers.length} membros ativos no sistema.</p>
            </div>
          </div>
        </div>

        <div className="relative w-full lg:w-[420px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Buscar por nome, cargo, setor ou email..."
            className="w-full rounded border border-[#1E1E1E] bg-[#111111] py-3 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-gray-700 focus:border-[#CE7028]"
          />
        </div>
      </div>

      {filteredMembers.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {filteredMembers.map(member => (
            <MemberCard
              key={member.id}
              member={member}
              onOpen={setSelectedMember}
              isCurrentUser={idsEqual(member.id, user?.id) || idsEqual(member.supabaseId, user?.supabaseId)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded border border-dashed border-[#1E1E1E] bg-[#111111] px-6 py-16 text-center">
          <Users className="mx-auto h-10 w-10 text-gray-700" />
          <h2 className="mt-4 text-lg font-bold text-white">Nenhum membro encontrado.</h2>
          <p className="mt-2 text-sm text-gray-500">Ajuste a busca ou cadastre membros em Gestao de Pessoas.</p>
        </div>
      )}

      {selectedMember && (
        <MemberModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          isCurrentUser={idsEqual(selectedMember.id, user?.id) || idsEqual(selectedMember.supabaseId, user?.supabaseId)}
        />
      )}
    </div>
  )
}
