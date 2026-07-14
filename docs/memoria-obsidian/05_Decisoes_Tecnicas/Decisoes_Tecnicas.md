# Decisoes tecnicas

## React + Vite

O projeto e uma SPA em React + Vite. Nao usar padroes especificos de Next.js.

## Supabase como fonte principal

Decisao: dados importantes devem ficar no Supabase, nao apenas no navegador.

Isso inclui:

- autenticacao;
- perfis;
- status de aprovacao;
- permissoes;
- mensagens;
- notificacoes;
- reunioes;
- snapshots comerciais.

`localStorage` ainda existe em `src/data/db.js`, mas deve ser tratado como cache/fallback/compatibilidade, nao como fonte principal para dados criticos.

## Auth

Decisao: Supabase Auth e a fonte principal para login e recuperacao de senha.

Consequencias:

- nao salvar senha em texto puro;
- nao exibir codigo de recuperacao no site;
- usar fluxo real de email;
- manter redirect `/redefinir-senha`.

## Sessao

Decisao: usar `sessionStorage` para a sessao ativa da aba.

Motivo:

- evitar que duas contas em abas/navegadores diferentes sobrescrevam a sessao uma da outra.

## Comercial

Decisao: dashboard comercial deve ser snapshot-driven.

Fluxo esperado:

1. Pipefy contem o pipeline comercial.
2. n8n coleta dados do Pipefy.
3. n8n grava snapshot no Supabase.
4. Front-end le `comercial_dashboard_snapshots`.
5. `mapComercialSnapshot` transforma os dados para a dashboard.

## Seguranca de chaves

Decisao: nenhuma chave privada deve entrar no repositorio.

Permitido no front-end:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Nao permitido no front-end:

- Supabase `service_role`;
- token Pipefy;
- token n8n;
- credenciais SMTP/Brevo;
- senhas de usuarios.

