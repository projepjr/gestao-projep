const EMPTY_FUNIL = {
  leadsCadastrados: 0,
  leadsTrabalhados: 0,
  tentativasContato: 0,
  ligoesRealizadas: 0,
  ligacoesRealizadas: 0,
  interesseFuturo: 0,
  diagnosticasAgendadas: 0,
  diagnosticasRealizadas: 0,
  noShowsDiagnostica: 0,
  reunioesMarcadas: 0,
  reunioesRealizadas: 0,
  propostasAgendadas: 0,
  propostasRealizadas: 0,
  noShowsProposta: 0,
  propostas: 0,
  negociacoes: 0,
  pendentesNoShow: 0,
  contratosFechados: 0,
  perdidos: 0,
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
  agendamentosPendentes: 0,
  ganhos: 0,
}

const normalize = value => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()

const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
const idsEqual = (a, b) => String(a ?? '') === String(b ?? '')

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

const toDateOnly = date => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

const parseDateValue = value => {
  if (Array.isArray(value)) {
    for (const item of value) {
      const parsed = parseDateValue(item)
      if (parsed) return parsed
    }
    return null
  }

  if (value && typeof value === 'object') {
    return parseDateValue(value.date || value.datetime || value.value || value.label || value.name)
  }

  const text = String(value || '').trim()
  if (!text) return null

  const br = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?\b/)
  if (br) {
    const [, day, month, year, hour = '0', minute = '0'] = br
    return toDateOnly(new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)))
  }

  const iso = text.match(/\b(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?\b/)
  if (iso) {
    const [, year, month, day, hour = '0', minute = '0'] = iso
    return toDateOnly(new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)))
  }

  const native = new Date(text)
  return Number.isNaN(native.getTime()) ? null : toDateOnly(native)
}

function getRangeBounds(range) {
  if (!range?.inicio || !range?.fim) return null
  const start = parseDateValue(range.inicio)
  const end = parseDateValue(range.fim)
  if (!start || !end) return null
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

function isDateInsideRange(date, range) {
  if (!range?.inicio || !range?.fim) return true
  const bounds = getRangeBounds(range)
  if (!bounds || !date) return false
  return date >= bounds.start && date <= bounds.end
}

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

function getFirstFieldDate(card, keywords) {
  for (const value of getFieldValues(card, keywords)) {
    const parsed = parseDateValue(value)
    if (parsed) return parsed
  }
  return null
}

function hasFieldDateInRange(card, keywords, range) {
  const values = getFieldValues(card, keywords)
  if (!values.length) return false
  if (!range?.inicio || !range?.fim) return values.some(value => parseDateValue(value))
  return values.some(value => isDateInsideRange(parseDateValue(value), range))
}

function getPhaseHistory(card) {
  const history = card?.phases_history || card?.phasesHistory || card?.history || []
  return Array.isArray(history) ? history : []
}

function enteredStageInRange(card, stageKeywords, range) {
  const history = getPhaseHistory(card)
  if (!history.length) return false
  return history.some(item => {
    const phaseName = item?.phase?.name || item?.phaseName || item?.name || ''
    if (!includesAny(phaseName, stageKeywords)) return false
    const enteredAt = parseDateValue(item?.firstTimeIn || item?.entered_at || item?.created_at)
    return isDateInsideRange(enteredAt, range)
  })
}

function currentOrHistoricalStage(card, stageKeywords, range) {
  if (range?.inicio && range?.fim) return enteredStageInRange(card, stageKeywords, range)
  return includesAny(getStageName(card), stageKeywords) || enteredStageInRange(card, stageKeywords, null)
}

function getCardDate(card) {
  const prioritizedLabels = [
    ['data de cadastro', 'data cadastro'],
    ['data da primeira ligacao', 'data da primeira ligação', 'data de ligacao', 'data de ligação', 'data do contato', 'data contato', 'primeira tentativa de contato'],
    ['data e hora da diagnostica agendada', 'data e hora da diagnóstica agendada', 'data e hora da diagnostica', 'data e hora da diagnóstica'],
    ['data da diagnostica realizada', 'data da diagnóstica realizada'],
    ['data e hora da reuniao de proposta', 'data e hora da reunião de proposta'],
    ['data da proposta realizada'],
    ['data de entrada em negociacao', 'data de entrada em negociação'],
    ['data de fechamento do contrato', 'data da assinatura do contrato', 'data do fechamento'],
    ['data de criacao', 'data de criação', 'created at', 'created_at'],
  ]

  for (const labels of prioritizedLabels) {
    for (const value of getFieldValues(card, labels)) {
      const parsed = parseDateValue(value)
      if (parsed) return parsed
    }
  }

  const directDates = [
    card?.created_at,
    card?.createdAt,
    card?.updated_at,
    card?.updatedAt,
    card?.due_date,
    card?.dueDate,
  ]
  for (const value of directDates) {
    const parsed = parseDateValue(value)
    if (parsed) return parsed
  }

  for (const field of getCardFields(card)) {
    if (!includesAny(field.label, ['data', 'date'])) continue
    const parsed = parseDateValue(field.value)
    if (parsed) return parsed
  }

  return null
}

const memberMatchesId = (member, id) =>
  idsEqual(member?.id, id) ||
  idsEqual(member?.supabaseId, id)

function filterCardsByRange(cards, range) {
  if (!range?.inicio || !range?.fim) return cards
  const bounds = getRangeBounds(range)
  if (!bounds) return cards
  return cards.filter(card => {
    const cardDate = getCardDate(card)
    if (cardDate && cardDate >= bounds.start && cardDate <= bounds.end) return true
    return getCardFields(card).some(field => {
      if (!includesAny(field.label, ['data', 'date'])) return false
      return isDateInsideRange(parseDateValue(field.value), range)
    })
  })
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
    getFieldValue(card, ['valor do projeto', 'valor fechado', 'valor da proposta', 'valor', 'ticket', 'orcamento', 'orçamento', 'receita']) ||
    card?.value ||
    card?.amount,
  )
}

