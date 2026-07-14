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
```

Nao configurar variaveis com prefixo `NEXT_PUBLIC_`, pois o projeto nao e Next.js.

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
