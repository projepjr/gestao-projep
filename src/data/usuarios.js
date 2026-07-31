// Fonte única de verdade — usuários/membros da PROJEP.
// A base inicial mantém apenas o acesso administrador para começar cadastros reais.
// Os demais membros devem ser cadastrados em Gestão de Pessoas > Membros.

export const INITIAL_USUARIOS = [
  {
    id: 1,
    nome: 'Felipe Daniel',
    email: 'felipedaniel.wk@gmail.com',
    emailAliases: ['presidente@gestaoej.com'],
    senha: '123456',
    cargo: 'Presidente',
    setorId: 'diretoria',
    setor: 'Diretoria',
    dataCadastro: '2025-01-01',
    fotoPerfil: null,
    telefone: '',
    avatar: 'FD',
    skills: ['Liderança', 'Estratégia'],
    performance: 0,
    projects: 0,
    status: 'ativo',
    role: 'presidente',
    precisaAtualizarDados: false,
    permissoes: {
      presidencia: true,
      adminFinanceiro: true,
      comercial: true,
      projetos: true,
      marketing: true,
      gestaoPessoas: true,
      membros: true,
      subareas: {
        'presidencia.seguranca': true,
        'comercial.dashboard': true,
        'comercial.meuDesempenho': true,
        'comercial.pipeline': true,
        'comercial.calendario': true,
        'comercial.ranking': true,
        'comercial.contratos': true,
        'gestaoPessoas.dashboard': true,
        'gestaoPessoas.membros': true,
        'gestaoPessoas.processo': true,
        'gestaoPessoas.aprovacoes': true,
      },
    },
  },
]
