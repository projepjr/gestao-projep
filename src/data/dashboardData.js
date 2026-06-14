// Estrutura preparada para ser alimentada pelo n8n via API.
// Substitua os dados estáticos por um fetch() quando integrar.

const HUNTERS_W20 = [
  { nome: 'João Silva',   contatadas: 28, reunioesMarcadas:  7, reunioesRealizadas:  5, noShows: 2 },
  { nome: 'Ana Costa',    contatadas: 22, reunioesMarcadas:  5, reunioesRealizadas:  4, noShows: 1 },
  { nome: 'Pedro Alves',  contatadas: 31, reunioesMarcadas:  8, reunioesRealizadas:  6, noShows: 2 },
  { nome: 'Lucas Mendes', contatadas: 19, reunioesMarcadas:  4, reunioesRealizadas:  3, noShows: 1 },
]
const CLOSERS_W20 = [
  { nome: 'Mariana Lima', reunioesRealizadas:  5, noShows: 1, followUps: 3, contratosFechados: 1 },
  { nome: 'Rafael Souza', reunioesRealizadas:  4, noShows: 0, followUps: 2, contratosFechados: 1 },
  { nome: 'Camila Rocha', reunioesRealizadas:  6, noShows: 2, followUps: 3, contratosFechados: 2 },
]

const HUNTERS_W21 = [
  { nome: 'João Silva',   contatadas: 33, reunioesMarcadas:  9, reunioesRealizadas:  7, noShows: 2 },
  { nome: 'Ana Costa',    contatadas: 27, reunioesMarcadas:  7, reunioesRealizadas:  6, noShows: 1 },
  { nome: 'Pedro Alves',  contatadas: 38, reunioesMarcadas: 10, reunioesRealizadas:  8, noShows: 2 },
  { nome: 'Lucas Mendes', contatadas: 24, reunioesMarcadas:  6, reunioesRealizadas:  5, noShows: 1 },
]
const CLOSERS_W21 = [
  { nome: 'Mariana Lima', reunioesRealizadas:  7, noShows: 1, followUps: 3, contratosFechados: 2 },
  { nome: 'Rafael Souza', reunioesRealizadas:  6, noShows: 1, followUps: 3, contratosFechados: 2 },
  { nome: 'Camila Rocha', reunioesRealizadas:  8, noShows: 2, followUps: 4, contratosFechados: 3 },
]

const HUNTERS_W22 = [
  { nome: 'João Silva',   contatadas: 38, reunioesMarcadas: 10, reunioesRealizadas:  8, noShows: 2 },
  { nome: 'Ana Costa',    contatadas: 30, reunioesMarcadas:  8, reunioesRealizadas:  6, noShows: 2 },
  { nome: 'Pedro Alves',  contatadas: 43, reunioesMarcadas: 12, reunioesRealizadas:  9, noShows: 3 },
  { nome: 'Lucas Mendes', contatadas: 28, reunioesMarcadas:  7, reunioesRealizadas:  6, noShows: 1 },
]
const CLOSERS_W22 = [
  { nome: 'Mariana Lima', reunioesRealizadas:  8, noShows: 2, followUps: 4, contratosFechados: 3 },
  { nome: 'Rafael Souza', reunioesRealizadas:  6, noShows: 1, followUps: 3, contratosFechados: 2 },
  { nome: 'Camila Rocha', reunioesRealizadas:  9, noShows: 2, followUps: 4, contratosFechados: 3 },
]

const HUNTERS_W23 = [
  { nome: 'João Silva',   contatadas: 40, reunioesMarcadas: 11, reunioesRealizadas:  8, noShows: 3 },
  { nome: 'Ana Costa',    contatadas: 32, reunioesMarcadas:  8, reunioesRealizadas:  7, noShows: 1 },
  { nome: 'Pedro Alves',  contatadas: 45, reunioesMarcadas: 12, reunioesRealizadas: 10, noShows: 2 },
  { nome: 'Lucas Mendes', contatadas: 29, reunioesMarcadas:  7, reunioesRealizadas:  6, noShows: 1 },
]
const CLOSERS_W23 = [
  { nome: 'Mariana Lima', reunioesRealizadas:  8, noShows: 2, followUps: 4, contratosFechados: 3 },
  { nome: 'Rafael Souza', reunioesRealizadas:  7, noShows: 1, followUps: 3, contratosFechados: 2 },
  { nome: 'Camila Rocha', reunioesRealizadas:  9, noShows: 2, followUps: 5, contratosFechados: 3 },
]

