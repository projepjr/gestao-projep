const EMPTY_FUNIL = {
  leadsCadastrados: 0,
  ligoesRealizadas: 0,
  ligacoesRealizadas: 0,
  reunioesMarcadas: 0,
  reunioesRealizadas: 0,
  propostas: 0,
  negociacoes: 0,
  contratosFechados: 0,
}

const EMPTY_KPIS = {
  ticketMedio: 0,
  receitaTotal: 0,
  contratosFechados: 0,
  taxaConversao: 0,
}

const EMPTY_PIPELINE = {
  cadastro: 0,
  naoContatados: 0,
  perdidos: 0,
  interesseFuturo: 0,
  diagnostico: 0,
  proposta: 0,
  negociacao: 0,
  ganhos: 0,
}

const normalize = value => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()

const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi

const includesAny = (value, words) => {
  const normalized = normalize(value)
  return words.some(word => normalized.includes(normalize(word)))
}

const toNumber = value => {
  if (typeof value === 'number') return value
  if (value == null) return 0
  const normalized = String(value)
    .replace(/[^\d,.-]/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(',', '.')
  return Number(normalized) || 0
}

const getInitials = name => String(name || '?')
  .split(/\s+/)
  .filter(Boolean)
  .map(part => part[0])
  .join('')
  .slice(0, 2)
  .toUpperCase()

function getCards(payload) {
  const raw = payload?.raw || {}
  const candidates = [
    payload?.cards,
    raw.cards,
    raw.pipeCards,
    raw.pipefyCards,
    raw.data?.cards,
    raw.data?.allCards?.edges?.map(edge => edge.node),
    raw.data?.pipe?.cards?.edges?.map(edge => edge.node),
  ]
  return candidates.find(Array.isArray) || []
}

function getCardFields(card) {
  const fields = card?.fields || card?.card_fields || card?.field_values || card?.fields_attributes || []
  if (!Array.isArray(fields)) return []
  return fields.map(field => ({
    label: field.label || field.name || field.field?.label || field.field?.name || field.field?.id || '',
    value: field.value ?? field.report_value ?? field.native_value ?? field.array_value ?? field.filled_value ?? '',
  }))
}

function unpackFieldValue(value) {
  if (Array.isArray(value)) return value.flatMap(unpackFieldValue)
  if (typeof value !== 'string') return [value]
  const trimmed = value.trim()
  if (!trimmed) return []
  if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
    try {
      const parsed = JSON.parse(trimmed)
      return Array.isArray(parsed) ? parsed.flatMap(unpackFieldValue) : [parsed.name || parsed.email || parsed.label || trimmed]
    } catch {
      return [trimmed]
    }
  }
  return [trimmed]
}

function getFieldValue(card, keywords) {
  const found = getCardFields(card).find(field => includesAny(field.label, keywords))
  if (!found) return ''
  return unpackFieldValue(found.value).join(', ')
}

function getFieldValues(card, keywords) {
  return getCardFields(card)
    .filter(field => includesAny(field.label, keywords))
    .flatMap(field => unpackFieldValue(field.value))
    .map(value => String(value || '').trim())
    .filter(Boolean)
}

function getStageName(card) {
  return card?.current_phase?.name ||
    card?.currentPhase?.name ||
    card?.phase?.name ||
    card?.phaseName ||
    card?.stage ||
    getFieldValue(card, ['fase', 'status pipefy', 'etapa']) ||
    ''
}

function getCardValue(card) {
  return toNumber(
    getFieldValue(card, ['valor', 'ticket', 'orcamento', 'orçamento', 'receita']) ||
    card?.value ||
    card?.amount,
  )
}

function getMeetingStatus(card) {
  return getFieldValue(card, ['status reuniao', 'status reunião', 'reuniao', 'reunião', 'diagnostico', 'diagnóstico'])
}

function classifyPipeline(card) {
  const stage = getStageName(card)
  if (includesAny(stage, ['ganho', 'fechado', 'contrato assinado'])) return 'ganhos'
  if (includesAny(stage, ['negociacao', 'negociação'])) return 'negociacao'
  if (includesAny(stage, ['proposta'])) return 'proposta'
  if (includesAny(stage, ['diagnostico', 'diagnóstico', 'reuniao', 'reunião'])) return 'diagnostico'
  if (includesAny(stage, ['interesse futuro', 'futuro', 'retornar depois'])) return 'interesseFuturo'
  if (includesAny(stage, ['perdido', 'perda'])) return 'perdidos'
  if (includesAny(stage, ['nao contatado', 'não contatado', 'sem contato'])) return 'naoContatados'
  return 'cadastro'
}

