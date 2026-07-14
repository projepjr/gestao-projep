# Bugs e correcoes registradas

Este arquivo resume problemas ja corrigidos ou investigados no projeto, com base no historico recente do repositorio e nos arquivos atuais.

## Login e autenticacao

- Usuario aprovado nao conseguia logar em outro navegador.
  - Causa provavel: aprovacao/perfil ainda dependia de estado local ou sincronizacao incompleta.
  - Correcao: fluxo passou a criar/validar credencial pelo Supabase Auth e sincronizar perfil/permissoes.

- Recuperacao de senha simulada com codigo exibido na tela.
  - Correcao: migrado para Supabase Auth com email real de recuperacao.

- Erro `{}` aparecia na tela de recuperacao.
  - Correcao: erro completo passou a ser registrado no console e a interface passou a extrair `message`, `status`, `name` e `code`.

- Acesso rapido demo aparecia no login.
  - Correcao: bloco removido.

## Sessao e sincronizacao

- Conta ativa podia aparentar trocar entre abas/usuarios.
  - Correcao: sessao ativa isolada em `sessionStorage`, preservando fallback antigo de `localStorage`.

- Chat e notificacoes tiveram problemas de sincronizacao entre usuarios.
  - Area relacionada: `src/pages/Chat.jsx`, `src/services/supabaseBridge.js`, `src/contexts/DataContext.jsx`.

## Comercial

- Dashboard usando pipeline errado.
  - Regra atual: usar pipe comercial `307210845`.

- Filtro semanal originalmente nao cobria domingo/sabado.
  - Regra atual: semana comercial de domingo a sabado.

- `Tentativa de Contato` contava pela movimentacao do card em vez da data real do primeiro contato.
  - Regra atual: usar `Data da primeira ligação` ou `Data da primeira ligação / contato`.

- No-show de diagnostica/proposta podia ser classificado incorretamente.
  - Regra: usar campo que indique em qual etapa ocorreu o no-show.

## Projetos

- Status `Conclu?do` aparecia nos cards da Base de Conhecimento.
  - Correcao: registros em `src/data/projetos.js` ajustados para `Concluído`.

