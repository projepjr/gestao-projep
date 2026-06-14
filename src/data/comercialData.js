// ── Fontes de dados do Comercial ─────────────────────────────
// TODO: [Supabase] substituir por: supabase.from('comercial_semanas').select('*').order('inicio')
// TODO: [Supabase] substituir por: supabase.from('comercial_meses').select('*').order('id')
// TODO: [Supabase] substituir por: supabase.from('comercial_aovivo').select('*').single()
// TODO: [n8n]      preencher aovivo via webhook n8n → Pipefy → Supabase (realtime)

// ── Equipe ────────────────────────────────────────────────────
export const HUNTERS = [
  { id: 'h1', nome: 'Letícia Moraes'   },
  { id: 'h2', nome: 'Pedro Nascimento' },
  { id: 'h3', nome: 'Rafael Souza'     },
]

export const CLOSERS = [
  { id: 'c1', nome: 'Camila Rodrigues' },
  { id: 'c2', nome: 'André Lima'       },
  { id: 'c3', nome: 'Beatriz Ferreira' },
]

// ── Dados Semanais ────────────────────────────────────────────
export const semanas = [
  {
    id: '2026-W22', label: 'Semana 22', inicio: '2026-05-26', fim: '2026-05-30',
    funil: {
      leadsCadastrados:    38,
      ligoesRealizadas:    27,
      reunioesMarcadas:    16,
      reunioesRealizadas:  12,
      propostas:            7,
      negociacoes:          4,
      contratosFechados:    2,
    },
    hunters: [
      { id: 'h1', nome: 'Letícia Moraes',   contatadas: 14, reunioesMarcadas: 6, reunioesRealizadas: 4, noShows: 2 },
      { id: 'h2', nome: 'Pedro Nascimento', contatadas: 13, reunioesMarcadas: 5, reunioesRealizadas: 4, noShows: 1 },
      { id: 'h3', nome: 'Rafael Souza',     contatadas: 11, reunioesMarcadas: 5, reunioesRealizadas: 4, noShows: 1 },
    ],
    closers: [
      { id: 'c1', nome: 'Camila Rodrigues', reunioesRealizadas: 5, noShows: 1, emNegociacao: 2, contratosFechados: 1 },
      { id: 'c2', nome: 'André Lima',       reunioesRealizadas: 4, noShows: 1, emNegociacao: 1, contratosFechados: 1 },
      { id: 'c3', nome: 'Beatriz Ferreira', reunioesRealizadas: 3, noShows: 0, emNegociacao: 1, contratosFechados: 0 },
    ],
    kpis: { ticketMedio: 19500, receitaTotal: 39000, taxaConversao: 5.3 },
  },
  {
    id: '2026-W23', label: 'Semana 23', inicio: '2026-06-02', fim: '2026-06-06',
    funil: {
      leadsCadastrados:    45,
      ligoesRealizadas:    32,
      reunioesMarcadas:    18,
      reunioesRealizadas:  14,
      propostas:            9,
      negociacoes:          5,
      contratosFechados:    3,
    },
    hunters: [
      { id: 'h1', nome: 'Letícia Moraes',   contatadas: 17, reunioesMarcadas: 7, reunioesRealizadas: 5, noShows: 2 },
      { id: 'h2', nome: 'Pedro Nascimento', contatadas: 15, reunioesMarcadas: 6, reunioesRealizadas: 5, noShows: 1 },
      { id: 'h3', nome: 'Rafael Souza',     contatadas: 13, reunioesMarcadas: 5, reunioesRealizadas: 4, noShows: 1 },
    ],
    closers: [
      { id: 'c1', nome: 'Camila Rodrigues', reunioesRealizadas: 5, noShows: 0, emNegociacao: 2, contratosFechados: 2 },
      { id: 'c2', nome: 'André Lima',       reunioesRealizadas: 5, noShows: 1, emNegociacao: 2, contratosFechados: 1 },
      { id: 'c3', nome: 'Beatriz Ferreira', reunioesRealizadas: 4, noShows: 1, emNegociacao: 1, contratosFechados: 0 },
    ],
    kpis: { ticketMedio: 21000, receitaTotal: 63000, taxaConversao: 6.7 },
  },
  {
    id: '2026-W24', label: 'Semana 24', inicio: '2026-06-09', fim: '2026-06-13',
    funil: {
      leadsCadastrados:    52,
      ligoesRealizadas:    38,
      reunioesMarcadas:    22,
      reunioesRealizadas:  17,
      propostas:           11,
      negociacoes:          7,
      contratosFechados:    4,
    },
    hunters: [
      { id: 'h1', nome: 'Letícia Moraes',   contatadas: 20, reunioesMarcadas: 9, reunioesRealizadas: 7, noShows: 2 },
      { id: 'h2', nome: 'Pedro Nascimento', contatadas: 18, reunioesMarcadas: 7, reunioesRealizadas: 6, noShows: 1 },
      { id: 'h3', nome: 'Rafael Souza',     contatadas: 14, reunioesMarcadas: 6, reunioesRealizadas: 4, noShows: 2 },
    ],
    closers: [
      { id: 'c1', nome: 'Camila Rodrigues', reunioesRealizadas: 6, noShows: 1, emNegociacao: 3, contratosFechados: 2 },
      { id: 'c2', nome: 'André Lima',       reunioesRealizadas: 6, noShows: 0, emNegociacao: 2, contratosFechados: 2 },
      { id: 'c3', nome: 'Beatriz Ferreira', reunioesRealizadas: 5, noShows: 0, emNegociacao: 2, contratosFechados: 0 },
    ],
    kpis: { ticketMedio: 22500, receitaTotal: 90000, taxaConversao: 7.7 },
  },
  {
    id: '2026-W25', label: 'Semana 25 (parcial)', inicio: '2026-06-16', fim: '2026-06-20',
    funil: {
      leadsCadastrados:    23,
      ligoesRealizadas:    16,
      reunioesMarcadas:     9,
      reunioesRealizadas:   7,
      propostas:            4,
      negociacoes:          3,
      contratosFechados:    1,
    },
    hunters: [
      { id: 'h1', nome: 'Letícia Moraes',   contatadas:  9, reunioesMarcadas: 4, reunioesRealizadas: 3, noShows: 1 },
      { id: 'h2', nome: 'Pedro Nascimento', contatadas:  8, reunioesMarcadas: 3, reunioesRealizadas: 2, noShows: 1 },
      { id: 'h3', nome: 'Rafael Souza',     contatadas:  6, reunioesMarcadas: 2, reunioesRealizadas: 2, noShows: 0 },
    ],
    closers: [
      { id: 'c1', nome: 'Camila Rodrigues', reunioesRealizadas: 3, noShows: 0, emNegociacao: 1, contratosFechados: 1 },
      { id: 'c2', nome: 'André Lima',       reunioesRealizadas: 2, noShows: 1, emNegociacao: 1, contratosFechados: 0 },
      { id: 'c3', nome: 'Beatriz Ferreira', reunioesRealizadas: 2, noShows: 0, emNegociacao: 1, contratosFechados: 0 },
    ],
    kpis: { ticketMedio: 24000, receitaTotal: 24000, taxaConversao: 4.3 },
  },
]