function getDiagnosticStatus(card) {
  return getFieldValue(card, ['status da diagnostica', 'status da diagnóstica'])
}

function getProposalStatus(card) {
  return getFieldValue(card, ['status da reuniao de proposta', 'status da reunião de proposta'])
}

function getContractStatus(card) {
  return getFieldValue(card, ['contrato fechado', 'virou contrato'])
}

function statusIsRealized(status) {
  return includesAny(status, ['realizada', 'aconteceu', 'compareceu'])
}

function statusIsNoShow(status) {
  return includesAny(status, ['no-show', 'noshow', 'nao compareceu', 'não compareceu'])
}

function classifyPipeline(card) {
  const stage = getStageName(card)
  if (includesAny(stage, ['ganho', 'fechado', 'contrato assinado', 'contratos fechados'])) return 'ganhos'
  if (includesAny(stage, ['negociacao', 'negociação'])) return 'negociacao'
  if (includesAny(stage, ['proposta'])) return 'proposta'
  if (includesAny(stage, ['pendentes / no-show', 'pendente / no-show', 'no-show', 'no show', 'agendamentos pendentes', 'agendamento pendente'])) return 'agendamentosPendentes'
  if (includesAny(stage, ['diagnostico', 'diagnóstico', 'diagnostica', 'diagnóstica', 'reuniao', 'reunião'])) return 'diagnostico'
  if (includesAny(stage, ['interesse futuro', 'futuro', 'retornar depois'])) return 'interesseFuturo'
  if (includesAny(stage, ['perdido', 'perda'])) return 'perdidos'
  if (includesAny(stage, ['nao contatado', 'não contatado', 'sem contato', 'ligacoes', 'ligações', 'contato'])) return 'naoContatados'
  return 'cadastro'
}

const EVENT_LABELS = {
  leadCreated: ['data de cadastro', 'data cadastro', 'data de criacao', 'data de criação', 'created at', 'created_at'],
  contact: [
    'data da primeira ligacao',
    'data da primeira ligação',
    'data de ligacao',
    'data de ligação',
    'data do contato',
    'data contato',
    'primeira tentativa de contato',
    'segunda tentativa de contato',
    'terceira tentativa de contato',
  ],
  diagnosticScheduled: [
    'para que data e hora ficou agendado',
    'data e hora da diagnostica agendada',
    'data e hora da diagnóstica agendada',
    'data e hora da diagnostica',
    'data e hora da diagnóstica',
  ],
  diagnosticDone: [
    'data da diagnostica realizada',
    'data da diagnóstica realizada',
    'data de realizacao da diagnostica',
    'data de realização da diagnóstica',
    'data que foi realizada',
  ],
  proposalScheduled: [
    'data e hora da proposta agendada',
    'data da proposta agendada',
    'data e hora da reuniao de proposta',
    'data e hora da reunião de proposta',
    'data da reuniao de proposta',
    'data da reunião de proposta',
  ],
  proposalDone: [
    'data da proposta realizada',
    'data de realizacao da proposta',
    'data de realização da proposta',
  ],
  negotiation: ['data de entrada em negociacao', 'data de entrada em negociação'],
  contract: ['data de fechamento do contrato', 'data da assinatura do contrato', 'data do fechamento'],
  noShow: ['data do no-show', 'data do no show'],
}