function wasMeetingScheduled(card) {
  const stage = getStageName(card)
  const status = getMeetingStatus(card)
  return includesAny(`${stage} ${status}`, ['diagnostico', 'diagnóstico', 'reuniao', 'reunião', 'proposta', 'negociacao', 'negociação', 'ganho', 'fechado', 'agendada'])
}

function wasMeetingDone(card) {
  const stage = getStageName(card)
  const status = getMeetingStatus(card)
  return includesAny(`${stage} ${status}`, ['realizada', 'aconteceu', 'compareceu', 'proposta', 'negociacao', 'negociação', 'ganho', 'fechado'])
}

function wasNoShow(card) {
  return includesAny(getMeetingStatus(card), ['no-show', 'noshow', 'nao compareceu', 'não compareceu'])
}

function buildMemberIndex(members = []) {
  const index = new Map()
  for (const member of members) {
    const values = [
      member.id,
      member.supabaseId,
      member.nome,
      member.name,
      member.email,
      ...(member.emailAliases || []),
    ]
    for (const value of values) {
      const key = normalize(value)
      if (key) index.set(key, member)
    }
  }
  return index
}

function matchMember(value, index) {
  const normalized = normalize(value)
  if (!normalized) return null
  if (index.has(normalized)) return index.get(normalized)

  for (const [key, member] of index.entries()) {
    if (normalized.includes(key) || key.includes(normalized)) return member
  }
  return null
}

function getCardAssignees(card) {
  const assignees = card?.assignees || card?.members || card?.responsibles || []
  if (!Array.isArray(assignees)) return []
  return assignees.map(item => item?.email || item?.name || item?.username || item?.id).filter(Boolean)
}

function getCardAssigneePeople(card) {
  const assignees = card?.assignees || card?.members || card?.responsibles || []
  if (!Array.isArray(assignees)) return []
  return assignees.map(item => ({
    name: item?.name || item?.username || '',
    email: item?.email || '',
  })).filter(item => item.name || item.email)
}

function getResponsibleMember(card, type, memberIndex) {
  const fieldKeywords = type === 'hunter'
    ? ['hunter', 'prospector', 'responsavel prospeccao', 'responsável prospecção']
    : ['closer', 'fechador', 'responsavel fechamento', 'responsável fechamento']

  const fieldValue = getFieldValue(card, fieldKeywords)
  const fieldMember = matchMember(fieldValue, memberIndex)
  if (fieldMember) return fieldMember

  for (const assignee of getCardAssignees(card)) {
    const member = matchMember(assignee, memberIndex)
    if (member) return member
  }
  return null
}

function buildBasePeople(type, members = [], commercial = {}) {
  const configured = (commercial.equipe?.[type === 'hunter' ? 'hunters' : 'closers'] || [])
    .filter(item => item.active !== false)
    .map(item => {
      const member = members.find(candidate => String(candidate.id) === String(item.userId))
      return {
        id: item.id || `${type}-${member?.id || item.userId}`,
        userId: item.userId || member?.id,
        nome: member?.nome || item.nome || item.pipefyName,
        pipefyName: item.pipefyName || '',
        pipefyAliases: Array.isArray(item.pipefyAliases) ? item.pipefyAliases : [],
      }
    })

  const byUser = new Map()
  for (const person of configured) {
    const key = String(person.userId || person.nome || person.id)
    if (!byUser.has(key) && person.nome) byUser.set(key, person)
  }
  return [...byUser.values()]
}

function buildTeamIndex(type, rows = [], members = []) {
  const index = new Map()
  for (const row of rows) {
    const member = members.find(item => String(item.id) === String(row.userId))
    const values = [
      row.pipefyName,
      ...(row.pipefyAliases || []),
      member?.nome,
      member?.email,
      member?.supabaseId,
      member?.id,
    ]
    for (const value of values) {
      const key = normalize(value)
      if (key) index.set(key, { ...member, id: row.userId || member?.id, nome: member?.nome || row.nome || row.pipefyName })
    }
  }
  return index
}

function matchTeamValue(value, index) {
  const normalized = normalize(value)
  if (!normalized) return null
  if (index.has(normalized)) return index.get(normalized)
  for (const [key, member] of index.entries()) {
    if (normalized.includes(key) || key.includes(normalized)) return member
  }
  return null
}

