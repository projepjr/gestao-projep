# Regras para agentes

Este arquivo resume regras operacionais para Codex, Claude/Claude Code e pessoas trabalhando no `gestao-projep`.

## Antes de alterar

- Consultar `docs/memoria-obsidian` antes de qualquer alteracao relevante.
- Ler o codigo real envolvido antes de propor ou aplicar mudancas.
- Nao misturar contexto do Gestao Projep com LocarTech.
- Pedir confirmacao antes de mudancas destrutivas, migracoes irreversiveis ou remocao de dados.

## Depois de alterar

- Atualizar a memoria correspondente quando houver bug corrigido, decisao tecnica, mudanca de fluxo, integracao ou deploy.
- Separar commits de documentacao e codigo quando o escopo permitir.
- Conferir `git status --short` antes de finalizar.

## Dados e integracoes

- Supabase e a fonte principal de dados operacionais.
- Cloudflare Pages e a hospedagem oficial atual.
- Vercel deve ser tratado apenas como legado/historico.
- Nao introduzir mock, `localStorage` ou fallback local como fonte oficial para dados reais.
- `localStorage` so pode guardar preferencias visuais ou cache nao critico.
- Se o Supabase estiver vazio, a interface deve continuar visivel com estado vazio correto, sem inventar dados.
- Pipefy comercial: o unico pipeline autorizado para alteracoes e `307256948`.
- Nao editar, excluir, renomear, mover fases, criar campos ou alterar configuracoes em qualquer outro pipeline do Pipefy.

## Seguranca

- Nunca commitar senhas, tokens, API keys, SMTP keys, `service_role` keys, cookies ou segredos.
- Nunca commitar arquivos locais do Obsidian.
- Nunca commitar workflows JSON sensiveis.
- Chaves privadas do Pipefy/n8n/Supabase devem ficar fora do front-end.

## Onde registrar

- Bugs e correcoes: `04_Bugs_e_Correcoes`.
- Decisoes tecnicas: `05_Decisoes_Tecnicas`.
- Supabase, Auth, banco e SMTP: `02_Supabase` e `06_Login_e_Autenticacao`.
- Cloudflare Pages, GitHub e deploy: `03_Cloudflare_GitHub`.
- Funil comercial, Pipefy e n8n: `07_Funil_Comercial`.
