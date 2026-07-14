# AGENTS.md

Instrucoes permanentes para Codex neste repositorio.

## Memoria tecnica

- Antes de qualquer alteracao relevante, consulte `docs/memoria-obsidian`.
- Use a memoria para entender contexto, decisoes tecnicas, bugs anteriores, Supabase, Cloudflare Pages, autenticacao, funil comercial e integracoes n8n/Pipefy.
- Depois de alteracoes relevantes, atualize o arquivo correspondente da memoria.
- O Obsidian e apenas a interface de leitura/edicao; a fonte versionada esta nos arquivos Markdown do repositorio.

## Stack e fontes oficiais

- Projeto: React + Vite.
- Deploy atual: Cloudflare Pages.
- Codigo-fonte: GitHub.
- Banco/autenticacao: Supabase.
- Email transacional/recuperacao: Brevo SMTP via Supabase Auth.
- Dados operacionais reais devem vir do Supabase.
- Nao use Vercel como hospedagem atual; `vercel.json` e apenas legado/historico.

## Dados e seguranca

- Nao registrar credenciais reais na memoria ou no codigo.
- Nunca commitar senhas, tokens, API keys, SMTP keys, `service_role` keys, cookies ou workflows JSON sensiveis.
- Nao usar mock, `localStorage` ou fallback local como fonte principal para dados reais.
- `localStorage` so pode ser usado para preferencias visuais ou cache nao critico.

## Onde registrar mudancas

- Bugs corrigidos: `docs/memoria-obsidian/04_Bugs_e_Correcoes`.
- Decisoes tecnicas: `docs/memoria-obsidian/05_Decisoes_Tecnicas`.
- Deploy, GitHub e Cloudflare: `docs/memoria-obsidian/03_Cloudflare_GitHub`.
- Supabase, banco, Auth e SMTP: `docs/memoria-obsidian/02_Supabase` ou `docs/memoria-obsidian/06_Login_e_Autenticacao`.
- Funil, dashboard comercial, Pipefy e n8n: `docs/memoria-obsidian/07_Funil_Comercial`.

## Git e escopo

- Antes de commit, separe documentacao, codigo e arquivos sensiveis.
- Nao commitar `docs/memoria-obsidian/.obsidian/`, `workflow-*.json`, tokens ou chaves.
- Nao misture mudancas funcionais com atualizacoes de memoria quando o pedido for apenas documentacao.
- Peca confirmacao antes de mudancas destrutivas.