function getResponsibleTeamMember(card, type, teamIndex) {
  const fieldKeywords = type === 'hunter'
    ? ['hunter', 'prospector', 'responsavel prospeccao', 'responsável prospecção', 'responsavel', 'responsável']
    : ['closer', 'fechador', 'email do closer', 'responsavel fechamento', 'responsável fechamento']

  const values = [
    ...getFieldValues(card, fieldKeywords),
    ...getCardAssignees(card),
  ]

  for (const value of values) {
    const member = matchTeamValue(value, teamIndex)
    if (member) return member
  }
  return null
}

function createHunterRows(members, commercial) {
  return buildBasePeople('hunter', members, commercial).map(person => ({
    id: person.id,
    userId: person.userId,
    nome: person.nome,
    contatadas: 0,
    reunioesMarcadas: 0,
    reunioesRealizadas: 0,
    noShows: 0,
  }))
}

function createCloserRows(members, commercial) {
  return buildBasePeople('closer', members, commercial).map(person => ({
    id: person.id,
    userId: person.userId,
    nome: person.nome,
    reunioesRealizadas: 0,
    noShows: 0,
    emNegociacao: 0,
    contratosFechados: 0,
  }))
}

function findOrCreateRow(rows, member) {
  if (!member) return null
  const userId = member.id
  let row = rows.find(item => String(item.userId) === String(userId))
  if (row) return row
  return null
}

function buildMetricsFromCards(cards, members, commercial) {
  const pipeline = { ...EMPTY_PIPELINE }
  const funil = { ...EMPTY_FUNIL, leadsCadastrados: cards.length }
  const hunters = createHunterRows(members, commercial)
  const closers = createCloserRows(members, commercial)
  const hunterIndex = buildTeamIndex('hunter', commercial.equipe?.hunters || [], members)
  const closerIndex = buildTeamIndex('closer', commercial.equipe?.closers || [], members)
  let receitaTotal = 0

  for (const card of cards) {
    const pipelineKey = classifyPipeline(card)
    pipeline[pipelineKey] += 1
    funil.ligoesRealizadas += includesAny(getFieldValue(card, ['ligacao', 'ligação', 'contato realizado']), ['sim', 'realizada', 'feito', 'true', '1'])
      ? 1
      : 0
    if (wasMeetingScheduled(card)) funil.reunioesMarcadas += 1
    if (wasMeetingDone(card)) funil.reunioesRealizadas += 1
    if (['proposta', 'negociacao', 'ganhos'].includes(pipelineKey)) funil.propostas += 1
    if (['negociacao', 'ganhos'].includes(pipelineKey)) funil.negociacoes += 1
    if (pipelineKey === 'ganhos') {
      funil.contratosFechados += 1
      receitaTotal += getCardValue(card)
    }

    const hunter = findOrCreateRow(hunters, getResponsibleTeamMember(card, 'hunter', hunterIndex))
    if (hunter) {
      hunter.contatadas += 1
      if (wasMeetingScheduled(card)) hunter.reunioesMarcadas += 1
      if (wasMeetingDone(card)) hunter.reunioesRealizadas += 1
      if (wasNoShow(card)) hunter.noShows += 1
    }

    const closer = findOrCreateRow(closers, getResponsibleTeamMember(card, 'closer', closerIndex))
    if (closer) {
      if (wasMeetingDone(card)) closer.reunioesRealizadas += 1
      if (wasNoShow(card)) closer.noShows += 1
      if (pipelineKey === 'negociacao') closer.emNegociacao += 1
      if (pipelineKey === 'ganhos') closer.contratosFechados += 1
    }
  }

  if (!funil.ligoesRealizadas) funil.ligoesRealizadas = cards.length
  funil.ligacoesRealizadas = funil.ligoesRealizadas

  return {
    funil,
    pipeline,
    hunters,
    closers,
    kpis: {
      ticketMedio: funil.contratosFechados ? receitaTotal / funil.contratosFechados : 0,
      receitaTotal,
      contratosFechados: funil.contratosFechados,
      taxaConversao: funil.leadsCadastrados ? (funil.contratosFechados / funil.leadsCadastrados) * 100 : 0,
    },
  }
}

