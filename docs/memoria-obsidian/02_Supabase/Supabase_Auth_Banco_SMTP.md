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
- `chat_messages`
- `notifications`
- `sectors`
- `comercial_dashboard_snapshots`

Essas tabelas aparecem em `src/services/supabaseBridge.js` e nas leituras da dashboard comercial.

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