// ── Dados Mensais ─────────────────────────────────────────────
export const meses = [
  {
    id: '2026-04', label: 'Abril 2026', mes: 'Abril', ano: 2026,
    funil: {
      leadsCadastrados:   142,
      ligoesRealizadas:   103,
      reunioesMarcadas:    58,
      reunioesRealizadas:  44,
      propostas:           28,
      negociacoes:         17,
      contratosFechados:   10,
    },
    hunters: [
      { id: 'h1', nome: 'Letícia Moraes',   contatadas: 55, reunioesMarcadas: 23, reunioesRealizadas: 17, noShows: 6 },
      { id: 'h2', nome: 'Pedro Nascimento', contatadas: 50, reunioesMarcadas: 20, reunioesRealizadas: 15, noShows: 5 },
      { id: 'h3', nome: 'Rafael Souza',     contatadas: 37, reunioesMarcadas: 15, reunioesRealizadas: 12, noShows: 3 },
    ],
    closers: [
      { id: 'c1', nome: 'Camila Rodrigues', reunioesRealizadas: 16, noShows: 3, emNegociacao: 4, contratosFechados: 4 },
      { id: 'c2', nome: 'André Lima',       reunioesRealizadas: 15, noShows: 2, emNegociacao: 3, contratosFechados: 4 },
      { id: 'c3', nome: 'Beatriz Ferreira', reunioesRealizadas: 13, noShows: 2, emNegociacao: 2, contratosFechados: 2 },
    ],
    kpis: { ticketMedio: 18200, receitaTotal: 182000, taxaConversao: 7.0 },
    pipeline: {
      cadastro: 28, naoContatados: 15, perdidos: 22, interesseFuturo: 18,
      diagnostico: 12, proposta: 8, negociacao: 7, ganhos: 10,
    },
  },
  {
    id: '2026-05', label: 'Maio 2026', mes: 'Maio', ano: 2026,
    funil: {
      leadsCadastrados:   156,
      ligoesRealizadas:   118,
      reunioesMarcadas:    67,
      reunioesRealizadas:  52,
      propostas:           34,
      negociacoes:         20,
      contratosFechados:   12,
    },
    hunters: [
      { id: 'h1', nome: 'Letícia Moraes',   contatadas: 62, reunioesMarcadas: 27, reunioesRealizadas: 20, noShows: 7 },
      { id: 'h2', nome: 'Pedro Nascimento', contatadas: 58, reunioesMarcadas: 25, reunioesRealizadas: 19, noShows: 6 },
      { id: 'h3', nome: 'Rafael Souza',     contatadas: 36, reunioesMarcadas: 15, reunioesRealizadas: 13, noShows: 2 },
    ],
    closers: [
      { id: 'c1', nome: 'Camila Rodrigues', reunioesRealizadas: 18, noShows: 2, emNegociacao: 5, contratosFechados: 5 },
      { id: 'c2', nome: 'André Lima',       reunioesRealizadas: 18, noShows: 2, emNegociacao: 4, contratosFechados: 4 },
      { id: 'c3', nome: 'Beatriz Ferreira', reunioesRealizadas: 16, noShows: 1, emNegociacao: 3, contratosFechados: 3 },
    ],
    kpis: { ticketMedio: 19800, receitaTotal: 237600, taxaConversao: 7.7 },
    pipeline: {
      cadastro: 31, naoContatados: 12, perdidos: 26, interesseFuturo: 21,
      diagnostico: 14, proposta: 11, negociacao: 9, ganhos: 12,
    },
  },
  {
    id: '2026-06', label: 'Junho 2026 (parcial)', mes: 'Junho', ano: 2026,
    funil: {
      leadsCadastrados:   120,
      ligoesRealizadas:    86,
      reunioesMarcadas:    49,
      reunioesRealizadas:  38,
      propostas:           24,
      negociacoes:         15,
      contratosFechados:    8,
    },
    hunters: [
      { id: 'h1', nome: 'Letícia Moraes',   contatadas: 46, reunioesMarcadas: 20, reunioesRealizadas: 15, noShows: 5 },
      { id: 'h2', nome: 'Pedro Nascimento', contatadas: 41, reunioesMarcadas: 16, reunioesRealizadas: 13, noShows: 3 },
      { id: 'h3', nome: 'Rafael Souza',     contatadas: 33, reunioesMarcadas: 13, reunioesRealizadas: 10, noShows: 3 },
    ],
    closers: [
      { id: 'c1', nome: 'Camila Rodrigues', reunioesRealizadas: 14, noShows: 1, emNegociacao: 6, contratosFechados: 5 },
      { id: 'c2', nome: 'André Lima',       reunioesRealizadas: 13, noShows: 2, emNegociacao: 5, contratosFechados: 2 },
      { id: 'c3', nome: 'Beatriz Ferreira', reunioesRealizadas: 11, noShows: 1, emNegociacao: 4, contratosFechados: 1 },
    ],
    kpis: { ticketMedio: 22125, receitaTotal: 177000, taxaConversao: 6.7 },
    pipeline: {
      cadastro: 22, naoContatados: 18, perdidos: 19, interesseFuturo: 14,
      diagnostico: 10, proposta: 9, negociacao: 7, ganhos: 8,
    },
  },
]