const HUNTERS_W24 = [
  { nome: 'João Silva',   contatadas: 42, reunioesMarcadas: 11, reunioesRealizadas:  8, noShows: 3 },
  { nome: 'Ana Costa',    contatadas: 35, reunioesMarcadas:  9, reunioesRealizadas:  7, noShows: 2 },
  { nome: 'Pedro Alves',  contatadas: 48, reunioesMarcadas: 13, reunioesRealizadas: 10, noShows: 3 },
  { nome: 'Lucas Mendes', contatadas: 31, reunioesMarcadas:  7, reunioesRealizadas:  6, noShows: 1 },
]
const CLOSERS_W24 = [
  { nome: 'Mariana Lima', reunioesRealizadas:  8, noShows: 2, followUps: 4, contratosFechados:  3 },
  { nome: 'Rafael Souza', reunioesRealizadas:  7, noShows: 1, followUps: 3, contratosFechados:  2 },
  { nome: 'Camila Rocha', reunioesRealizadas: 10, noShows: 3, followUps: 5, contratosFechados:  4 },
]

export const dashboardData = {
  // ── Semanas ────────────────────────────────────────────────
  semanas: [
    {
      id: 'W20', numero: 20,
      label: 'Semana 20 — 11/05 a 15/05',
      inicio: '2026-05-11', fim: '2026-05-15',
      hunters: HUNTERS_W20,
      closers: CLOSERS_W20,
      funil: { leadsCadastrados: 18, ligoesRealizadas: 42, reunioesMarcadas: 22, propostaOuNegociacao:  8, contratosFechados:  4 },
    },
    {
      id: 'W21', numero: 21,
      label: 'Semana 21 — 18/05 a 22/05',
      inicio: '2026-05-18', fim: '2026-05-22',
      hunters: HUNTERS_W21,
      closers: CLOSERS_W21,
      funil: { leadsCadastrados: 22, ligoesRealizadas: 56, reunioesMarcadas: 29, propostaOuNegociacao: 10, contratosFechados:  7 },
    },
    {
      id: 'W22', numero: 22,
      label: 'Semana 22 — 25/05 a 29/05',
      inicio: '2026-05-25', fim: '2026-05-29',
      hunters: HUNTERS_W22,
      closers: CLOSERS_W22,
      funil: { leadsCadastrados: 25, ligoesRealizadas: 63, reunioesMarcadas: 33, propostaOuNegociacao: 12, contratosFechados:  8 },
    },
    {
      id: 'W23', numero: 23,
      label: 'Semana 23 — 01/06 a 05/06',
      inicio: '2026-06-01', fim: '2026-06-05',
      hunters: HUNTERS_W23,
      closers: CLOSERS_W23,
      funil: { leadsCadastrados: 26, ligoesRealizadas: 68, reunioesMarcadas: 35, propostaOuNegociacao: 13, contratosFechados:  8 },
    },
    {
      id: 'W24', numero: 24,
      label: 'Semana 24 — 09/06 a 13/06',
      inicio: '2026-06-09', fim: '2026-06-13',
      hunters: HUNTERS_W24,
      closers: CLOSERS_W24,
      funil: { leadsCadastrados: 28, ligoesRealizadas: 71, reunioesMarcadas: 38, propostaOuNegociacao: 14, contratosFechados: 11 },
    },
  ],

  // ── Meses ──────────────────────────────────────────────────
  meses: [
    {
      id: 'M01', label: 'Janeiro 2026',
      hunters: [
        { nome: 'João Silva',   contatadas:  95, reunioesMarcadas: 24, reunioesRealizadas: 18, noShows:  6 },
        { nome: 'Ana Costa',    contatadas:  78, reunioesMarcadas: 20, reunioesRealizadas: 15, noShows:  5 },
        { nome: 'Pedro Alves',  contatadas: 108, reunioesMarcadas: 28, reunioesRealizadas: 22, noShows:  6 },
        { nome: 'Lucas Mendes', contatadas:  62, reunioesMarcadas: 15, reunioesRealizadas: 12, noShows:  3 },
      ],
      closers: [
        { nome: 'Mariana Lima', reunioesRealizadas: 18, noShows:  4, followUps:  7, contratosFechados:  5 },
        { nome: 'Rafael Souza', reunioesRealizadas: 15, noShows:  2, followUps:  6, contratosFechados:  4 },
        { nome: 'Camila Rocha', reunioesRealizadas: 22, noShows:  6, followUps:  9, contratosFechados:  7 },
      ],
      funil: { leadsCadastrados: 52, ligoesRealizadas: 138, reunioesMarcadas:  72, propostaOuNegociacao: 24, contratosFechados: 16 },
      kpis: { ticketMedio: 4200, contratosFechados: 16 },
    },
    {
      id: 'M02', label: 'Fevereiro 2026',
      hunters: [
        { nome: 'João Silva',   contatadas: 110, reunioesMarcadas: 28, reunioesRealizadas: 21, noShows:  7 },
        { nome: 'Ana Costa',    contatadas:  92, reunioesMarcadas: 24, reunioesRealizadas: 18, noShows:  6 },
        { nome: 'Pedro Alves',  contatadas: 124, reunioesMarcadas: 32, reunioesRealizadas: 25, noShows:  7 },
        { nome: 'Lucas Mendes', contatadas:  74, reunioesMarcadas: 18, reunioesRealizadas: 14, noShows:  4 },
      ],
      closers: [
        { nome: 'Mariana Lima', reunioesRealizadas: 21, noShows:  5, followUps:  9, contratosFechados:  7 },
        { nome: 'Rafael Souza', reunioesRealizadas: 18, noShows:  3, followUps:  7, contratosFechados:  5 },
        { nome: 'Camila Rocha', reunioesRealizadas: 25, noShows:  7, followUps: 11, contratosFechados:  9 },
      ],
      funil: { leadsCadastrados: 62, ligoesRealizadas: 162, reunioesMarcadas:  86, propostaOuNegociacao: 28, contratosFechados: 21 },
      kpis: { ticketMedio: 4450, contratosFechados: 21 },
    },
    {
      id: 'M03', label: 'Março 2026',
      hunters: [
        { nome: 'João Silva',   contatadas: 128, reunioesMarcadas: 33, reunioesRealizadas: 25, noShows:  8 },
        { nome: 'Ana Costa',    contatadas: 108, reunioesMarcadas: 28, reunioesRealizadas: 21, noShows:  7 },
        { nome: 'Pedro Alves',  contatadas: 145, reunioesMarcadas: 38, reunioesRealizadas: 30, noShows:  8 },
        { nome: 'Lucas Mendes', contatadas:  86, reunioesMarcadas: 21, reunioesRealizadas: 17, noShows:  4 },
      ],
      closers: [
        { nome: 'Mariana Lima', reunioesRealizadas: 25, noShows:  6, followUps: 11, contratosFechados:  8 },
        { nome: 'Rafael Souza', reunioesRealizadas: 21, noShows:  3, followUps:  9, contratosFechados:  6 },
        { nome: 'Camila Rocha', reunioesRealizadas: 30, noShows:  8, followUps: 13, contratosFechados: 11 },
      ],
      funil: { leadsCadastrados: 74, ligoesRealizadas: 192, reunioesMarcadas: 102, propostaOuNegociacao: 34, contratosFechados: 25 },
      kpis: { ticketMedio: 4600, contratosFechados: 25 },
    },
    {
      id: 'M04', label: 'Abril 2026',
      hunters: [
        { nome: 'João Silva',   contatadas: 142, reunioesMarcadas: 37, reunioesRealizadas: 28, noShows:  9 },
        { nome: 'Ana Costa',    contatadas: 118, reunioesMarcadas: 30, reunioesRealizadas: 23, noShows:  7 },
        { nome: 'Pedro Alves',  contatadas: 160, reunioesMarcadas: 42, reunioesRealizadas: 33, noShows:  9 },
        { nome: 'Lucas Mendes', contatadas:  95, reunioesMarcadas: 24, reunioesRealizadas: 19, noShows:  5 },
      ],
      closers: [
        { nome: 'Mariana Lima', reunioesRealizadas: 28, noShows:  7, followUps: 12, contratosFechados:  9 },
        { nome: 'Rafael Souza', reunioesRealizadas: 23, noShows:  4, followUps: 10, contratosFechados:  7 },
        { nome: 'Camila Rocha', reunioesRealizadas: 33, noShows:  9, followUps: 14, contratosFechados: 12 },
      ],
      funil: { leadsCadastrados: 82, ligoesRealizadas: 218, reunioesMarcadas: 116, propostaOuNegociacao: 38, contratosFechados: 28 },
      kpis: { ticketMedio: 4650, contratosFechados: 28 },
    },
    {
      id: 'M05', label: 'Maio 2026',
      hunters: [
        { nome: 'João Silva',   contatadas: 155, reunioesMarcadas: 40, reunioesRealizadas: 30, noShows: 10 },
        { nome: 'Ana Costa',    contatadas: 128, reunioesMarcadas: 33, reunioesRealizadas: 25, noShows:  8 },
        { nome: 'Pedro Alves',  contatadas: 175, reunioesMarcadas: 46, reunioesRealizadas: 36, noShows: 10 },
        { nome: 'Lucas Mendes', contatadas: 108, reunioesMarcadas: 26, reunioesRealizadas: 21, noShows:  5 },
      ],
      closers: [
        { nome: 'Mariana Lima', reunioesRealizadas: 30, noShows:  8, followUps: 13, contratosFechados: 10 },
        { nome: 'Rafael Souza', reunioesRealizadas: 26, noShows:  4, followUps: 10, contratosFechados:  7 },
        { nome: 'Camila Rocha', reunioesRealizadas: 36, noShows: 10, followUps: 15, contratosFechados: 13 },
      ],
      funil: { leadsCadastrados: 88, ligoesRealizadas: 232, reunioesMarcadas: 124, propostaOuNegociacao: 42, contratosFechados: 30 },
      kpis: { ticketMedio: 4750, contratosFechados: 30 },
    },
    {
      id: 'M06', label: 'Junho 2026',
      hunters: [
        { nome: 'João Silva',   contatadas: 168, reunioesMarcadas: 44, reunioesRealizadas: 32, noShows: 12 },
        { nome: 'Ana Costa',    contatadas: 140, reunioesMarcadas: 36, reunioesRealizadas: 28, noShows:  8 },
        { nome: 'Pedro Alves',  contatadas: 192, reunioesMarcadas: 52, reunioesRealizadas: 40, noShows: 12 },
        { nome: 'Lucas Mendes', contatadas: 124, reunioesMarcadas: 28, reunioesRealizadas: 24, noShows:  4 },
      ],
      closers: [
        { nome: 'Mariana Lima', reunioesRealizadas: 32, noShows:  8, followUps: 14, contratosFechados: 11 },
        { nome: 'Rafael Souza', reunioesRealizadas: 28, noShows:  4, followUps: 11, contratosFechados:  8 },
        { nome: 'Camila Rocha', reunioesRealizadas: 40, noShows: 12, followUps: 16, contratosFechados: 14 },
      ],
      funil: { leadsCadastrados: 96, ligoesRealizadas: 248, reunioesMarcadas: 132, propostaOuNegociacao: 44, contratosFechados: 33 },
      kpis: { ticketMedio: 4850, contratosFechados: 33 },
    },
  ],

  semanaAtualIdx: 4,
  mesAtualIdx: 5,
}