const STAGE_KEYWORDS = {
  cadastro: ['leads cadastrados', 'cadastro'],
  contact: ['ligacoes', 'ligações', 'contato', 'tentativa de contato', 'tentativas de contato', 'nao contatados', 'não contatados'],
  futureInterest: ['interesse futuro', 'futuro'],
  diagnosticScheduled: ['diagnostica agendada', 'diagnóstica agendada', 'diagnostico agendado', 'diagnóstico agendado'],
  diagnosticDone: ['diagnostica realizada', 'diagnóstica realizada', 'diagnostico realizado', 'diagnóstico realizado'],
  proposalScheduled: ['proposta agendada'],
  proposalDone: ['proposta realizada'],
  negotiation: ['negociacao', 'negociação'],
  contract: ['contratos fechados', 'ganhos', 'ganho', 'fechado', 'contrato assinado'],
  lost: ['perdido', 'perdidos', 'perda'],
  pendingScheduling: ['pendentes / no-show', 'pendente / no-show', 'pendentes no-show', 'pendente no-show', 'no-show', 'no show', 'agendamentos pendentes', 'agendamento pendente'],
}

const PIPEFY_2026_STAGE_GROUPS = {
  cadastro: ['leads cadastrados', 'cadastro'],
  workedOrLater: ['tentativa de contato', 'tentativas de contato', 'nao contatado', 'não contatado', 'interesse futuro', 'diagnostica agendada', 'diagnóstica agendada', 'diagnostica realizada', 'diagnóstica realizada', 'proposta agendada', 'proposta realizada', 'negociacao', 'negociação', 'agendamentos pendentes', 'contratos fechados', 'perdidos'],
  diagnosticScheduledOrLater: ['diagnostica agendada', 'diagnóstica agendada', 'diagnostica realizada', 'diagnóstica realizada', 'proposta agendada', 'proposta realizada', 'negociacao', 'negociação', 'pendentes / no-show', 'pendente / no-show', 'agendamentos pendentes', 'contratos fechados'],
  diagnosticDoneOrLater: ['diagnostica realizada', 'diagnóstica realizada', 'proposta agendada', 'proposta realizada', 'negociacao', 'negociação', 'contratos fechados'],
  proposalScheduledOrLater: ['proposta agendada', 'proposta realizada', 'negociacao', 'negociação', 'pendentes / no-show', 'pendente / no-show', 'agendamentos pendentes', 'contratos fechados'],
  proposalDoneOrLater: ['proposta realizada', 'negociacao', 'negociação', 'contratos fechados'],
}

const FUNNEL_RANKS = {
  contacted: 1,
  diagnosticScheduled: 2,
  diagnosticDone: 3,
  proposalScheduled: 4,
  proposalDone: 5,
  negotiation: 6,
  contract: 7,
}

function getNoShowStageType(card) {
  const stageValue = getFieldValue(card, ['etapa que aconteceu no-show', 'etapa que aconteceu no show'])
  if (includesAny(stageValue, ['proposta'])) return 'proposta'
  if (includesAny(stageValue, ['diagnostica', 'diagnóstica', 'diagnostico', 'diagnóstico'])) return 'diagnostica'
  return ''
}

function rankFromStageName(stageName, card = null) {
  if (includesAny(stageName, STAGE_KEYWORDS.contract)) return FUNNEL_RANKS.contract
  if (includesAny(stageName, STAGE_KEYWORDS.negotiation)) return FUNNEL_RANKS.negotiation
  if (includesAny(stageName, STAGE_KEYWORDS.proposalDone)) return FUNNEL_RANKS.proposalDone
  if (includesAny(stageName, STAGE_KEYWORDS.proposalScheduled)) return FUNNEL_RANKS.proposalScheduled
  if (includesAny(stageName, STAGE_KEYWORDS.diagnosticDone)) return FUNNEL_RANKS.diagnosticDone
  if (includesAny(stageName, STAGE_KEYWORDS.diagnosticScheduled)) return FUNNEL_RANKS.diagnosticScheduled
  if (includesAny(stageName, STAGE_KEYWORDS.pendingScheduling)) {
    const noShowType = card ? getNoShowStageType(card) : ''
    if (noShowType === 'proposta') return FUNNEL_RANKS.proposalScheduled
    if (noShowType === 'diagnostica') return FUNNEL_RANKS.diagnosticScheduled
    return FUNNEL_RANKS.diagnosticScheduled
  }
  if (includesAny(stageName, STAGE_KEYWORDS.contact) || includesAny(stageName, ['interesse futuro', 'futuro'])) return FUNNEL_RANKS.contacted
  return 0
}

