// Camada central de acesso a dados.
// Todos os componentes leem e escrevem EXCLUSIVAMENTE por aqui.
// Para integrar Supabase: substitua as funções abaixo por chamadas ao client.
import { INITIAL_USUARIOS }       from './usuarios'
import { INITIAL_COMERCIAL }      from './comercial'
import { INITIAL_GESTAO_PESSOAS } from './gestaoPessoas'
import { INITIAL_COMUNICACAO }    from './comunicacao'
import { INITIAL_PROJETOS }       from './projetos'
import { normalizePermissions }   from '../config/accessControl'
import { resolveSetor }           from './setores'
import { isSupabaseConfigured }   from '../lib/supabase'

const KEYS = {
  usuarios:      'ej_db_usuarios_v3',
  comercial:     'ej_db_comercial_v1',
  gestaoPessoas: 'ej_db_gp_v2',
  comunicacao:   'ej_db_comunicacao_v2',
  projetos:      'ej_db_projetos_v1',
}

const INITIAL = {
  usuarios:      INITIAL_USUARIOS,
  comercial:     INITIAL_COMERCIAL,
  gestaoPessoas: INITIAL_GESTAO_PESSOAS,
  comunicacao:   INITIAL_COMUNICACAO,
  projetos:      INITIAL_PROJETOS,
}

const EMPTY_REMOTE = {
  usuarios: [],
  comercial: {
    equipe: { hunters: [], closers: [] },
    hunters: [],
    closers: [],
    semanas: [],
    meses: [],
    aovivo: {},
    leads: [],
    reunioes: [],
    contratos: [],
  },
  gestaoPessoas: {
    avaliacoes: [],
    processoSeletivo: [],
  },
  comunicacao: {
    mensagens: [],
    notificacoes: [],
    avisos: [],
  },
  projetos: {
    projetos: [],
    baseConhecimento: [],
    baseConhecimentoSeedVersion: null,
  },
}

const REMOTE_PRIMARY = Boolean(isSupabaseConfigured)
const initialFor = tabela => REMOTE_PRIMARY ? EMPTY_REMOTE[tabela] : INITIAL[tabela]

const DEFAULT_NOTIFICATION_PREFERENCES = {
  email: true,
  system: true,
  whatsapp: false,
  weekly_report: true,
}

const EMPTY_FUNIL = {
  leadsCadastrados: 0,
  ligoesRealizadas: 0,
  reunioesMarcadas: 0,
  reunioesRealizadas: 0,
  propostas: 0,
  negociacoes: 0,
  contratosFechados: 0,
}

