import { createContext, useContext, useEffect, useState } from 'react'
import db from '../data/db'
import { hasSubareaAccess, normalizePermissions } from '../config/accessControl'
import { resolveSetor } from '../data/setores'
import { useAuth } from './AuthContext'
import {
  canDeleteMember,
  canManageMembers,
  canPostAnnouncements,
  canSendFeedback,
} from '../config/authorization'
import {
  bootstrapSupabase,
  deleteMeetingFromSupabase,
  deleteUserFromSupabase,
  markRemoteNotificationRead,
  syncMeetingToSupabase,
  syncMessageToSupabase,
  syncNotificationToSupabase,
  syncUsersToSupabase,
} from '../services/supabaseBridge'

const DataContext = createContext(null)

function publicUsers(users) {
  return users.map(user => {
    const safe = { ...user }
    delete safe.senha
    delete safe.emailAliases
    return safe
  })
}

function emailInUse(email, excludedUserId = null) {
  const normalized = email.toLowerCase()
  return db.get('usuarios').some(member =>
    member.id !== excludedUserId && (
      member.email?.toLowerCase() === normalized ||
      (member.emailAliases || []).some(alias => alias.toLowerCase() === normalized)
    )
  )
}

function createTemporaryCredentials(name = 'membro') {
  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 32) || 'membro'
  return {
    email: `${slug}@projep.com`,
    senha: '123456',
  }
}

function resolveCommercialUsers(commercial, members) {
  const memberMap = new Map(members.map(member => [member.id, member]))
  const hunters = (commercial.hunters || []).map(hunter => ({
    ...hunter,
    nome: memberMap.get(hunter.userId)?.nome || hunter.nome,
  }))
  const closers = (commercial.closers || []).map(closer => ({
    ...closer,
    nome: memberMap.get(closer.userId)?.nome || closer.nome,
  }))
  const hunterMap = new Map(hunters.map(hunter => [hunter.id, hunter.nome]))
  const closerMap = new Map(closers.map(closer => [closer.id, closer.nome]))
  const resolvePeriod = period => ({
    ...period,
    hunters: (period.hunters || []).map(metric => ({ ...metric, nome: hunterMap.get(metric.id) || metric.nome })),
    closers: (period.closers || []).map(metric => ({ ...metric, nome: closerMap.get(metric.id) || metric.nome })),
  })

  return {
    ...commercial,
    hunters,
    closers,
    semanas: (commercial.semanas || []).map(resolvePeriod),
    meses: (commercial.meses || []).map(resolvePeriod),
    aovivo: resolvePeriod(commercial.aovivo || {}),
    leads: (commercial.leads || []).map(lead => ({
      ...lead,
      hunter: hunterMap.get(lead.hunterId) || lead.hunter,
      closer: closerMap.get(lead.closerId) || lead.closer,
    })),
    contratos: (commercial.contratos || []).map(contract => ({
      ...contract,
      responsible: memberMap.get(contract.responsavelId)?.nome || contract.responsible,
    })),
  }
}

function syncLiveCommercial(data) {
  const leads = data.leads || []
  const meetings = data.reunioes || []
  const closed = leads.filter(lead => lead.stage === 'fechado')
  const revenue = closed.reduce((sum, lead) => sum + Number(lead.value || 0), 0)
  const pipeline = {
    cadastro: leads.filter(lead => lead.stage === 'prospeccao').length,
    naoContatados: leads.filter(lead => lead.stage === 'contato').length,
    perdidos: leads.filter(lead => lead.stage === 'perdido').length,
    interesseFuturo: leads.filter(lead => lead.stage === 'interesse_futuro').length,
    diagnostico: meetings.filter(meeting => meeting.tipo === 'diagnostico' && meeting.status !== 'noshow').length,
    proposta: leads.filter(lead => lead.stage === 'proposta').length,
    negociacao: leads.filter(lead => lead.stage === 'negociacao').length,
    ganhos: closed.length,
  }

  return {
    ...data,
    aovivo: {
      ...data.aovivo,
      ultimaAtualizacao: new Date().toISOString(),
      funil: {
        ...data.aovivo.funil,
        leadsCadastrados: leads.length,
        reunioesMarcadas: meetings.length,
        reunioesRealizadas: meetings.filter(meeting => meeting.status === 'realizada').length,
        propostas: leads.filter(lead => ['proposta', 'negociacao', 'fechado'].includes(lead.stage)).length,
        negociacoes: leads.filter(lead => ['negociacao', 'fechado'].includes(lead.stage)).length,
        contratosFechados: closed.length,
      },
      pipeline,
      kpis: {
        ticketMedio: closed.length ? revenue / closed.length : 0,
        receitaTotal: revenue,
        taxaConversao: leads.length ? (closed.length / leads.length) * 100 : 0,
      },
    },
  }
}