function maxHistoricalRank(card) {
  return getPhaseHistory(card).reduce((max, item) => {
    const phaseName = item?.phase?.name || item?.phaseName || item?.name || ''
    return Math.max(max, rankFromStageName(phaseName))
  }, 0)
}

function getCurrentFunnelRank(card) {
  const currentRank = rankFromStageName(getStageName(card), card)
  if (currentRank) return currentRank
  if (currentStageMatches(card, STAGE_KEYWORDS.lost)) return maxHistoricalRank(card)
  return currentRank
}

function canCountStage(card, targetRank) {
  return getCurrentFunnelRank(card) >= targetRank
}

function currentStageInPeriod(card, stageKeywords, range) {
  if (!currentStageMatches(card, stageKeywords)) return false
  if (!range?.inicio || !range?.fim) return true
  return enteredStageInRange(card, stageKeywords, range)
}

function hasFieldValue(card, keywords) {
  return getFieldValues(card, keywords).some(value => String(value || '').trim())
}

function cardCreatedInPeriod(card, range) {
  if (!range?.inicio || !range?.fim) return true
  const date = getFirstFieldDate(card, EVENT_LABELS.leadCreated) ||
    parseDateValue(card?.created_at) ||
    parseDateValue(card?.createdAt)
  return isDateInsideRange(date, range)
}

function fieldEventInPeriod(card, labels, range) {
  if (range?.inicio && range?.fim) return hasFieldDateInRange(card, labels, range)
  return hasFieldValue(card, labels)
}

function contactAttemptInPeriod(card, range) {
  if (range?.inicio && range?.fim) return hasFieldDateInRange(card, EVENT_LABELS.contact, range)
  return hasFieldValue(card, EVENT_LABELS.contact) ||
    hasReachedStage(card, STAGE_KEYWORDS.contact, EVENT_LABELS.contact)
}

function contactStageInPeriod(card, range) {
  if (!currentStageMatches(card, STAGE_KEYWORDS.contact)) return false
  if (range?.inicio && range?.fim) return hasFieldDateInRange(card, EVENT_LABELS.contact, range)
  return true
}

function stageEventInPeriod(card, keywords, range) {
  return currentOrHistoricalStage(card, keywords, range)
}

function eventStatusInPeriod(card, status, labels, stageKeywords, range, predicate) {
  if (!predicate(status)) return false
  if (range?.inicio && range?.fim) {
    return fieldEventInPeriod(card, labels, range) || stageEventInPeriod(card, stageKeywords, range)
  }
  return true
}

function currentStageMatches(card, keywords) {
  return includesAny(getStageName(card), keywords)
}

function hasReachedStage(card, stageKeywords, fieldLabels = []) {
  if (currentStageMatches(card, stageKeywords)) return true
  if (enteredStageInRange(card, stageKeywords, null)) return true
  if (fieldLabels.length && !currentStageMatches(card, PIPEFY_2026_STAGE_GROUPS.cadastro)) {
    return hasFieldValue(card, fieldLabels)
  }
  return false
}

function eventReachedInPeriod(card, fieldLabels, stageKeywords, range, targetRank = null) {
  if (targetRank && !canCountStage(card, targetRank)) return false
  if (!range?.inicio || !range?.fim) return hasReachedStage(card, stageKeywords, fieldLabels)
  if (enteredStageInRange(card, stageKeywords, range)) return true
  if (!hasReachedStage(card, stageKeywords, fieldLabels)) return false
  return hasFieldDateInRange(card, fieldLabels, range)
}

function isNoShowFor(card, type, range) {
  const noShowType = getNoShowStageType(card)
  const flagValue = getFieldValue(card, ['no-show confirmado', 'no show confirmado', 'foi no-show', 'foi no show'])
  const hasNoShowFlag = includesAny(flagValue, ['sim', 'true', 'yes', 'no-show', 'no show', 'noshow'])
  const hasNoShowDate = hasFieldValue(card, EVENT_LABELS.noShow)
  const typeMatches = noShowType === type
  if ((!hasNoShowFlag && !hasNoShowDate) || !typeMatches) return false
  if (!range?.inicio || !range?.fim) return true
  return hasFieldDateInRange(card, EVENT_LABELS.noShow, range) ||
    enteredStageInRange(card, STAGE_KEYWORDS.pendingScheduling, range)
}

