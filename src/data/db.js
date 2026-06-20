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

const isRecord = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const asArray = (value, fallback = []) => Array.isArray(value) ? value : fallback
const idsEqual = (a, b) => String(a ?? '') === String(b ?? '')
const idsInclude = (items = [], id) => items.some(item => idsEqual(item, id))

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
  const normalizePeriods = (periods, fallbacks) => {
    const source = asArray(periods, fallbacks)
    return source.map(period => {
      const fallback = fallbacks.find(item => item.id === period?.id) || {}
      return normalizeCommercialPeriod(period, fallback)
    })
  }

  return {
    ...INITIAL_COMERCIAL,
    ...current,
    hunters: asArray(current.hunters, INITIAL_COMERCIAL.hunters),
    closers: asArray(current.closers, INITIAL_COMERCIAL.closers),
    semanas: normalizePeriods(current.semanas, INITIAL_COMERCIAL.semanas),
    meses: normalizePeriods(current.meses, INITIAL_COMERCIAL.meses),
    aovivo: normalizeCommercialPeriod(current.aovivo, INITIAL_COMERCIAL.aovivo),
    leads: asArray(current.leads, INITIAL_COMERCIAL.leads),
    reunioes: asArray(current.reunioes, INITIAL_COMERCIAL.reunioes),
    contratos: asArray(current.contratos ?? current.contracts, INITIAL_COMERCIAL.contratos),
  }
}

function normalizePeople(data) {
  const current = isRecord(data) ? data : {}
  const evaluations = asArray(current.avaliacoes ?? current.evaluations, INITIAL_GESTAO_PESSOAS.avaliacoes)
    .map(evaluation => ({
      ...evaluation,
      feedbacks: asArray(evaluation?.feedbacks),
      metas: asArray(evaluation?.metas),
      historico: asArray(evaluation?.historico),
    }))

  return {
    ...INITIAL_GESTAO_PESSOAS,
    ...current,
    avaliacoes: evaluations,
    processoSeletivo: asArray(
      current.processoSeletivo ?? current.process,
      INITIAL_GESTAO_PESSOAS.processoSeletivo,
    ),
  }
}

function normalizeCommunication(data) {
  const current = isRecord(data) ? data : {}
  return {
    ...INITIAL_COMUNICACAO,
    ...current,
    mensagens: asArray(current.mensagens ?? current.messages, INITIAL_COMUNICACAO.mensagens),
    notificacoes: asArray(current.notificacoes ?? current.notifications, INITIAL_COMUNICACAO.notificacoes),
    avisos: asArray(current.avisos ?? current.notices, INITIAL_COMUNICACAO.avisos),
  }
}

function normalizeProjects(data) {
  const current = isRecord(data) ? data : {}
  const projects = asArray(current.projetos ?? current.projects, INITIAL_PROJETOS.projetos)
    .map(project => ({
      ...project,
      membros: asArray(project?.membros),
      tarefas: asArray(project?.tarefas),
    }))
  return { ...INITIAL_PROJETOS, ...current, projetos: projects }
}

// ── Persistência ─────────────────────────────────────────────

function read(tabela) {
  try {
    const raw = localStorage.getItem(KEYS[tabela])
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function write(tabela, data) {
  try {
    localStorage.setItem(KEYS[tabela], JSON.stringify(data))
  } catch (error) {
    console.error(`Falha ao persistir a tabela ${tabela}`, error)
  }
}

const listeners = new Map()
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
    return asArray(data, INITIAL_USUARIOS).map(user => {
      const canonicalSector = resolveSetor(user.setorId || user.setor)
      let permissoes = normalizePermissions(user.permissoes, user.role)

      // Migra contas gravadas antes das permissões por subárea existirem.
      if (!user.permissoes?.subareas && user.role !== 'presidente') {
        const cargo = `${user.cargo || ''}`.toLowerCase()
        const sectorName = `${user.setor || ''}`.toLowerCase()

        if (permissoes.comercial && !cargo.includes('diretor')) {
          permissoes = {
            ...permissoes,
            subareas: {
              ...permissoes.subareas,
              'comercial.dashboard': false,
              'comercial.pipeline': true,
              'comercial.ranking': false,
              'comercial.contratos': false,
            },
          }
        }

        if (permissoes.gestaoPessoas && !sectorName.includes('pessoas')) {
          permissoes = {
            ...permissoes,
            subareas: {
              ...permissoes.subareas,
              'gestaoPessoas.dashboard': false,
              'gestaoPessoas.membros': true,
              'gestaoPessoas.processo': false,
              'gestaoPessoas.aprovacoes': false,
            },
          }
        } else if (permissoes.gestaoPessoas && !cargo.includes('diretor')) {
          permissoes = {
            ...permissoes,
            subareas: {
              ...permissoes.subareas,
              'gestaoPessoas.dashboard': true,
              'gestaoPessoas.membros': true,
              'gestaoPessoas.processo': true,
              'gestaoPessoas.aprovacoes': false,
            },
          }
        }
      }

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
    const data = normalize(tabela, read(tabela) ?? INITIAL[tabela])
    notify(tabela, data)
  })
}

// ── API pública ───────────────────────────────────────────────

const db = {
  createId() {
    lastGeneratedId = Math.max(Date.now(), lastGeneratedId + 1)
    return lastGeneratedId
  },

  /** Retorna todos os dados de uma tabela (localStorage ou dados iniciais) */
  get(tabela) {
    return normalize(tabela, read(tabela) ?? INITIAL[tabela])
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
