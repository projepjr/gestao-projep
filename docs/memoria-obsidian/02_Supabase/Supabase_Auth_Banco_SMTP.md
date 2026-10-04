# Supabase: Auth, banco e SMTP

## Arquivos principais

- `src/lib/supabase.js`
- `src/services/supabaseBridge.js`
- `src/contexts/AuthContext.jsx`
- `src/contexts/DataContext.jsx`

## Variaveis de ambiente

O front-end Vite le:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Nao usar `NEXT_PUBLIC_`, pois este projeto nao e Next.js.

Nao versionar:

- `SUPABASE_SERVICE_ROLE_KEY`
- SMTP password
- tokens do Pipefy
- tokens do n8n
- senhas de usuarios

## Supabase Auth

O fluxo atual usa Supabase Auth como fonte principal de autenticacao.

Funcoes observadas em `src/services/supabaseBridge.js`:

- `createSupabaseAuthAccount`
- `signInWithSupabaseAuth`
- `sendSupabasePasswordReset`
- `updateSupabaseAuthPassword`
- `signOutFromSupabase`

Operacoes usadas:

- `supabase.auth.signUp(...)`
- `supabase.auth.signInWithPassword(...)`
- `supabase.auth.resetPasswordForEmail(...)`
- `supabase.auth.exchangeCodeForSession(...)`
- `supabase.auth.updateUser(...)`
- `supabase.auth.signOut(...)`

## Banco de dados Supabase

Pelo codigo, o sistema sincroniza ou le dados como:

- `profiles`
- `permissions`
- `meetings`
- `meeting_responsibles`
- `notifications`
- `sectors`
- `comercial_dashboard_snapshots`

Essas tabelas aparecem em `src/services/supabaseBridge.js` e nas leituras da dashboard comercial.

Observacao 2026-07-29: `chat_messages` ficou como estrutura legada no banco. O front-end nao usa mais chat interno; a area ativa e o diretorio de membros em `/membros`.

## SMTP e recuperacao de senha

O projeto usa Supabase Auth para recuperacao real de senha.

Contexto operacional registrado pelo projeto: Brevo SMTP foi configurado para envio de email de recuperacao pelo Supabase.

Cuidados:

- Nao expor credenciais SMTP no codigo.
- Configurar redirect URL no painel do Supabase Auth.
- Para producao, permitir:

```text
https://gestao-projep.vercel.app/redefinir-senha
```

- Para desenvolvimento local, permitir a URL local usada no Vite, por exemplo:

```text
http://localhost:5174/redefinir-senha
```

## Tratamento de erros

`sendSupabasePasswordReset` registra o erro completo no console e tenta exibir mensagem legivel na interface.

Casos tratados:

- rate limit de email;
- SMTP invalido;
- redirect URL nao permitida;
- usuario nao encontrado;
- erro vazio `{}` retornado pelo Supabase.

## Agenda em comum - 2026-10-02

- O aplicativo `agenda-em-comum` foi migrado do D1 para o projeto Supabase `gestaoprojep.com`.
- Foram criadas as tabelas isoladas `agenda_users`, `agenda_availability` e `agenda_meetings`, todas com RLS habilitado e indices para as consultas por usuario/data.
- Quatro usuarios demonstrativos e 66 intervalos existentes foram migrados e conferidos.
- Como o prototipo ainda nao usa Supabase Auth real, as politicas permitem acesso anonimo apenas nas tabelas prefixadas com `agenda_`. Essa permissao deve ser substituida por politicas baseadas em `auth.uid()` antes do uso produtivo.
- A migracao versionada e o guia de handoff estao no repositorio separado `https://github.com/projepjr/agenda-em-comum`.
- O Security Advisor continua apontando problemas preexistentes fora do escopo da agenda: nove tabelas publicas sem RLS e a view `comercial_dashboard_snapshot` como security definer. Nao foram alterados automaticamente para evitar quebrar o sistema principal.

## Agenda em comum - edicao e reunioes - 2026-10-04

- `agenda_meetings` recebeu as colunas `title` e `meeting_group_id`; um mesmo agendamento com varias pessoas compartilha o mesmo grupo.
- A API passou a aceitar atualizacao de disponibilidade e cancelamento de reuniao, com politicas RLS correspondentes para o prototipo anonimo.
- A leitura de reunioes passou a retornar todos os agendamentos para suportar os filtros `Minhas` e `Todas`.
- A restricao continua a mesma: as politicas anonimas existem apenas para a demonstracao e precisam ser substituidas por Supabase Auth e `auth.uid()` antes de dados reais.
- O Security Advisor foi executado apos a migracao. Nao surgiu alerta novo nas tabelas `agenda_`; permanecem os alertas preexistentes das tabelas antigas e da view `comercial_dashboard_snapshot`.
- `agenda_meetings` recebeu `meeting_type` (`AP` ou `DIAG`) e `status` (`scheduled`, `happened`, `no_show` ou `rescheduling`) com constraints no banco.
- A atualizacao de reuniao grava nome, tipo, status, data, horario e duracao em todas as linhas do mesmo `meeting_group_id`.
- O cancelamento agora valida se o usuario demonstrativo participa do encontro antes de remover o grupo completo.
