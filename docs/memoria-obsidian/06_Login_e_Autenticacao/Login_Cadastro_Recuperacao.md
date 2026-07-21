# Login, cadastro, aprovacao e recuperacao de senha

## Arquivos principais

- `src/pages/Login.jsx`
- `src/contexts/AuthContext.jsx`
- `src/lib/supabase.js`
- `src/services/supabaseBridge.js`
- `src/pages/gp/Aprovacoes.jsx`
- `src/pages/gp/Membros.jsx`
- `src/config/accessControl.js`
- `src/config/authorization.js`

## Login

O login deve validar credenciais pelo Supabase Auth.

O fluxo em `AuthContext.jsx`:

1. Normaliza email com trim e lowercase.
2. Tenta sincronizar usuarios/perfis do Supabase.
3. Chama `signInWithSupabaseAuth`.
4. Localiza o perfil aprovado correspondente.
5. Bloqueia usuarios pendentes, rejeitados ou inativos.
6. Persiste a sessao segura para a aba atual.

## Sessao

O projeto usa `sessionStorage` para a sessao ativa, com fallback de leitura de `localStorage` para compatibilidade antiga.

Diretriz:

- `sessionStorage`: sessao ativa por aba/navegador.
- `localStorage`: nao deve ser usado como fonte principal de autenticacao.

## Cadastro pelo proprio usuario

Fluxo esperado:

1. Usuario cria conta na tela de login.
2. Conta e criada no Supabase Auth.
3. Perfil e salvo/sincronizado no banco.
4. Usuario fica com status `pendente`.
5. Diretoria/presidencia aprova ou rejeita.

Usuario pendente nao deve acessar o sistema.

## Aprovacao

Arquivo principal: `src/pages/gp/Aprovacoes.jsx`.

Ao aprovar:

- status vira `ativo`;
- permissoes sao normalizadas;
- perfil e permissoes sao salvos no Supabase;
- o usuario nao recebe permissao operacional automaticamente;
- a liberacao de modulos e subareas deve ser feita pela Presidencia em `Presidencia > Seguranca`;
- a notificacao de aprovacao nao deve gerar badge nao lido para o membro aprovado.

## Cadastro direto pelo GP

Arquivo principal: `src/pages/gp/Membros.jsx`, com logica em `DataContext.jsx`.

Ao cadastrar membro:

- cria credencial no Supabase Auth;
- salva perfil no banco;
- pode usar dados temporarios;
- o membro deve nascer sem acesso a modulos/subareas ate a Presidencia liberar;
- senha temporaria padrao deve ser usada apenas para primeiro acesso e nao deve virar fonte principal em `localStorage`.

## Recuperacao de senha

Arquivo principal: `src/pages/Login.jsx`.

O fluxo correto:

1. Usuario informa email.
2. Sistema chama `supabase.auth.resetPasswordForEmail`.
3. Supabase envia email real.
4. Usuario acessa `/redefinir-senha`.
5. Sistema troca a senha com `supabase.auth.updateUser`.

Mensagem de sucesso:

```text
Se este e-mail estiver cadastrado, enviamos um link de recuperação.
```

O site nao deve mostrar codigo de recuperacao diretamente na tela.

## Bugs corrigidos ou investigados

Pelo historico recente do repo:

- Usuario aprovado nao conseguia logar em outro navegador quando a aprovacao ficava apenas local.
- Fluxo de recuperacao simulava codigo na tela; foi migrado para Supabase Auth.
- Erro `{}` na recuperacao foi tratado para exibir mensagem real ou amigavel.
- Acesso rapido demo foi removido da tela de login.
- Sessao foi isolada por aba para evitar troca inesperada de usuario entre abas.
- Contas novas nao devem herdar notificacoes globais antigas; o sininho deve iniciar zerado para o novo membro.
- Contas novas aprovadas ou cadastradas diretamente pelo GP nao devem receber acesso automatico por setor/cargo.
