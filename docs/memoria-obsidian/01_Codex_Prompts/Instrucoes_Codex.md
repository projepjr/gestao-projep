# Instrucoes para agentes neste projeto

Use este arquivo como guia antes de fazer alteracoes no `gestao-projep`. A memoria tecnica em `docs/memoria-obsidian` deve ser consultada por Codex, Claude/Claude Code e por pessoas trabalhando no projeto.

## Postura de trabalho

- Antes de corrigir algo "desconexo", ler os arquivos reais envolvidos.
- Evitar solucao isolada em componente quando o problema e de fonte de dados.
- Corrigir a origem do dado sempre que possivel.
- Nao inventar dados de membros, setores, funil ou credenciais.
- Nao mexer em dashboard/comercial/chat quando o pedido for restrito a login, e vice-versa.
- Preservar o layout quando o pedido for apenas logico.

## Comandos de verificacao

Antes de finalizar alteracoes relevantes:

```bash
npm run lint
npm run build
```

O build pode emitir aviso de chunks grandes por causa de bibliotecas e dashboard; isso nao e erro se o build terminar com sucesso.

## Seguranca

Nunca inserir no codigo:

- Senhas reais.
- SMTP password.
- `service_role` key do Supabase.
- Token privado do Pipefy.
- Tokens do n8n.

Variaveis publicas do Vite devem manter o prefixo `VITE_`.

## Regras importantes ja aprendidas

- O projeto e React + Vite, nao Next.js.
- Usar `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Supabase Auth deve ser a fonte principal de autenticacao.
- `localStorage` nao deve ser fonte principal para dados importantes.
- Ao alterar login/cadastro/aprovacao, validar fluxo em outro navegador ou aba anonima.
- Ao alterar chat/notificacoes, testar dois usuarios diferentes.
- Ao alterar funil comercial, diferenciar estoque atual do pipeline e historico/eventos usados em filtros por periodo.