const EMPTY_KPIS = {
  ticketMedio: 0,
  receitaTotal: 0,
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

const EMPTY_COMMERCIAL_TEAM = {
  hunters: [],
  closers: [],
}

const isRecord = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const asArray = (value, fallback = []) => Array.isArray(value) ? value : fallback
const idsEqual = (a, b) => String(a ?? '') === String(b ?? '')
const idsInclude = (items = [], id) => items.some(item => idsEqual(item, id))
const OLD_KNOWLEDGE_MOCK_IDS = new Set(['101', '102', '103'])
const KNOWLEDGE_SEED_VERSION = 'html-seed-2026-06-28'

function splitTextList(value) {
  if (Array.isArray(value)) return value.map(item => `${item || ''}`.trim()).filter(Boolean)
  if (!value) return []
  return `${value}`.split('\n').map(item => item.trim()).filter(Boolean)
}

function normalizeTagList(value) {
  const source = Array.isArray(value) ? value : `${value || ''}`.split(',')
  const seen = new Set()
  return source
    .flatMap(item => `${item || ''}`.split(','))
    .map(tag => tag.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .filter(tag => {
      const key = tag.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

function normalizeKnowledgeStatus(status) {
  const text = `${status || ''}`.trim()
  if (!text) return 'Planejado'
  const key = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  if (key === 'concluido') return 'Concluído'
  if (key === 'em andamento') return 'Em andamento'
  if (key === 'planejado') return 'Planejado'
  if (key === 'arquivado') return 'Arquivado'
  return text
}

function normalizeCommercialPeriod(period, fallback = {}) {
  const current = isRecord(period) ? period : {}
  return {
    ...fallback,
    ...current,
    funil: { ...EMPTY_FUNIL, ...(fallback.funil || {}), ...(current.funil || {}) },
    kpis: { ...EMPTY_KPIS, ...(fallback.kpis || {}), ...(current.kpis || {}) },
    pipeline: current.pipeline || fallback.pipeline
      ? { ...EMPTY_PIPELINE, ...(fallback.pipeline || {}), ...(current.pipeline || {}) }
      : undefined,
    hunters: asArray(current.hunters, asArray(fallback.hunters)),
    closers: asArray(current.closers, asArray(fallback.closers)),
  }
}

function normalizeCommercial(data) {
  const current = isRecord(data) ? data : {}
  const base = REMOTE_PRIMARY ? EMPTY_REMOTE.comercial : INITIAL_COMERCIAL
  const normalizePeriods = (periods, fallbacks) => {
    const source = asArray(periods, fallbacks)
    return source.map(period => {
      const fallback = fallbacks.find(item => item.id === period?.id) || {}
      return normalizeCommercialPeriod(period, fallback)
    })
  }

  return {
    ...base,
    ...current,
    equipe: {
      ...EMPTY_COMMERCIAL_TEAM,
      ...(base.equipe || {}),
      ...(current.equipe || {}),
      hunters: asArray(current.equipe?.hunters, asArray(base.equipe?.hunters)),
      closers: asArray(current.equipe?.closers, asArray(base.equipe?.closers)),
    },
    hunters: asArray(current.hunters, base.hunters),
    closers: asArray(current.closers, base.closers),
    semanas: normalizePeriods(current.semanas, base.semanas),
    meses: normalizePeriods(current.meses, base.meses),
    aovivo: normalizeCommercialPeriod(current.aovivo, base.aovivo),
    leads: asArray(current.leads, base.leads),
    reunioes: asArray(current.reunioes, base.reunioes),
    contratos: asArray(current.contratos ?? current.contracts, base.contratos),
  }
}

function normalizePeople(data) {
  const current = isRecord(data) ? data : {}
  const base = REMOTE_PRIMARY ? EMPTY_REMOTE.gestaoPessoas : INITIAL_GESTAO_PESSOAS
  const evaluations = asArray(current.avaliacoes ?? current.evaluations, base.avaliacoes)
    .map(evaluation => ({
      ...evaluation,
      feedbacks: asArray(evaluation?.feedbacks),
      metas: asArray(evaluation?.metas),
      historico: asArray(evaluation?.historico),
    }))

  return {
    ...base,
    ...current,
    avaliacoes: evaluations,
    processoSeletivo: asArray(
      current.processoSeletivo ?? current.process,
      base.processoSeletivo,
    ),
  }
}

function normalizeCommunication(data) {
  const current = isRecord(data) ? data : {}
  const base = REMOTE_PRIMARY ? EMPTY_REMOTE.comunicacao : INITIAL_COMUNICACAO
  return {
    ...base,
    ...current,
    mensagens: asArray(current.mensagens ?? current.messages, base.mensagens),
    notificacoes: asArray(current.notificacoes ?? current.notifications, base.notificacoes),
    avisos: asArray(current.avisos ?? current.notices, base.avisos),
  }
}

function normalizeProjects(data) {
  const current = isRecord(data) ? data : {}
  const base = REMOTE_PRIMARY ? EMPTY_REMOTE.projetos : INITIAL_PROJETOS
  const projects = asArray(current.projetos ?? current.projects, base.projetos)
    .map(project => ({
      ...project,
      membros: asArray(project?.membros),
      tarefas: asArray(project?.tarefas),
    }))
  const storedKnowledge = current.baseConhecimento ? asArray(current.baseConhecimento) : []
  const shouldApplyKnowledgeSeed = current.baseConhecimentoSeedVersion !== KNOWLEDGE_SEED_VERSION
  const knowledgeById = new Map()

  if (shouldApplyKnowledgeSeed) {
    INITIAL_PROJETOS.baseConhecimento.forEach(record => {
      knowledgeById.set(String(record.id), record)
    })
  }

  storedKnowledge
    .filter(record => !OLD_KNOWLEDGE_MOCK_IDS.has(String(record?.id ?? '')))
    .forEach(record => {
      knowledgeById.set(String(record.id), record)
    })

  const baseConhecimento = [...knowledgeById.values()]
    .map(record => ({
      ...record,
      status: normalizeKnowledgeStatus(record?.status),
      tags: normalizeTagList(record?.tags),
      pontosFortes: splitTextList(record?.pontosFortes),
      pontosFracos: splitTextList(record?.pontosFracos),
      problemas: splitTextList(record?.problemas),
      errosEquipe: splitTextList(record?.errosEquipe),
      errosCliente: splitTextList(record?.errosCliente),
      licoesAprendidas: splitTextList(record?.licoesAprendidas),
    }))
  return {
    ...base,
    ...current,
    projetos: projects,
    baseConhecimento,
    baseConhecimentoSeedVersion: KNOWLEDGE_SEED_VERSION,
  }
}

// ── Persistência ─────────────────────────────────────────────

function read(tabela) {
  if (REMOTE_PRIMARY) return memoryStore.has(tabela) ? memoryStore.get(tabela) : null
  try {
    const raw = localStorage.getItem(KEYS[tabela])
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function write(tabela, data) {
  if (REMOTE_PRIMARY) {
    memoryStore.set(tabela, data)
    return
  }
  try {
    localStorage.setItem(KEYS[tabela], JSON.stringify(data))
  } catch (error) {
    console.error(`Falha ao persistir a tabela ${tabela}`, error)
  }
}

const listeners = new Map()
const memoryStore = new Map()
let lastGeneratedId = 0

function getLegacyNotificationPreferences(userId) {
  try {
    const legacy = JSON.parse(localStorage.getItem(`ej_profile_${userId}`) || 'null')
    return legacy?.settings?.notifications || {}
  } catch {
    return {}
  }
}

function normalize(tabela, data) {
  if (tabela === 'usuarios') {
    return asArray(data, REMOTE_PRIMARY ? [] : INITIAL_USUARIOS).map(user => {
      const canonicalSector = resolveSetor(user.setorId || user.setor)
      const permissoes = normalizePermissions(user.permissoes, user.role)

      return {
        ...user,
        setorId: canonicalSector?.id || user.setorId || null,
        setor: canonicalSector?.nome || user.setor || '',
        preferenciasNotificacao: {
          ...DEFAULT_NOTIFICATION_PREFERENCES,
          ...getLegacyNotificationPreferences(user.id),
          ...(user.preferenciasNotificacao || {}),
        },
        permissoes,
      }
    })
  }
  if (tabela === 'comercial') return normalizeCommercial(data)
  if (tabela === 'gestaoPessoas') return normalizePeople(data)
  if (tabela === 'comunicacao') return normalizeCommunication(data)
  if (tabela === 'projetos') return normalizeProjects(data)
  return data
}

function notify(tabela, data) {
  listeners.get(tabela)?.forEach(listener => listener(data))
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ej:db-change', { detail: { tabela, data } }))
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', event => {
    const tabela = Object.keys(KEYS).find(key => KEYS[key] === event.key)
    if (!tabela) return
    if (REMOTE_PRIMARY) return
    const data = normalize(tabela, read(tabela) ?? initialFor(tabela))
    notify(tabela, data)
  })
}

// ── API pública ───────────────────────────────────────────────

const db = {
  createId() {
    lastGeneratedId = Math.max(Date.now(), lastGeneratedId + 1)
    return lastGeneratedId
  },

  /** Retorna todos os dados de uma tabela. Com Supabase ativo, nao reidrata dados operacionais locais. */
  get(tabela) {
    return normalize(tabela, read(tabela) ?? initialFor(tabela))
  },

  /** Substitui toda a tabela */
  set(tabela, dados) {
    const normalized = normalize(tabela, dados)
    write(tabela, normalized)
    notify(tabela, normalized)
    return normalized
  },

  /** Atualiza uma tabela sempre a partir do valor persistido mais recente. */
  mutate(tabela, updater) {
    const current = db.get(tabela)
    return db.set(tabela, updater(current))
  },

  subscribe(tabela, listener) {
    if (!listeners.has(tabela)) listeners.set(tabela, new Set())
    listeners.get(tabela).add(listener)
    return () => listeners.get(tabela)?.delete(listener)
  },

  /** Atualiza campos de um registro em um array dentro da tabela.
   *  @param tabela    - chave da tabela (ex: 'usuarios')
   *  @param arrayKey  - chave do array dentro da tabela (ex: 'leads') ou null se a tabela É o array
   *  @param id        - id do registro
   *  @param campos    - objeto com os campos a atualizar
   */
  update(tabela, arrayKey, id, campos) {
    const dados = db.get(tabela)
    let updated
    if (arrayKey) {
      updated = {
        ...dados,
        [arrayKey]: dados[arrayKey].map(r => idsEqual(r.id, id) ? { ...r, ...campos } : r),
      }
    } else {
      updated = dados.map(r => idsEqual(r.id, id) ? { ...r, ...campos } : r)
    }
    return db.set(tabela, updated)
  },

  /** Remove um registro de um array dentro da tabela */
  delete(tabela, arrayKey, id) {
    const dados = db.get(tabela)
    let updated
    if (arrayKey) {
      updated = { ...dados, [arrayKey]: dados[arrayKey].filter(r => !idsEqual(r.id, id)) }
    } else {
      updated = dados.filter(r => !idsEqual(r.id, id))
    }
    return db.set(tabela, updated)
  },

  /** Adiciona um registro em um array dentro da tabela */
  insert(tabela, arrayKey, registro) {
    const dados = db.get(tabela)
    const novoId = db.createId()
    const novoRegistro = { ...registro, id: novoId }
    let updated
    if (arrayKey) {
      updated = { ...dados, [arrayKey]: [...dados[arrayKey], novoRegistro] }
    } else {
      updated = [...dados, novoRegistro]
    }
    const persisted = db.set(tabela, updated)
    return { updated: persisted, novoRegistro }
  },

  removeUser(userId) {
    db.delete('usuarios', null, userId)

    const comunicacao = db.get('comunicacao')
    db.set('comunicacao', {
      ...comunicacao,
      mensagens: (comunicacao.mensagens || []).filter(message =>
        !idsEqual(message.remetenteId, userId) && !idsEqual(message.destinatarioId, userId)
      ),
      notificacoes: (comunicacao.notificacoes || []).filter(notification => !idsEqual(notification.usuarioId, userId)),
      avisos: (comunicacao.avisos || []).filter(notice => !idsEqual(notice.autorId, userId)),
    })

    const gestaoPessoas = db.get('gestaoPessoas')
    db.set('gestaoPessoas', {
      ...gestaoPessoas,
      avaliacoes: (gestaoPessoas.avaliacoes || [])
        .filter(evaluation => !idsEqual(evaluation.membroId, userId))
        .map(evaluation => ({
          ...evaluation,
          feedbacks: (evaluation.feedbacks || []).filter(feedback => !idsEqual(feedback.avaliadorId, userId)),
        })),
    })

    const projetos = db.get('projetos')
    db.set('projetos', {
      ...projetos,
      projetos: (projetos.projetos || []).map(project => ({
        ...project,
        responsavelId: idsEqual(project.responsavelId, userId) ? null : project.responsavelId,
        membros: (project.membros || []).filter(memberId => !idsEqual(memberId, userId)),
        tarefas: (project.tarefas || []).map(task => ({
          ...task,
          responsavelId: idsEqual(task.responsavelId, userId) ? null : task.responsavelId,
        })),
      })),
      baseConhecimento: (projetos.baseConhecimento || []).map(record => ({
        ...record,
        responsavelId: idsEqual(record.responsavelId, userId) ? null : record.responsavelId,
      })),
    })

    const comercial = db.get('comercial')
    const removedHunterIds = (comercial.hunters || [])
      .filter(hunter => idsEqual(hunter.userId, userId))
      .map(hunter => hunter.id)
    const removedCloserIds = (comercial.closers || [])
      .filter(closer => idsEqual(closer.userId, userId))
      .map(closer => closer.id)
    db.set('comercial', {
      ...comercial,
      equipe: {
        hunters: (comercial.equipe?.hunters || []).filter(item => !idsEqual(item.userId, userId)),
        closers: (comercial.equipe?.closers || []).filter(item => !idsEqual(item.userId, userId)),
      },
      hunters: (comercial.hunters || []).filter(hunter => !idsEqual(hunter.userId, userId)),
      closers: (comercial.closers || []).filter(closer => !idsEqual(closer.userId, userId)),
      leads: (comercial.leads || []).map(lead => ({
        ...lead,
        hunterId: idsInclude(removedHunterIds, lead.hunterId) ? null : lead.hunterId,
        hunter: idsInclude(removedHunterIds, lead.hunterId) ? '' : lead.hunter,
        closerId: idsInclude(removedCloserIds, lead.closerId) ? null : lead.closerId,
        closer: idsInclude(removedCloserIds, lead.closerId) ? '' : lead.closer,
      })),
      reunioes: (comercial.reunioes || []).map(meeting => ({
        ...meeting,
        responsavelId: idsEqual(meeting.responsavelId, userId) ? null : meeting.responsavelId,
        responsavelIds: (meeting.responsavelIds || (meeting.responsavelId ? [meeting.responsavelId] : []))
          .filter(memberId => !idsEqual(memberId, userId)),
      })),
      contratos: (comercial.contratos || []).map(contract => ({
        ...contract,
        responsavelId: idsEqual(contract.responsavelId, userId) ? null : contract.responsavelId,
        responsible: idsEqual(contract.responsavelId, userId) ? '' : contract.responsible,
        closerId: idsInclude(removedCloserIds, contract.closerId) ? null : contract.closerId,
      })),
    })
  },
}

export default db
