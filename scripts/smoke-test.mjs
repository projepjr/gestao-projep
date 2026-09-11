import assert from 'node:assert/strict'

const store = new Map()
globalThis.localStorage = {
  getItem: key => store.has(key) ? store.get(key) : null,
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: key => store.delete(key),
  clear: () => store.clear(),
}

const { createServer } = await import('vite')
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
const [{ default: db }, access, authorization, { INITIAL_USUARIOS }, comercialMapper] = await Promise.all([
  vite.ssrLoadModule('/src/data/db.js'),
  vite.ssrLoadModule('/src/config/accessControl.js'),
  vite.ssrLoadModule('/src/config/authorization.js'),
  vite.ssrLoadModule('/src/data/usuarios.js'),
  vite.ssrLoadModule('/src/services/comercialSnapshotMapper.js'),
])

const president = INITIAL_USUARIOS.find(user => user.role === 'presidente')
const hunter = {
  id: 'smoke-hunter',
  role: 'membro',
  permissoes: {
    comercial: true,
    subareas: {
      'comercial.dashboard': false,
      'comercial.gerenciaHunters': false,
      'comercial.meuDesempenho': true,
      'comercial.calendario': false,
      'comercial.equipe': false,
    },
  },
}
const gpDirector = {
  id: 'smoke-gp-director',
  role: 'diretor',
  setorId: 'gestao-pessoas',
  permissoes: {
    gestaoPessoas: true,
    subareas: { 'gestaoPessoas.aprovacoes': true },
  },
}

assert.ok(access.hasPathAccess(president, '/presidencia/seguranca'))
assert.ok(access.hasPathAccess(president, '/comercial'))
assert.equal(access.hasPathAccess(hunter, '/comercial'), false)
assert.ok(access.hasPathAccess(hunter, '/comercial/meu-desempenho'))
assert.equal(access.getDefaultPath(hunter), '/comercial/meu-desempenho')
assert.ok(authorization.canApproveUsers(gpDirector))
assert.equal(authorization.canManagePermissions(gpDirector), false)

const ids = new Set(Array.from({ length: 100 }, () => db.createId()))
assert.equal(ids.size, 100)

const dateRange = { inicio: '2026-08-16', fim: '2026-08-21' }
const field = (label, value) => ({ label, value })
const phase = (name, firstTimeIn) => ({ phase: { name }, firstTimeIn })
const comercialPayload = {
  raw: {
    cards: [
      {
        id: 'diag-outside-range',
        current_phase: { name: 'Proposta Realizada' },
        fields: [
          field('Data e hora da diagnostica agendada', '30/08/2026 09:00'),
          field('Data de entrada', '21/08/2026'),
        ],
        phases_history: [
          phase('Diagnostica Agendada', '2026-08-14T10:00:00Z'),
          phase('Proposta Realizada', '2026-08-21T10:00:00Z'),
        ],
      },
      {
        id: 'diag-inside-range',
        current_phase: { name: 'Diagnostica Agendada' },
        fields: [field('Data e hora da diagnostica agendada', '30/08/2026 10:00')],
        phases_history: [phase('Diagnostica Agendada', '2026-08-17T10:00:00Z')],
      },
      {
        id: 'proposal-outside-range',
        current_phase: { name: 'Negociacao' },
        fields: [
          field('Data e hora da proposta agendada', '30/08/2026 11:00'),
          field('Data de entrada', '20/08/2026'),
        ],
        phases_history: [
          phase('Proposta Agendada', '2026-08-12T10:00:00Z'),
          phase('Negociacao', '2026-08-20T10:00:00Z'),
        ],
      },
      {
        id: 'proposal-inside-range',
        current_phase: { name: 'Proposta Agendada' },
        fields: [field('Data e hora da proposta agendada', '30/08/2026 12:00')],
        phases_history: [phase('Proposta Agendada', '2026-08-18T10:00:00Z')],
      },
      {
        id: 'lost-outside-range',
        current_phase: { name: 'Perdidos' },
        fields: [field('Data de entrada', '19/08/2026')],
        phases_history: [phase('Perdidos', '2026-08-10T10:00:00Z')],
      },
      {
        id: 'lost-inside-range',
        current_phase: { name: 'Perdidos' },
        fields: [],
        phases_history: [phase('Perdidos', '2026-08-19T10:00:00Z')],
      },
      {
        id: 'diag-done-specific-date-outside',
        current_phase: { name: 'Diagnostica Realizada' },
        fields: [
          field('Data da diagnostica realizada', '14/08/2026'),
          field('Status da diagnostica', 'Realizada'),
        ],
        phases_history: [phase('Diagnostica Realizada', '2026-08-19T10:00:00Z')],
      },
      {
        id: 'diag-done-history-fallback-inside',
        current_phase: { name: 'Diagnostica Realizada' },
        fields: [],
        phases_history: [phase('Diagnostica Realizada', '2026-08-20T10:00:00Z')],
      },
      {
        id: 'proposal-done-specific-date-outside',
        current_phase: { name: 'Proposta Realizada' },
        fields: [field('Data da proposta realizada', '12/08/2026')],
        phases_history: [phase('Proposta Realizada', '2026-08-18T10:00:00Z')],
      },
      {
        id: 'proposal-done-history-fallback-inside',
        current_phase: { name: 'Proposta Realizada' },
        fields: [],
        phases_history: [phase('Proposta Realizada', '2026-08-18T10:00:00Z')],
      },
      {
        id: 'contract-specific-date-outside',
        current_phase: { name: 'Contratos Fechados' },
        fields: [
          field('Contrato fechado', 'Sim'),
          field('Data da assinatura do contrato', '10/08/2026'),
        ],
        phases_history: [phase('Contratos Fechados', '2026-08-17T10:00:00Z')],
      },
      {
        id: 'contract-history-fallback-inside',
        current_phase: { name: 'Contratos Fechados' },
        fields: [field('Contrato fechado', 'Sim')],
        phases_history: [phase('Contratos Fechados', '2026-08-17T10:00:00Z')],
      },
      {
        id: 'no-show-specific-date-outside',
        current_phase: { name: 'Pendentes / No-show' },
        fields: [
          field('Foi no-show?', 'Sim'),
          field('Etapa que aconteceu no-show', 'Diagnostica'),
          field('Data do no-show', '11/08/2026'),
          field('Status da diagnostica', 'No-show'),
          field('Data e hora da diagnostica agendada', '19/08/2026 09:00'),
        ],
        phases_history: [phase('Pendentes / No-show', '2026-08-19T10:00:00Z')],
      },
      {
        id: 'no-show-history-fallback-inside',
        current_phase: { name: 'Pendentes / No-show' },
        fields: [
          field('Foi no-show?', 'Sim'),
          field('Etapa que aconteceu no-show', 'Diagnostica'),
        ],
        phases_history: [phase('Pendentes / No-show', '2026-08-19T10:00:00Z')],
      },
    ],
  },
}
const comercialPeriod = comercialMapper.mapComercialSnapshot(comercialPayload, { range: dateRange })
assert.equal(comercialPeriod.historico.diagnosticasAgendadas, 1)
assert.equal(comercialPeriod.historico.propostasAgendadas, 1)
assert.equal(comercialPeriod.historico.perdidos, 1)

