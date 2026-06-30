# Memoria tecnica Codex - PROJEP

Esta pasta registra o contexto tecnico do sistema `gestao-projep` para orientar manutencoes futuras feitas por pessoas ou por agentes de codigo.

O objetivo nao e substituir o codigo, e sim manter uma memoria objetiva sobre arquitetura, decisoes, fluxos e cuidados ja identificados no projeto.

## Estrutura

- `00_Contexto_do_Site/`: visao geral do produto, stack e modulos.
- `01_Codex_Prompts/`: instrucoes recorrentes para trabalhar neste repositorio.
- `02_Supabase/`: uso de Supabase Auth, banco, SMTP e variaveis.
- `03_Vercel_GitHub/`: memoria sobre hospedagem e deploy.
- `04_Bugs_e_Correcoes/`: historico tecnico de bugs corrigidos ou investigados.
- `05_Decisoes_Tecnicas/`: decisoes arquiteturais importantes.
- `06_Login_e_Autenticacao/`: fluxo de login, cadastro, aprovacao e recuperacao.
- `07_Funil_Comercial/`: dashboard comercial, Pipefy, n8n e snapshots.

## Stack real

- Front-end: React + Vite.
- Estilo: Tailwind CSS.
- Roteamento: React Router.
- Banco e autenticacao: Supabase.
- Hospedagem: Vercel.
- Codigo-fonte: GitHub.

Este projeto nao usa Next.js.

## Regras de seguranca

- Nao salvar senhas em texto puro.
- Nao versionar API keys privadas, SMTP keys, `service_role` keys ou tokens do Pipefy.
- Usar somente variaveis publicas do Vite quando a chave puder estar no navegador.
- Para Supabase no front-end, usar:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
- `localStorage` pode ser cache ou fallback, mas nao deve ser fonte principal de dados importantes.

