# Visao geral do site

O `gestao-projep` e um sistema web interno da PROJEP Jr para gestao de setores, pessoas, comunicacao, projetos e comercial.

## Stack

- React.
- Vite.
- Tailwind CSS.
- React Router.
- Supabase Auth.
- Supabase Database.
- Vercel.
- GitHub.

O projeto e um SPA Vite. Nao e Next.js.

## Modulos principais observados

- Login e autenticacao: `src/pages/Login.jsx`, `src/contexts/AuthContext.jsx`.
- Estado/dados do app: `src/contexts/DataContext.jsx`, `src/data/db.js`.
- Supabase: `src/lib/supabase.js`, `src/services/supabaseBridge.js`.
- Comercial:
  - `src/pages/comercial/Dashboard.jsx`
  - `src/pages/comercial/Pipeline.jsx`
  - `src/pages/comercial/Calendario.jsx`
  - `src/pages/comercial/Equipe.jsx`
  - `src/pages/comercial/Ranking.jsx`
  - `src/pages/comercial/Contratos.jsx`
  - `src/services/comercialSnapshotMapper.js`
- Gestao de Pessoas:
  - `src/pages/gp/Membros.jsx`
  - `src/pages/gp/Aprovacoes.jsx`
  - `src/pages/gp/Dashboard.jsx`
- Presidencia e permissoes:
  - `src/pages/presidencia/Seguranca.jsx`
  - `src/config/accessControl.js`
  - `src/config/authorization.js`
  - `src/config/rolePresets.js`
- Projetos:
  - `src/pages/projetos/BaseConhecimento.jsx`
  - `src/data/projetos.js`
- Chat:
  - `src/pages/Chat.jsx`

## Fonte de verdade

O projeto ainda possui uma camada local em `src/data/db.js`, mas os dados importantes devem ser sincronizados com Supabase.

Diretriz atual:

- Supabase Auth e a fonte principal para autenticacao.
- Supabase Database e a fonte principal para perfis, aprovacoes, permissoes, comunicacao, reunioes e snapshots.
- `localStorage` nao deve ser tratado como fonte principal para dados criticos.
- `sessionStorage` e usado para isolar a sessao ativa por aba/navegador.

## Deploy

O fluxo operacional observado e:

1. Codigo no GitHub.
2. Deploy automatico pela Vercel a partir da branch principal.
3. Variaveis de ambiente configuradas na Vercel para o front-end Vite.

