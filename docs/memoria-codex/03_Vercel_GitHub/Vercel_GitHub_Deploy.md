# Vercel e GitHub

## Hospedagem

O sistema esta hospedado na Vercel.

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
5. Vercel faz deploy automatico da branch configurada.

## Variaveis de ambiente na Vercel

Para o front-end Vite, configurar:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Nao configurar variaveis com prefixo `NEXT_PUBLIC_`, pois o projeto nao e Next.js.

Nao expor no front-end:

- `service_role` key do Supabase;
- token privado do Pipefy;
- token do n8n;
- senha SMTP/Brevo.

## Rotas importantes para Auth

Para recuperacao de senha, a Vercel precisa servir a rota SPA:

```text
/redefinir-senha
```

No Supabase Auth, essa URL tambem precisa estar permitida como redirect.