export function mapComercialSnapshot(payload, { members = [], commercial = {} } = {}) {
  if (!payload) return null

  // TODO: substituir este payload por chamadas normalizadas do Supabase quando
  // o n8n gravar cards e metadados separados por tabela.
  const cards = getCards(payload)
  const computed = cards.length ? buildMetricsFromCards(cards, members, commercial) : null
  const funil = {
    ...EMPTY_FUNIL,
    ...(computed?.funil || {}),
    ...(payload.funil || {}),
  }
  funil.ligoesRealizadas = funil.ligoesRealizadas || funil.ligacoesRealizadas || 0
  funil.ligacoesRealizadas = funil.ligacoesRealizadas || funil.ligoesRealizadas || 0

  const pipeline = {
    ...EMPTY_PIPELINE,
    ...(computed?.pipeline || {}),
    ...(payload.pipeline || {}),
  }

  return {
    id: payload.periodo?.id || 'pipefy-live',
    label: payload.periodo?.label || 'Pipefy ao vivo',
    inicio: new Date().toISOString().split('T')[0],
    fim: new Date().toISOString().split('T')[0],
    ultimaAtualizacao: payload.periodo?.atualizadoEm || new Date().toISOString(),
    funil,
    hunters: computed?.hunters || (Array.isArray(payload.hunters) && payload.hunters.length
      ? payload.hunters
      : createHunterRows(members, commercial)),
    closers: computed?.closers || (Array.isArray(payload.closers) && payload.closers.length
      ? payload.closers
      : createCloserRows(members, commercial)),
    kpis: {
      ...EMPTY_KPIS,
      ...(computed?.kpis || {}),
      ...(payload.kpis || {}),
      contratosFechados: payload.kpis?.contratosFechados ?? computed?.kpis?.contratosFechados ?? funil.contratosFechados ?? 0,
    },
    pipeline,
    raw: payload.raw || {},
    fonte: payload.fonte || 'pipefy',
    pipe: payload.pipe || null,
    cardsMapeados: cards.length,
  }
}

export function extractPipefyPeopleFromSnapshot(payload) {
  const cards = getCards(payload)
  const people = new Map()

  const extractEmails = value => String(value || '').match(EMAIL_REGEX) || []

  const add = ({ email, name, source, count = 1 }) => {
    const cleanEmail = String(email || '').trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes('@')) return
    const key = normalize(cleanEmail)
    if (!people.has(key)) {
      people.set(key, {
        value: cleanEmail,
        label: cleanEmail,
        email: cleanEmail,
        name: String(name || '').trim(),
        aliases: String(name || '').trim() ? [String(name).trim()] : [],
        source,
        count: 0,
      })
    }
    const item = people.get(key)
    item.count += count
    if (name && !item.name) item.name = String(name).trim()
    if (name && !item.aliases.includes(String(name).trim())) item.aliases.push(String(name).trim())
    if (!item.source.includes(source)) item.source = `${item.source}, ${source}`
  }

  const normalizePipefyMember = item => {
    const user = item?.user || item?.member || item?.person || item?.node || item
    return {
      name: user?.name || user?.full_name || item?.name || item?.label || '',
      email: user?.email || item?.email || '',
    }
  }

  const raw = payload?.raw || {}
  const memberCandidates = [
    payload?.pipeMembers,
    payload?.pipefyMembers,
    payload?.people,
    payload?.members,
    raw.pipeMembers,
    raw.pipefyMembers,
    raw.people,
    raw.members,
    raw.pipe?.members,
    raw.data?.pipe?.members,
    raw.data?.pipe?.members?.edges?.map(edge => edge.node),
    payload?.pipe?.members,
  ]
  const pipeMembers = memberCandidates.find(Array.isArray) || []

  pipeMembers
    .map(normalizePipefyMember)
    .forEach(member => add({ ...member, source: 'Pessoa do pipe', count: 0 }))

  for (const row of payload?.hunters || []) {
    extractEmails(row.email || row.pipefyName || row.nome || row.name)
      .forEach(email => add({ email, name: row.nome || row.name, source: 'Hunter' }))
  }
  for (const row of payload?.closers || []) {
    extractEmails(row.email || row.pipefyName || row.nome || row.name)
      .forEach(email => add({ email, name: row.nome || row.name, source: 'Closer' }))
  }

  for (const card of cards) {
    getFieldValues(card, ['hunter', 'responsavel prospeccao', 'responsável prospecção', 'responsavel', 'responsável'])
      .forEach(value => extractEmails(value).forEach(email => add({ email, source: 'Responsável' })))
    getFieldValues(card, ['closer', 'email do closer', 'responsavel fechamento', 'responsável fechamento'])
      .forEach(value => extractEmails(value).forEach(email => add({ email, source: 'Closer' })))
    getCardAssigneePeople(card).forEach(person => {
      if (person.email) add({ email: person.email, name: person.name, source: 'Assignee' })
      extractEmails(person.name).forEach(email => add({ email, name: person.name, source: 'Assignee' }))
    })
  }

  return [...people.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}