const mapRegressionCards = prefix => comercialMapper.mapComercialSnapshot({
  raw: { cards: comercialPayload.raw.cards.filter(card => card.id.startsWith(prefix)) },
}, { range: dateRange })

assert.equal(mapRegressionCards('diag-done').historico.diagnosticasRealizadas, 1)
assert.equal(mapRegressionCards('proposal-done').historico.propostasRealizadas, 1)
assert.equal(mapRegressionCards('contract-').historico.contratosFechados, 1)
assert.equal(mapRegressionCards('no-show').historico.noShowsDiagnostica, 1)

const lossNoShowMembers = [
  { id: 'julia', nome: 'Julia Franco Dantas', email: 'julia@projepjr.com' },
  { id: 'closer', nome: 'Closer Teste', email: 'closer@projepjr.com' },
]
const lossNoShowCommercial = {
  equipe: {
    hunters: [{ id: 'hunter-julia', userId: 'julia', pipefyName: 'Julia Franco Dantas', active: true }],
    closers: [{ id: 'closer-teste', userId: 'closer', pipefyName: 'Closer Teste', active: true }],
  },
}
const lossNoShowPayload = {
  raw: {
    cards: [
      {
        id: 'lost-unanswered-diagnostic',
        current_phase: { name: 'Perdidos' },
        fields: [
          field('Data de entrada na fase perdidos', '19/08/2026'),
          field('Motivo comercial da perda', 'Sem resposta no follow up'),
          field('Responsavel pela perda', 'Julia Franco Dantas'),
          field('Data e hora da diagnostica agendada', '18/08/2026 09:00'),
        ],
        phases_history: [
          phase('Diagnostica Agendada', '2026-08-17T10:00:00Z'),
          phase('Perdidos', '2026-08-19T10:00:00Z'),
        ],
      },
      {
        id: 'lost-unanswered-proposal',
        current_phase: { name: 'Perdidos' },
        fields: [
          field('Data de entrada na fase perdidos', '20/08/2026'),
          field('Motivo comercial da perda', 'Sem resposta no follow-up'),
          field('Responsavel pela perda', 'Closer Teste'),
          field('Data e hora da proposta agendada', '20/08/2026 14:00'),
        ],
        phases_history: [
          phase('Proposta Agendada', '2026-08-18T10:00:00Z'),
          phase('Perdidos', '2026-08-20T10:00:00Z'),
        ],
      },
      {
        id: 'lost-other-reason',
        current_phase: { name: 'Perdidos' },
        fields: [
          field('Data de entrada na fase perdidos', '20/08/2026'),
          field('Motivo comercial da perda', 'Sem fit comercial'),
          field('Responsavel pela perda', 'Julia Franco Dantas'),
          field('Data e hora da diagnostica agendada', '20/08/2026 15:00'),
        ],
        phases_history: [phase('Perdidos', '2026-08-20T10:00:00Z')],
      },
      {
        id: 'lost-unanswered-outside-range',
        current_phase: { name: 'Perdidos' },
        fields: [
          field('Data de entrada na fase perdidos', '15/08/2026'),
          field('Motivo comercial da perda', 'Sem resposta no follow up'),
          field('Responsavel pela perda', 'Julia Franco Dantas'),
          field('Data e hora da diagnostica agendada', '14/08/2026 09:00'),
        ],
        phases_history: [phase('Perdidos', '2026-08-15T10:00:00Z')],
      },
    ],
  },
}
const lossNoShowPeriod = comercialMapper.mapComercialSnapshot(lossNoShowPayload, {
  members: lossNoShowMembers,
  commercial: lossNoShowCommercial,
  range: dateRange,
})
assert.equal(lossNoShowPeriod.historico.noShowsDiagnostica, 1)
assert.equal(lossNoShowPeriod.historico.noShowsProposta, 1)
assert.equal(lossNoShowPeriod.historico.perdidos, 3)
assert.equal(lossNoShowPeriod.hunters.find(row => row.userId === 'julia')?.noShows, 1)
assert.equal(lossNoShowPeriod.closers.find(row => row.userId === 'closer')?.noShows, 1)

