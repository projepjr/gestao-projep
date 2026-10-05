# Cloudflare Pages e GitHub

## Hospedagem

O deploy oficial atual do sistema esta na Cloudflare Pages.

Configuracao operacional:

- Framework preset: React (Vite).
- Build command: `npm run build`.
- Build output directory: `dist`.
- Branch de producao: `main`.

## Codigo-fonte

O codigo-fonte fica no GitHub.

Fluxo operacional usado no projeto:

1. Alterar arquivos no repositorio local.
2. Rodar verificacoes quando houver mudanca relevante:

```bash
npm run lint
npm run build
```

3. Fazer commit.
4. Fazer push para GitHub.
5. Cloudflare Pages faz deploy automatico da branch configurada.

## Variaveis de ambiente na Cloudflare Pages

Para o front-end Vite, configurar:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_N8N_GLOBAL_REFRESH_WEBHOOK_URL=
VITE_N8N_DOCUMENT_ANALYSIS_WEBHOOK_URL=
```

`VITE_N8N_GLOBAL_REFRESH_WEBHOOK_URL` e opcional e deve apontar para um webhook publico do n8n que atualiza Pipefy -> Supabase. Nao usar token privado nessa URL.

`VITE_N8N_DOCUMENT_ANALYSIS_WEBHOOK_URL` aponta para o webhook publico do n8n usado pela tela Adm e Fin > Analise de Documentos. Esse webhook chama a Claude/Anthropic API pelo ambiente do n8n; a chave da IA nunca deve ficar no front-end.

Nao configurar variaveis com prefixo `NEXT_PUBLIC_`, pois o projeto nao e Next.js.

Observacao operacional:

- Variaveis com prefixo `VITE_` sao aplicadas em tempo de build.
- Depois de criar ou alterar variaveis `VITE_`, e necessario gerar novo deploy na Cloudflare Pages.

Nao expor no front-end:

- `service_role` key do Supabase;
- token privado do Pipefy;
- token do n8n;
- senha SMTP/Brevo.

## Rotas importantes para Auth

Para recuperacao de senha e rotas internas, a Cloudflare Pages precisa servir a rota SPA:

```text
/redefinir-senha
```

No Supabase Auth, essa URL tambem precisa estar permitida como redirect.

O arquivo `public/_redirects` deve existir com:

```text
/* /index.html 200
```

O arquivo `vercel.json` ainda pode existir como configuracao legada, mas nao deve ser tratado como deploy oficial enquanto Cloudflare Pages for a hospedagem ativa.
## Agenda em comum - 2026-10-02

- O codigo foi publicado em um repositorio separado: `https://github.com/projepjr/agenda-em-comum`.
- O repositorio contem a aplicacao, a migracao Supabase, `.env.example` e `HANDOFF.md` para continuidade por outro desenvolvedor ou assistente.
- A publicacao no Cloudflare depende de concluir a autorizacao OAuth do Wrangler na conta correta.
- A autorizacao foi concluida na conta `presidencia@projepjr.com` e o Worker `agenda-em-comum-projep` foi publicado em `https://agenda-em-comum-projep.presidencia-1d5.workers.dev`.
- A rota `/api/agenda` foi validada em producao lendo os quatro usuarios e as 66 disponibilidades migradas do Supabase.

## Agenda em comum - interface e reunioes - 2026-10-04

- A interface mobile foi simplificada e o CTA grande de cruzar agendas foi removido da tela inicial.
- Tocar numa disponibilidade agora abre a edicao de data e horario; a exclusao fica somente no botao de lixeira da janela.
- A selecao de pessoas ficou compacta e ganhou filtros por funcao.
- O agendamento agora pede apenas o nome da reuniao, e a aba Reunioes ganhou filtros por semana/mes e Minhas/Todas.
- O deploy continua no Worker `agenda-em-comum-projep`; nao usar Vercel para este aplicativo.
- A aba Reunioes passou a usar calendario semanal em cinco colunas, com varias semanas empilhadas na visao mensal.
- Os cards de reuniao abrem uma janela compacta de edicao; a exclusao saiu do card e ficou dentro dessa janela.
- O agendamento diferencia AP e DIAG, e os cards usam verde, vermelho ou amarelo claro para Aconteceu, No show e Reagendando.
- O refinamento visual seguinte passou a usar a altura disponivel do celular no calendario, reduziu o CTA de disponibilidade e compactou a selecao de pessoas.
- O campo Encontrar inicia sem participante selecionado; estados vazios nao usam mais texto sobreposto ao calendario.
- As lixeiras de edicao agora usam icone vetorial preto, e as cores finais sao verde claro para Aconteceu, vermelho escuro para No show e laranja para Reagendando.
- Horarios ocupados por reunioes deixaram de aparecer em Encontrar, e a API tambem recusa conflitos para evitar reserva dupla.
- Os status visuais finais sao: Aconteceu em verde, No-show em roxo, Interesse futuro em amarelo, Remarcando em laranja e Descartado em vermelho vibrante.
- O deploy do aplicativo deve sempre usar explicitamente o Worker `agenda-em-comum-projep`. O `vite.config.ts` nao emite valores vazios para `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`; ambos ficam configurados como secrets no Worker para que um build sem `.env` nao apague os bindings de producao.
- O nome exibido e os metadados do aplicativo passaram a ser `Portal de Agendas Projep Jr.`; o endereco do Worker permanece o mesmo para nao quebrar links existentes.