function syncTaskDeadlineNotifications(projectData) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const communication = db.get('comunicacao')
  const existing = communication.notificacoes || []
  const generated = []

  for (const project of projectData.projetos || []) {
    for (const task of project.tarefas || []) {
      if (!task.responsavelId || task.status === 'concluida' || !task.prazo) continue
      const due = new Date(`${task.prazo}T00:00:00`)
      const days = Math.ceil((due - now) / 86400000)
      if (days < 0 || days > 2) continue
      const id = `task-deadline-${project.id}-${task.id}-${task.prazo}`
      const previous = existing.find(notification => notification.id === id)
      generated.push({
        id,
        usuarioId: task.responsavelId,
        titulo: days === 0 ? 'Tarefa vence hoje' : `Tarefa vence em ${days} dia${days > 1 ? 's' : ''}`,
        descricao: `${task.titulo} · ${project.nome}`,
        timestamp: previous?.timestamp || new Date().toISOString(),
        lida: previous?.lida || false,
        lidosPor: previous?.lidosPor || [],
        tipo: 'task',
        origem: 'prazo_tarefa',
        link: '/perfil',
      })
    }
  }

  const retained = existing.filter(notification => notification.origem !== 'prazo_tarefa')
  const next = [...generated, ...retained]
  if (JSON.stringify(next) !== JSON.stringify(existing)) {
    db.set('comunicacao', { ...communication, notificacoes: next })
  }
}