// ── Ao Vivo ───────────────────────────────────────────────────
// TODO: [n8n + Pipefy] webhook em tempo real → supabase.from('comercial_aovivo').select('*').single()
export const aovivo = {
  ultimaAtualizacao: '2026-06-14T10:00:00',
  funil: {
    leadsCadastrados:   100,
    ligoesRealizadas:    72,
    reunioesMarcadas:    41,
    reunioesRealizadas:  32,
    propostas:           21,
    negociacoes:         12,
    contratosFechados:    7,
  },
  hunters: [
    { id: 'h1', nome: 'Letícia Moraes',   contatadas: 40, reunioesMarcadas: 16, reunioesRealizadas: 12, noShows: 4 },
    { id: 'h2', nome: 'Pedro Nascimento', contatadas: 33, reunioesMarcadas: 13, reunioesRealizadas: 11, noShows: 2 },
    { id: 'h3', nome: 'Rafael Souza',     contatadas: 27, reunioesMarcadas: 12, reunioesRealizadas:  9, noShows: 3 },
  ],
  closers: [
    { id: 'c1', nome: 'Camila Rodrigues', reunioesRealizadas: 11, noShows: 1, emNegociacao: 5, contratosFechados: 4 },
    { id: 'c2', nome: 'André Lima',       reunioesRealizadas: 11, noShows: 1, emNegociacao: 4, contratosFechados: 2 },
    { id: 'c3', nome: 'Beatriz Ferreira', reunioesRealizadas:  9, noShows: 1, emNegociacao: 3, contratosFechados: 1 },
  ],
  kpis: { ticketMedio: 21000, receitaTotal: 147000, taxaConversao: 7.0 },
  pipeline: {
    cadastro: 15, naoContatados: 12, perdidos: 14, interesseFuturo: 10,
    diagnostico: 8, proposta: 7, negociacao: 5, ganhos: 7,
  },
}

const comercialData = { semanas, meses, aovivo }
export default comercialData