function contractWasClosed(card) {
  const status = getContractStatus(card)
  if (!status) return includesAny(getStageName(card), STAGE_KEYWORDS.contract)
  return includesAny(status, ['sim', 'fechado', 'assinado', 'ganho', 'true', '1'])
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

function normalizePipefyMember(item) {
  const user = item?.user || item?.member || item?.person || item?.node || item
  return {
    id: user?.id || item?.id || '',
    name: user?.name || user?.full_name || item?.name || item?.label || '',
    email: String(user?.email || item?.email || '').trim().toLowerCase(),
  }
}

function getPipeMembers(payload) {
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
  return (memberCandidates.find(Array.isArray) || [])
    .map(normalizePipefyMember)
    .filter(member => member.email || member.name)
}

function buildBasePeople(type, members = [], commercial = {}) {
  const configured = (commercial.equipe?.[type === 'hunter' ? 'hunters' : 'closers'] || [])
    .filter(item => item.active !== false)
    .map(item => {
      const member = members.find(candidate => memberMatchesId(candidate, item.userId))
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

function buildTeamIndex(type, rows = [], members = [], pipeMembers = []) {
  const index = new Map()
  for (const row of rows) {
    const member = members.find(item => memberMatchesId(item, row.userId))
    const rowKeys = [
      row.pipefyName,
      ...(row.pipefyAliases || []),
      member?.email,
      member?.nome,
    ].map(normalize).filter(Boolean)
    const pipeMember = pipeMembers.find(item => {
      const values = [item.email, item.name, item.id].map(normalize).filter(Boolean)
      return values.some(value => rowKeys.some(key => value === key || value.includes(key) || key.includes(value)))
    })
    const values = [
      row.pipefyName,
      ...(row.pipefyAliases || []),
      member?.nome,
      member?.email,
      member?.supabaseId,
      member?.id,
      pipeMember?.name,
      pipeMember?.email,
      pipeMember?.id,
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
    ? ['hunter', 'prospector', 'responsaveis pela diagnostica', 'responsáveis pela diagnóstica', 'responsavel prospeccao', 'responsável prospecção', 'responsavel', 'responsável']
    : ['closer responsavel', 'closer responsável', 'responsavel pela proposta', 'responsável pela proposta', 'responsaveis pela proposta', 'responsáveis pela proposta', 'responsaveis pela apresentacao de proposta', 'responsáveis pela apresentação de proposta', 'responsavel pela negociacao', 'responsável pela negociação', 'responsaveis pelo contrato', 'responsáveis pelo contrato', 'responsaveis pelo fechamento', 'responsáveis pelo fechamento', 'closer', 'fechador', 'email do closer', 'responsavel fechamento', 'responsável fechamento']

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
    propostasAgendadas: 0,
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

// Classifica cada card pelo fase ATUAL do Pipefy (para o funil ao-vivo).
// Retorna contagens por fase corrente, sem uso de histórico de movimentação.
function buildFunilByCurrentPhase(cards) {
  const f = { ...EMPTY_FUNIL }

  for (const card of cards) {
    const stage = getStageName(card)
    // leadsCadastrados = total de leads (denominador do funil)
    f.leadsCadastrados += 1

    if (includesAny(stage, STAGE_KEYWORDS.contract)) {
      f.contratosFechados++
      f.leadsTrabalhados++
    } else if (includesAny(stage, STAGE_KEYWORDS.negotiation)) {
      f.negociacoes++
      f.leadsTrabalhados++
    } else if (includesAny(stage, STAGE_KEYWORDS.proposalDone)) {
      f.propostasRealizadas++
      f.leadsTrabalhados++
    } else if (includesAny(stage, STAGE_KEYWORDS.proposalScheduled)) {
      f.propostasAgendadas++
      f.propostas++
      f.leadsTrabalhados++
    } else if (includesAny(stage, STAGE_KEYWORDS.pendingScheduling)) {
      f.pendentesNoShow++
      f.leadsTrabalhados++
      const nsType = getNoShowStageType(card)
      if (nsType === 'proposta') f.noShowsProposta++
      else f.noShowsDiagnostica++
    } else if (includesAny(stage, STAGE_KEYWORDS.diagnosticDone)) {
      f.diagnosticasRealizadas++
      f.reunioesRealizadas++
      f.leadsTrabalhados++
    } else if (includesAny(stage, STAGE_KEYWORDS.diagnosticScheduled)) {
      f.diagnosticasAgendadas++
      f.reunioesMarcadas++
      f.leadsTrabalhados++
    } else if (includesAny(stage, STAGE_KEYWORDS.futureInterest)) {
      f.interesseFuturo++
      f.leadsTrabalhados++
    } else if (includesAny(stage, STAGE_KEYWORDS.contact)) {
      f.tentativasContato++
      f.ligoesRealizadas++
      f.ligacoesRealizadas++
      f.leadsTrabalhados++
    } else if (includesAny(stage, STAGE_KEYWORDS.lost)) {
      f.perdidos++
      f.leadsTrabalhados++
    }
    // else: fase Cadastro ou não mapeada → conta apenas no total (leadsCadastrados)
  }

  return f
}

function buildMetricsFromCards(cards, members, commercial, payload, range = null) {
  const pipeline = { ...EMPTY_PIPELINE }
  // historico = contagens baseadas em eventos (passagem por etapa / campos preenchidos).
  // Usado para taxas de conversão e como funil nos modos semanal/mensal.
  const historico = { ...EMPTY_FUNIL }
  const hunters = createHunterRows(members, commercial)
  const closers = createCloserRows(members, commercial)
  const pipeMembers = getPipeMembers(payload)
  const hunterIndex = buildTeamIndex('hunter', commercial.equipe?.hunters || [], members, pipeMembers)
  const closerIndex = buildTeamIndex('closer', commercial.equipe?.closers || [], members, pipeMembers)
  const hasRange = Boolean(range?.inicio && range?.fim)
  let receitaTotal = 0

  for (const card of cards) {
    const pipelineKey = classifyPipeline(card)
    pipeline[pipelineKey] += 1

    const leadCreated = cardCreatedInPeriod(card, range)
    const contactAttempted = contactAttemptInPeriod(card, range)
    const contactStage = contactStageInPeriod(card, range)

    const diagnosticScheduled = eventReachedInPeriod(
      card,
      EVENT_LABELS.diagnosticScheduled,
      PIPEFY_2026_STAGE_GROUPS.diagnosticScheduledOrLater,
      range,
      FUNNEL_RANKS.diagnosticScheduled,
    )

    const diagnosticStatus = getDiagnosticStatus(card)
    const diagnosticDone = canCountStage(card, FUNNEL_RANKS.diagnosticDone) && (eventStatusInPeriod(
      card,
      diagnosticStatus,
      EVENT_LABELS.diagnosticDone,
      PIPEFY_2026_STAGE_GROUPS.diagnosticDoneOrLater,
      range,
      statusIsRealized,
    ) || eventReachedInPeriod(
      card,
      EVENT_LABELS.diagnosticDone,
      PIPEFY_2026_STAGE_GROUPS.diagnosticDoneOrLater,
      range,
      FUNNEL_RANKS.diagnosticDone,
    ))

    const diagnosticNoShow = isNoShowFor(card, 'diagnostica', range) || eventStatusInPeriod(
      card,
      diagnosticStatus,
      EVENT_LABELS.diagnosticScheduled,
      STAGE_KEYWORDS.diagnosticScheduled,
      range,
      statusIsNoShow,
    )

    const proposalScheduled = eventReachedInPeriod(
      card,
      EVENT_LABELS.proposalScheduled,
      PIPEFY_2026_STAGE_GROUPS.proposalScheduledOrLater,
      range,
      FUNNEL_RANKS.proposalScheduled,
    )

    const proposalStatus = getProposalStatus(card)
    const proposalDone = canCountStage(card, FUNNEL_RANKS.proposalDone) && (eventStatusInPeriod(
      card,
      proposalStatus,
      EVENT_LABELS.proposalDone,
      PIPEFY_2026_STAGE_GROUPS.proposalDoneOrLater,
      range,
      statusIsRealized,
    ) || eventReachedInPeriod(
      card,
      EVENT_LABELS.proposalDone,
      PIPEFY_2026_STAGE_GROUPS.proposalDoneOrLater,
      range,
      FUNNEL_RANKS.proposalDone,
    ))

    const proposalNoShow = isNoShowFor(card, 'proposta', range) || eventStatusInPeriod(
      card,
      proposalStatus,
      EVENT_LABELS.proposalScheduled,
      STAGE_KEYWORDS.proposalScheduled,
      range,
      statusIsNoShow,
    )

    const inNegotiation = eventReachedInPeriod(
      card,
      EVENT_LABELS.negotiation,
      [...STAGE_KEYWORDS.negotiation, ...STAGE_KEYWORDS.contract],
      range,
      FUNNEL_RANKS.negotiation,
    )

    const contractClosed = contractWasClosed(card) && eventReachedInPeriod(
      card,
      EVENT_LABELS.contract,
      STAGE_KEYWORDS.contract,
      range,
      FUNNEL_RANKS.contract,
    )
    const futureInterest = currentStageInPeriod(card, STAGE_KEYWORDS.futureInterest, range)
    const pendingNoShow = currentStageInPeriod(card, STAGE_KEYWORDS.pendingScheduling, range)
    const lost = currentStageInPeriod(card, STAGE_KEYWORDS.lost, range)
    const worked = contactAttempted ||
      futureInterest ||
      diagnosticScheduled ||
      diagnosticDone ||
      proposalScheduled ||
      proposalDone ||
      inNegotiation ||
      pendingNoShow ||
      contractClosed ||
      lost

    if (leadCreated) historico.leadsCadastrados += 1
    if (worked) historico.leadsTrabalhados += 1
    if (contactStage) historico.tentativasContato += 1
    if (contactAttempted) {
      historico.ligoesRealizadas += 1
      historico.ligacoesRealizadas += 1
    }
    if (futureInterest) historico.interesseFuturo += 1
    if (diagnosticScheduled) {
      historico.diagnosticasAgendadas += 1
      historico.reunioesMarcadas += 1
    }
    if (diagnosticDone) {
      historico.diagnosticasRealizadas += 1
      historico.reunioesRealizadas += 1
    }
    if (diagnosticNoShow) historico.noShowsDiagnostica += 1
    if (proposalScheduled) {
      historico.propostasAgendadas += 1
      historico.propostas += 1
    }
    if (proposalDone) historico.propostasRealizadas += 1
    if (proposalNoShow) historico.noShowsProposta += 1
    if (inNegotiation) historico.negociacoes += 1
    if (pendingNoShow) historico.pendentesNoShow += 1
    if (contractClosed) {
      historico.contratosFechados += 1
      receitaTotal += getCardValue(card)
    }
    if (lost) historico.perdidos += 1

    const hunter = findOrCreateRow(hunters, getResponsibleTeamMember(card, 'hunter', hunterIndex))
    if (hunter) {
      if (contactAttempted) hunter.contatadas += 1
      if (diagnosticScheduled) hunter.reunioesMarcadas += 1
      if (diagnosticDone) hunter.reunioesRealizadas += 1
      if (diagnosticNoShow) hunter.noShows += 1
    }

    const closer = findOrCreateRow(closers, getResponsibleTeamMember(card, 'closer', closerIndex))
    if (closer) {
      if (proposalScheduled) closer.propostasAgendadas += 1
      if (proposalDone) closer.reunioesRealizadas += 1
      if (proposalNoShow) closer.noShows += 1
      if (inNegotiation && !contractClosed) closer.emNegociacao += 1
      if (contractClosed) closer.contratosFechados += 1
    }
  }

  // Ao vivo (sem período): funil mostra a fase ATUAL de cada card.
  // Com período: funil = mesmos eventos do histórico (atividade no intervalo).
  const funil = hasRange ? { ...historico } : buildFunilByCurrentPhase(cards)

  return {
    funil,
    historico,
    pipeline,
    hunters,
    closers,
    kpis: {
      ticketMedio: historico.contratosFechados ? receitaTotal / historico.contratosFechados : 0,
      receitaTotal,
      contratosFechados: historico.contratosFechados,
      taxaConversao: historico.leadsCadastrados ? (historico.contratosFechados / historico.leadsCadastrados) * 100 : 0,
    },
  }
}

export function mapComercialSnapshot(payload, { members = [], commercial = {}, range = null } = {}) {
  if (!payload) return null

  // TODO: substituir este payload por chamadas normalizadas do Supabase quando
  // o n8n gravar cards e metadados separados por tabela.
  const allCards = getCards(payload)
  const cards = filterCardsByRange(allCards, range)
  const hasRange = Boolean(range?.inicio && range?.fim)
  const computed = allCards.length ? buildMetricsFromCards(allCards, members, commercial, payload, range) : null
  // Quando computed está disponível, confiamos 100% nele — não misturamos com payload.funil
  // para evitar que campos legados do n8n (ex: noShows) contaminem o resultado.
  const funil = {
    ...EMPTY_FUNIL,
    ...(computed ? {} : (hasRange ? {} : (payload.funil || {}))),
    ...(computed?.funil || {}),
  }
  if (!computed) {
    funil.ligoesRealizadas = funil.ligoesRealizadas || funil.ligacoesRealizadas || 0
    funil.ligacoesRealizadas = funil.ligacoesRealizadas || funil.ligoesRealizadas || 0
    funil.leadsTrabalhados = funil.leadsTrabalhados || funil.tentativasContato || 0
    funil.pendentesNoShow = funil.pendentesNoShow || funil.agendamentosPendentes || funil.noShows || 0
  }

  const historico = {
    ...EMPTY_FUNIL,
    ...(computed?.historico || computed?.funil || {}),
  }
  if (!computed) {
    historico.ligoesRealizadas = historico.ligoesRealizadas || historico.ligacoesRealizadas || 0
    historico.ligacoesRealizadas = historico.ligacoesRealizadas || historico.ligoesRealizadas || 0
    historico.leadsTrabalhados = historico.leadsTrabalhados || historico.tentativasContato || 0
    historico.pendentesNoShow = historico.pendentesNoShow || historico.agendamentosPendentes || historico.noShows || 0
  }

  const pipeline = {
    ...EMPTY_PIPELINE,
    ...(hasRange ? {} : (payload.pipeline || {})),
    ...(computed?.pipeline || {}),
  }
  pipeline.agendamentosPendentes = pipeline.agendamentosPendentes || pipeline.noShow || 0
  delete pipeline.noShow

  return {
    id: range?.id || payload.periodo?.id || 'pipefy-live',
    label: range?.label || payload.periodo?.label || 'Pipefy ao vivo',
    inicio: range?.inicio || new Date().toISOString().split('T')[0],
    fim: range?.fim || new Date().toISOString().split('T')[0],
    ultimaAtualizacao: payload.periodo?.atualizadoEm || new Date().toISOString(),
    funil,
    historico,
    hunters: computed?.hunters || (Array.isArray(payload.hunters) && payload.hunters.length
      ? payload.hunters
      : createHunterRows(members, commercial)),
    closers: computed?.closers || (Array.isArray(payload.closers) && payload.closers.length
      ? payload.closers
      : createCloserRows(members, commercial)),
    kpis: {
      ...EMPTY_KPIS,
      ...(hasRange ? {} : (payload.kpis || {})),
      ...(computed?.kpis || {}),
      contratosFechados: hasRange
        ? (computed?.kpis?.contratosFechados ?? funil.contratosFechados ?? 0)
        : (computed?.kpis?.contratosFechados ?? payload.kpis?.contratosFechados ?? funil.contratosFechados ?? 0),
    },
    pipeline,
    raw: payload.raw || {},
    fonte: payload.fonte || 'pipefy',
    pipe: payload.pipe || null,
    cardsMapeados: cards.length,
    totalCardsSnapshot: allCards.length,
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

  getPipeMembers(payload)
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
    getFieldValues(card, ['hunter', 'responsaveis pela diagnostica', 'responsáveis pela diagnóstica', 'responsavel prospeccao', 'responsável prospecção', 'responsavel', 'responsável'])
      .forEach(value => extractEmails(value).forEach(email => add({ email, source: 'Responsável' })))
    getFieldValues(card, ['closer responsavel', 'closer responsável', 'responsavel pela proposta', 'responsável pela proposta', 'responsaveis pela proposta', 'responsáveis pela proposta', 'responsaveis pela apresentacao de proposta', 'responsáveis pela apresentação de proposta', 'responsavel pela negociacao', 'responsável pela negociação', 'responsaveis pelo contrato', 'responsáveis pelo contrato', 'responsaveis pelo fechamento', 'responsáveis pelo fechamento', 'closer', 'email do closer', 'responsavel fechamento', 'responsável fechamento'])
      .forEach(value => extractEmails(value).forEach(email => add({ email, source: 'Closer' })))
    getCardAssigneePeople(card).forEach(person => {
      if (person.email) add({ email: person.email, name: person.name, source: 'Assignee' })
      extractEmails(person.name).forEach(email => add({ email, name: person.name, source: 'Assignee' }))
    })
  }

  return [...people.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}
