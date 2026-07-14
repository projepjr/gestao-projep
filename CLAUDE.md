# CLAUDE.md

Instrucoes permanentes para Claude/Claude Code neste repositorio.

## Memoria do projeto

- Consulte `docs/memoria-obsidian` antes de alteracoes relevantes.
- Use essa memoria como fonte de contexto tecnico do projeto Gestao Projep.
- Atualize a memoria apos mudancas importantes, correcoes de bugs, decisoes tecnicas ou alteracoes de integracao.
- Nao invente arquitetura: confirme na memoria e no codigo real antes de agir.
- O Obsidian e apenas uma interface para visualizar e editar os arquivos Markdown versionados.

## Stack atual

- Front-end: React + Vite.
- Hospedagem oficial: Cloudflare Pages.
- Codigo-fonte: GitHub.
- Banco e autenticacao: Supabase.
- Email transacional/recuperacao: Brevo SMTP via Supabase Auth.
- Integracoes especificas: n8n e Pipefy.

Vercel nao e a hospedagem atual. Se aparecer, trate como legado/historico, nao como caminho de deploy ativo.

## Regras de dados

- Supabase e a fonte principal para dados operacionais.
- Nao usar mock, `localStorage` ou fallback local como fonte de dados reais.
- `localStorage` so deve guardar preferencias visuais ou cache nao critico.
- Se o Supabase retornar vazio, preserve a interface e mostre estado vazio correto; nao invente dados.

## Seguranca

- Nao exponha nem salve senhas, tokens, API keys, SMTP keys, `service_role` keys, cookies ou segredos.
- Nao commite arquivos locais do Obsidian nem workflows JSON sensiveis.

## Registro na memoria

- Bugs: `docs/memoria-obsidian/04_Bugs_e_Correcoes`.
- Decisoes tecnicas: `docs/memoria-obsidian/05_Decisoes_Tecnicas`.
- Cloudflare/GitHub/deploy: `docs/memoria-obsidian/03_Cloudflare_GitHub`.
- Supabase/Auth/SMTP: `docs/memoria-obsidian/02_Supabase` e `docs/memoria-obsidian/06_Login_e_Autenticacao`.
- Comercial/Pipefy/n8n: `docs/memoria-obsidian/07_Funil_Comercial`.

Antes de finalizar, confira `git status --short` e separe documentacao, codigo e arquivos sensiveis.
