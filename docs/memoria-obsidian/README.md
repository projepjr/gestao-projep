# Memoria Obsidian - PROJEP

Esta pasta registra o contexto tecnico do sistema `gestao-projep` para orientar manutencoes futuras feitas por pessoas, Codex, Claude/Claude Code e outros agentes de codigo.

O objetivo nao e substituir o codigo, e sim manter uma memoria objetiva sobre arquitetura, decisoes, fluxos e cuidados ja identificados no projeto. Ela fica dentro do repositorio para acompanhar o codigo e ser navegada/editada tambem pelo Obsidian.

Antes de alteracoes relevantes, Codex e Claude devem consultar esta memoria tecnica do projeto para preservar contexto, decisoes e riscos conhecidos.

Obsidian e apenas a interface de leitura, navegacao e edicao. A memoria oficial sao estes arquivos Markdown dentro do repositorio.

## Estrutura

- `00_Contexto_do_Site/`: visao geral do produto, stack e modulos.
- `00_Contexto_do_Site/Regras_Para_Agentes.md`: regras operacionais para Codex, Claude e pessoas do projeto.
- `01_Codex_Prompts/`: instrucoes recorrentes para agentes trabalharem neste repositorio.
- `02_Supabase/`: uso de Supabase Auth, banco, SMTP e variaveis.
- `03_Cloudflare_GitHub/`: memoria sobre hospedagem, Cloudflare Pages, GitHub e deploy.
- `04_Bugs_e_Correcoes/`: historico tecnico de bugs corrigidos ou investigados.
- `05_Decisoes_Tecnicas/`: decisoes arquiteturais importantes.
- `06_Login_e_Autenticacao/`: fluxo de login, cadastro, aprovacao e recuperacao.
- `07_Funil_Comercial/`: dashboard comercial, Pipefy, n8n e snapshots.

## Como usar

- Antes de mudar codigo, consultar a pasta relacionada ao tema.
- Depois de corrigir bugs, atualizar `04_Bugs_e_Correcoes`.
- Depois de decidir arquitetura ou regra permanente, atualizar `05_Decisoes_Tecnicas`.
- Depois de alterar deploy, repositorio, Cloudflare ou rotas de producao, atualizar `03_Cloudflare_GitHub`.
- Depois de alterar Supabase, Auth, SMTP ou recuperacao de senha, atualizar `02_Supabase` ou `06_Login_e_Autenticacao`.
- Depois de alterar funil, dashboard comercial, Pipefy ou n8n, atualizar `07_Funil_Comercial`.
- Antes de commit, separar mudancas de memoria, codigo funcional e arquivos sensiveis.

## Stack real

- Front-end: React + Vite.
- Estilo: Tailwind CSS.
- Roteamento: React Router.
- Banco e autenticacao: Supabase.
- Hospedagem: Cloudflare Pages.
- Codigo-fonte: GitHub.
- Emails transacionais/recuperacao de senha: Brevo SMTP via Supabase Auth.

Este projeto nao usa Next.js.

## Regras de seguranca

- Nao salvar senhas em texto puro.
- Nao versionar API keys privadas, SMTP keys, `service_role` keys ou tokens do Pipefy.
- Usar somente variaveis publicas do Vite quando a chave puder estar no navegador.
- Para Supabase no front-end, usar:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
- `localStorage` pode ser cache ou fallback, mas nao deve ser fonte principal de dados importantes.
- Dados operacionais devem vir do Supabase, nao de `localStorage`, mock ou fallback local.
- Rotas internas do React Router em producao dependem de `public/_redirects` com `/* /index.html 200`.