function markConversationReadInDb({ userId, memberId = null, channelId = null }) {
  db.mutate('comunicacao', current => {
    let changed = false
    const mensagens = (current.mensagens || []).map(message => {
      const isDirect = memberId && message.remetenteId === memberId && message.destinatarioId === userId && !message.lida
      const isChannel = channelId && message.destinatarioId === channelId && !(message.lidosPor || []).includes(userId)
      if (!isDirect && !isChannel) return message
      changed = true
      return channelId
        ? { ...message, lidosPor: [...new Set([...(message.lidosPor || []), userId])] }
        : { ...message, lida: true }
    })
    const notificacoes = (current.notificacoes || []).map(notification => {
      if (memberId && notification.usuarioId === userId && !notification.lida && notification.tipo === 'mensagem' && notification.link === `/chat?user=${memberId}`) {
        changed = true
        return { ...notification, lida: true }
      }
      return notification
    })
    return changed ? { ...current, mensagens, notificacoes } : current
  })
}

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [members, setMembers] = useState(() => publicUsers(db.get('usuarios')))
  const [commercial, setCommercial] = useState(() => db.get('comercial'))
  const [people, setPeople] = useState(() => db.get('gestaoPessoas'))
  const [communication, setCommunication] = useState(() => db.get('comunicacao'))
  const [projectData, setProjectData] = useState(() => db.get('projetos'))

  useEffect(() => {
    const unsubscribers = [
      db.subscribe('usuarios', nextUsers => setMembers(publicUsers(nextUsers))),
      db.subscribe('comercial', setCommercial),
      db.subscribe('gestaoPessoas', setPeople),
      db.subscribe('comunicacao', setCommunication),
      db.subscribe('projetos', setProjectData),
    ]
    return () => unsubscribers.forEach(unsubscribe => unsubscribe())
  }, [])

  useEffect(() => {
    syncTaskDeadlineNotifications(projectData)
  }, [projectData])

  useEffect(() => {
    let mounted = true
    bootstrapSupabase(db)
      .then(result => {
        if (mounted && result?.enabled) console.info('[Supabase] Sincronização inicial concluída.')
      })
      .catch(error => console.warn('[Supabase] Falha na sincronização inicial:', error.message || error))
    return () => { mounted = false }
  }, [])

  const resolvedCommercial = resolveCommercialUsers(commercial, members)
  const canUse = subareaKey => hasSubareaAccess(user, subareaKey)

  const addMember = member => {
    if (!canManageMembers(user)) return { success: false, error: 'Você não pode cadastrar membros.' }
    const temporaryCredentials = member.usarDadosTemporarios ? createTemporaryCredentials(member.nome) : null
    const email = (temporaryCredentials?.email || member.email)?.trim().toLowerCase()
    const senha = temporaryCredentials?.senha || member.senha
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: 'Informe um email válido.' }
    }
    if (emailInUse(email)) {
      return { success: false, error: 'Já existe um membro com este email.' }
    }
    if (!senha || senha.length < 6) {
      return { success: false, error: 'A senha inicial deve ter pelo menos 6 caracteres.' }
    }
    const canonicalSector = resolveSetor(member.setorId || member.setor)
    const cargo = `${member.cargo || ''}`.toLowerCase()
    const setor = `${canonicalSector?.nome || member.setor || ''}`.toLowerCase()
    const role = cargo.includes('presidente')
      ? 'presidente'
      : cargo.includes('diretor') ? 'diretor' : (member.role || 'membro')
    if (user?.role !== 'presidente' && role !== 'membro') {
      return { success: false, error: 'Somente a presidência pode cadastrar diretores.' }
    }
    const basePermissions = { chat: true }

    if (setor.includes('comercial')) basePermissions.comercial = true
    if (setor.includes('pessoas')) basePermissions.gestaoPessoas = true
    if (setor.includes('projeto')) basePermissions.projetos = true
    if (setor.includes('marketing')) basePermissions.marketing = true
    if (setor.includes('admin') || setor.includes('finance')) basePermissions.adminFinanceiro = true
    if (role === 'presidente') basePermissions.presidencia = true

    const created = db.insert('usuarios', null, {
      senha,
      dataCadastro: new Date().toISOString().split('T')[0],
      fotoPerfil: null,
      telefone: member.telefone || '',
      skills: [],
      performance: 0,
      projects: 0,
      status: 'ativo',
      ...member,
      email,
      setorId: canonicalSector?.id || member.setorId || null,
      setor: canonicalSector?.nome || member.setor || '',
      role,
      precisaAtualizarDados: Boolean(member.usarDadosTemporarios),
      emailTemporario: Boolean(member.usarDadosTemporarios),
      permissoes: normalizePermissions(member.permissoes || basePermissions, role),
    }).novoRegistro
    void syncUsersToSupabase(db.get('usuarios'))
    return {
      success: true,
      user: publicUsers([created])[0],
      temporaryCredentials: temporaryCredentials
        ? { email: temporaryCredentials.email, senha: temporaryCredentials.senha }
        : null,
    }
  }
  const updateMember = (id, data) => {
    if (!canManageMembers(user)) return { success: false, error: 'Você não pode editar membros.' }
    const target = db.get('usuarios').find(member => member.id === id)
    if (!target) return { success: false, error: 'Membro não encontrado.' }
    if (user?.role !== 'presidente' && ['presidente', 'diretor'].includes(target.role)) {
      return { success: false, error: 'Você não pode editar este membro.' }
    }
    const canonicalSector = resolveSetor(data.setorId || data.setor || target.setorId)
    const email = data.email?.trim().toLowerCase()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: 'Informe um email válido.' }
    }
    if (emailInUse(email, id)) {
      return { success: false, error: 'Já existe um membro com este email.' }
    }
    const allowed = ['nome', 'cargo', 'email', 'telefone', 'status', 'dataCadastro', 'skills', 'projects', 'performance']
    const fields = Object.fromEntries(Object.entries(data).filter(([key]) => allowed.includes(key)))
    fields.nome = fields.nome?.trim()
    fields.email = email
    fields.avatar = fields.nome?.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase() || target.avatar
    fields.setorId = canonicalSector?.id || target.setorId
    fields.setor = canonicalSector?.nome || target.setor
    db.update('usuarios', null, id, fields)
    void syncUsersToSupabase(db.get('usuarios'))
    return { success: true }
  }
  const deleteMember = id => {
    const target = db.get('usuarios').find(member => member.id === id)
    if (!canDeleteMember(user, target)) return { success: false, error: 'Você não pode remover este membro.' }
    db.removeUser(id)
    void deleteUserFromSupabase(id)
    return { success: true }
  }

  const updateCommercialList = (key, updater) => db.mutate('comercial', current => {
    const currentList = current[key] || []
    const nextList = typeof updater === 'function' ? updater(currentList) : updater
    return syncLiveCommercial({ ...current, [key]: nextList })
  })

  const addLead = lead => {
    if (!canUse('comercial.pipeline')) return { success: false, error: 'Você não pode alterar o pipeline.' }
    const newLead = { ...lead, id: db.createId() }
    updateCommercialList('leads', current => [...current, newLead])
    return { success: true, lead: newLead }
  }
  const updateLead = (id, data) => {
    if (!canUse('comercial.pipeline')) return { success: false, error: 'Você não pode alterar o pipeline.' }
    const target = db.get('comercial').leads?.find(lead => lead.id === id)
    if (!target) return { success: false, error: 'Lead não encontrado.' }
    updateCommercialList('leads', current => current.map(lead => lead.id === id ? { ...lead, ...data } : lead))
    if (data.stage === 'fechado' && target.stage !== 'fechado') {
      addNotification({
        usuarioId: null,
        modulo: 'comercial',
        titulo: 'Novo negócio fechado',
        descricao: `${target.company} avançou para a etapa Fechado`,
        tipo: 'contract',
        link: '/comercial/pipeline',
        lidosPor: [user.id],
      })
    }
    return { success: true }
  }
  const deleteLead = id => {
    if (!canUse('comercial.pipeline')) return { success: false, error: 'Você não pode alterar o pipeline.' }
    updateCommercialList('leads', current => current.filter(lead => lead.id !== id))
    return { success: true }
  }
  const moveLead = (id, stage) => updateLead(id, { stage })

  const getMeetingResponsibleIds = meeting => {
    const ids = Array.isArray(meeting?.responsavelIds)
      ? meeting.responsavelIds
      : meeting?.responsavelId ? [meeting.responsavelId] : []
    return [...new Set(ids.map(id => Number(id)).filter(Boolean))]
  }

  const notifyMeetingAssignees = (meeting, responsibleIds) => {
    responsibleIds.forEach(memberId => {
      addNotification({
        usuarioId: memberId,
        modulo: 'comercial',
        titulo: 'Você foi alocado em uma reunião',
        descricao: `${meeting.empresa} · ${meeting.data}${meeting.horaInicio ? ` às ${meeting.horaInicio}` : ''}`,
        tipo: 'sistema',
        link: `/comercial/calendario?data=${meeting.data}`,
      })
    })
  }

  const addMeeting = meeting => {
    if (!canUse('comercial.calendario')) return { success: false, error: 'Voce nao pode cadastrar reunioes.' }
    if (!meeting.empresa?.trim()) return { success: false, error: 'Informe a empresa da reuniao.' }
    if (!meeting.data) return { success: false, error: 'Informe a data da reuniao.' }
    const responsibleIds = getMeetingResponsibleIds(meeting)
    const created = {
      tipo: 'diagnostico',
      status: 'agendada',
      prioridade: 'media',
      canal: 'Google Meet',
      ...meeting,
      id: db.createId(),
      empresa: meeting.empresa.trim(),
      contato: meeting.contato?.trim() || '',
      valorEstimado: Number(meeting.valorEstimado || 0),
      responsavelIds: responsibleIds,
      responsavelId: responsibleIds[0] || null,
    }
    updateCommercialList('reunioes', current => [...current, created])
    void syncMeetingToSupabase(created, user?.id)
    addNotification({
      usuarioId: null,
      modulo: 'comercial',
      titulo: 'Nova reuniao comercial',
      descricao: `${created.empresa} foi agendada para ${created.data}${created.horaInicio ? ` as ${created.horaInicio}` : ''}`,
      tipo: 'sistema',
      link: '/comercial/calendario',
      lidosPor: user?.id ? [user.id] : [],
    })
    notifyMeetingAssignees(created, responsibleIds)
    return { success: true, meeting: created }
  }
  const updateMeeting = (id, data) => {
    if (!canUse('comercial.calendario')) return { success: false, error: 'Voce nao pode editar reunioes.' }
    let updatedMeeting = null
    let addedResponsibleIds = []
    updateCommercialList('reunioes', current => current.map(meeting => {
      if (meeting.id !== id) return meeting
      const previousResponsibleIds = getMeetingResponsibleIds(meeting)
      const nextResponsibleIds = data.responsavelIds != null || data.responsavelId != null
        ? getMeetingResponsibleIds(data)
        : previousResponsibleIds
      addedResponsibleIds = nextResponsibleIds.filter(memberId => !previousResponsibleIds.includes(memberId))
      updatedMeeting = {
        ...meeting,
        ...data,
        empresa: data.empresa?.trim() || meeting.empresa,
        contato: typeof data.contato === 'string' ? data.contato.trim() : meeting.contato,
        valorEstimado: data.valorEstimado != null ? Number(data.valorEstimado || 0) : meeting.valorEstimado,
        responsavelIds: nextResponsibleIds,
        responsavelId: nextResponsibleIds[0] || null,
      }
      return updatedMeeting
    }))
    if (updatedMeeting && addedResponsibleIds.length) {
      notifyMeetingAssignees(updatedMeeting, addedResponsibleIds)
    }
    if (updatedMeeting) void syncMeetingToSupabase(updatedMeeting, user?.id)
    return updatedMeeting
      ? { success: true, meeting: updatedMeeting }
      : { success: false, error: 'Reuniao nao encontrada.' }
  }
  const deleteMeeting = id => {
    if (!canUse('comercial.calendario')) return { success: false, error: 'Voce nao pode remover reunioes.' }
    updateCommercialList('reunioes', current => current.filter(meeting => meeting.id !== id))
    void deleteMeetingFromSupabase(id)
    return { success: true }
  }

  const syncProjectFromContract = contract => db.mutate('projetos', current => {
    const projects = current.projetos || []
    const index = projects.findIndex(project => project.contractId === contract.id)
    const projectFields = {
      contractId: contract.id,
      nome: contract.company,
      clienteNome: contract.company,
      responsavelId: contract.responsavelId || null,
      status: contract.status === 'concluido' ? 'concluido' : contract.status === 'ativo' ? 'ativo' : 'pausado',
      dataInicio: contract.startDate,
      dataFim: contract.endDate,
      valor: Number(contract.value || 0),
      descricao: contract.description || '',
    }
    if (index >= 0) {
      const updated = [...projects]
      updated[index] = { ...updated[index], ...projectFields }
      return { ...current, projetos: updated }
    }
    return {
      ...current,
      projetos: [...projects, {
        id: db.createId(),
        membros: contract.responsavelId ? [contract.responsavelId] : [],
        tarefas: [],
        ...projectFields,
      }],
    }
  })

  const addContract = contract => {
    if (!canUse('comercial.contratos')) return { success: false, error: 'Você não pode cadastrar contratos.' }
    const created = { ...contract, id: db.createId() }
    updateCommercialList('contratos', current => [...current, created])
    syncProjectFromContract(created)
    addNotification({
      usuarioId: null,
      modulo: 'comercial',
      titulo: 'Novo contrato cadastrado',
      descricao: `${created.company} foi adicionado à carteira de contratos`,
      tipo: 'contract',
      link: '/comercial/contratos',
      lidosPor: [user.id],
    })
    return { success: true, contract: created }
  }
  const updateContract = (id, data) => {
    if (!canUse('comercial.contratos')) return { success: false, error: 'Você não pode editar contratos.' }
    let updatedContract = null
    updateCommercialList('contratos', current => current.map(contract => {
      if (contract.id !== id) return contract
      updatedContract = { ...contract, ...data }
      return updatedContract
    }))
    if (updatedContract) syncProjectFromContract(updatedContract)
    return updatedContract
      ? { success: true, contract: updatedContract }
      : { success: false, error: 'Contrato não encontrado.' }
  }
  const deleteContract = id => {
    if (!canUse('comercial.contratos')) return { success: false, error: 'Você não pode remover contratos.' }
    updateCommercialList('contratos', current => current.filter(contract => contract.id !== id))
    db.mutate('projetos', current => ({
      ...current,
      projetos: (current.projetos || []).filter(project => project.contractId !== id),
    }))
    return { success: true }
  }

  const updatePeopleList = (key, updater) => db.mutate('gestaoPessoas', current => ({
    ...current,
    [key]: typeof updater === 'function' ? updater(current[key] || []) : updater,
  }))
  const addCandidate = candidate => {
    if (!canUse('gestaoPessoas.processo')) return { success: false, error: 'Você não pode alterar o processo seletivo.' }
    const created = { ...candidate, id: db.createId() }
    updatePeopleList('processoSeletivo', current => [...current, created])
    return { success: true, candidate: created }
  }
  const updateCandidate = (id, data) => {
    if (!canUse('gestaoPessoas.processo')) return { success: false, error: 'Você não pode alterar o processo seletivo.' }
    updatePeopleList('processoSeletivo', current => current.map(candidate => candidate.id === id ? { ...candidate, ...data } : candidate))
    return { success: true }
  }
  const deleteCandidate = id => {
    if (!canUse('gestaoPessoas.processo')) return { success: false, error: 'Você não pode alterar o processo seletivo.' }
    updatePeopleList('processoSeletivo', current => current.filter(candidate => candidate.id !== id))
    return { success: true }
  }

  const addFeedback = ({ memberId, evaluatorId, text, stars = 5 }) => {
    if (!canSendFeedback(user) || evaluatorId !== user?.id) {
      return { success: false, error: 'Você não pode enviar feedbacks.' }
    }
    const evaluations = [...(db.get('gestaoPessoas').avaliacoes || [])]
    const index = evaluations.findIndex(evaluation => evaluation.membroId === memberId)
    const feedbackId = db.createId()
    const feedback = {
      id: feedbackId,
      texto: text,
      estrelas: stars,
      data: new Date().toISOString().split('T')[0],
      avaliadorId: evaluatorId,
    }

    if (index >= 0) {
      evaluations[index] = {
        ...evaluations[index],
        feedbacks: [feedback, ...(evaluations[index].feedbacks || [])],
      }
    } else {
      evaluations.push({
        id: db.createId(),
        membroId: memberId,
        avaliadorId: evaluatorId,
        nota: 0,
        feedbacks: [feedback],
        metas: [],
        historico: [],
      })
    }
    updatePeopleList('avaliacoes', evaluations)
    const evaluator = members.find(member => member.id === evaluatorId)
    addNotification({
      usuarioId: memberId,
      titulo: 'Novo feedback recebido',
      descricao: `${evaluator?.nome || 'Gestão de Pessoas'} enviou um feedback sobre seu desempenho`,
      tipo: 'sistema',
      link: '/perfil',
    })
    return { success: true, feedback }
  }

  const addNotification = notification => {
    const next = {
      id: db.createId(),
      timestamp: new Date().toISOString(),
      lida: false,
      lidosPor: [],
      ...notification,
    }
    db.mutate('comunicacao', current => ({
      ...current,
      notificacoes: [next, ...(current.notificacoes || [])],
    }))
    void syncNotificationToSupabase(next)
    return next
  }

  const sendMessage = ({ senderId, receiverId = null, channelId = null, content, type = 'direta' }) => {
    const text = content?.trim()
    if (!user || senderId !== user.id || !text) return { success: false, error: 'Mensagem inválida.' }
    if (channelId === 'avisos' && !canPostAnnouncements(user)) {
      return { success: false, error: 'Somente a diretoria pode publicar avisos.' }
    }
    if (receiverId && !db.get('usuarios').some(member => member.id === receiverId && member.status === 'ativo')) {
      return { success: false, error: 'Destinatário indisponível.' }
    }
    const recipient = channelId || receiverId
    const message = {
      id: db.createId(),
      remetenteId: senderId,
      destinatarioId: recipient,
      texto: text,
      timestamp: new Date().toISOString(),
      lida: false,
      lidosPor: channelId ? [senderId] : [],
      tipo: channelId ? 'aviso_geral' : type,
    }
    db.mutate('comunicacao', current => ({
      ...current,
      mensagens: [...(current.mensagens || []), message],
      avisos: channelId === 'avisos' ? [{
        id: db.createId(),
        autorId: senderId,
        titulo: 'Aviso Geral',
        texto: text,
        timestamp: message.timestamp,
        fixado: false,
      }, ...(current.avisos || [])] : (current.avisos || []),
    }))
    void syncMessageToSupabase(message)

    if (channelId === 'avisos') {
      addNotification({
        usuarioId: null,
        titulo: 'Novo aviso geral',
        descricao: text,
        tipo: 'aviso',
        link: '/chat',
        lidosPor: [senderId],
      })
    } else if (receiverId) {
      const sender = members.find(member => member.id === senderId)
      addNotification({
        usuarioId: receiverId,
        titulo: sender?.nome || 'Nova mensagem',
        descricao: text,
        tipo: 'mensagem',
        link: `/chat?user=${senderId}`,
      })
    }

    return { success: true, message }
  }

  const markNotificationRead = (notificationId, userId) => {
    const current = db.get('comunicacao')
    const notifications = (current.notificacoes || []).map(notification => {
      if (notification.id !== notificationId) return notification
      if (notification.usuarioId == null) {
        return { ...notification, lidosPor: [...new Set([...(notification.lidosPor || []), userId])] }
      }
      return { ...notification, lida: true }
    })
    db.set('comunicacao', { ...current, notificacoes: notifications })
    void markRemoteNotificationRead(notificationId, true)
  }

  const markAllNotificationsRead = userId => {
    const current = db.get('comunicacao')
    const notifications = (current.notificacoes || []).map(notification => {
      if (notification.usuarioId != null && notification.usuarioId !== userId) return notification
      if (notification.usuarioId == null) {
        return { ...notification, lidosPor: [...new Set([...(notification.lidosPor || []), userId])] }
      }
      return { ...notification, lida: true }
    })
    db.set('comunicacao', { ...current, notificacoes: notifications })
    notifications
      .filter(notification => notification.usuarioId == null || notification.usuarioId === userId)
      .forEach(notification => { void markRemoteNotificationRead(notification.id, true) })
  }

  return (
    <DataContext.Provider value={{
      members,
      addMember,
      updateMember,
      deleteMember,
      commercial: resolvedCommercial,
      leads: resolvedCommercial.leads || [],
      addLead,
      updateLead,
      deleteLead,
      moveLead,
      meetings: resolvedCommercial.reunioes || [],
      addMeeting,
      updateMeeting,
      deleteMeeting,
      contracts: resolvedCommercial.contratos || [],
      addContract,
      updateContract,
      deleteContract,
      people,
      evaluations: people.avaliacoes || [],
      process: people.processoSeletivo || [],
      addCandidate,
      updateCandidate,
      deleteCandidate,
      addFeedback,
      communication,
      messages: communication.mensagens || [],
      notifications: communication.notificacoes || [],
      notices: communication.avisos || [],
      sendMessage,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      markConversationRead: markConversationReadInDb,
      projectData,
      projects: projectData.projetos || [],
    }}>
      {children}
    </DataContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => useContext(DataContext)