const lostContactPayload = {
  raw: {
    cards: [
      {
        id: 'lost-contact-no-interest',
        current_phase: { name: 'Perdidos' },
        fields: [
          field('Data da primeira ligacao', '18/08/2026'),
          field('Data de entrada na fase perdidos', '18/08/2026'),
          field('Motivo comercial da perda', 'Sem interesse'),
          field('Responsavel pela perda', 'Julia Franco Dantas'),
        ],
      },
      {
        id: 'lost-contact-unqualified-fallback',
        current_phase: { name: 'Perdidos' },
        fields: [
          field('Data de entrada na fase perdidos', '19/08/2026'),
          field('Motivo comercial da perda', 'Não qualificado'),
          field('Responsavel pela perda', 'Julia Franco Dantas'),
        ],
      },
      {
        id: 'lost-contact-price-outside-range',
        current_phase: { name: 'Perdidos' },
        fields: [
          field('Data da primeira ligacao', '15/08/2026'),
          field('Data de entrada na fase perdidos', '19/08/2026'),
          field('Motivo comercial da perda', 'Preço'),
          field('Responsavel pela perda', 'Julia Franco Dantas'),
        ],
      },
      {
        id: 'lost-without-contact-no-answer',
        current_phase: { name: 'Perdidos' },
        fields: [
          field('Data da primeira ligacao', '18/08/2026'),
          field('Data de entrada na fase perdidos', '18/08/2026'),
          field('Motivo comercial da perda', 'Não atendeu'),
          field('Responsavel pela perda', 'Julia Franco Dantas'),
        ],
      },
      {
        id: 'lost-without-contact-invalid-number',
        current_phase: { name: 'Perdidos' },
        fields: [
          field('Data de entrada na fase perdidos', '18/08/2026'),
          field('Motivo comercial da perda', 'Número incorreto / não existe'),
          field('Responsavel pela perda', 'Julia Franco Dantas'),
        ],
      },
      {
        id: 'lost-ambiguous-other',
        current_phase: { name: 'Perdidos' },
        fields: [
          field('Data de entrada na fase perdidos', '18/08/2026'),
          field('Motivo comercial da perda', 'Outro'),
          field('Responsavel pela perda', 'Julia Franco Dantas'),
        ],
      },
      {
        id: 'lost-contact-funnel-and-reason-once',
        current_phase: { name: 'Perdidos' },
        fields: [
          field('Data da primeira ligacao', '17/08/2026'),
          field('Data de entrada na fase perdidos', '20/08/2026'),
          field('Motivo comercial da perda', 'Sem interesse'),
          field('Responsavel pela perda', 'Julia Franco Dantas'),
          field('Responsavel', 'Julia Franco Dantas'),
        ],
        phases_history: [phase('Diagnostica Agendada', '2026-08-17T10:00:00Z')],
      },
    ],
  },
}
const lostContactPeriod = comercialMapper.mapComercialSnapshot(lostContactPayload, {
  members: lossNoShowMembers,
  commercial: lossNoShowCommercial,
  range: dateRange,
})
assert.equal(lostContactPeriod.historico.leadsContatados, 3)
assert.equal(lostContactPeriod.hunters.find(row => row.userId === 'julia')?.leadsContatados, 3)

console.log('Smoke tests passed: access, IDs, commercial event dates, loss no-shows and lost contacts.')
await vite.close()
