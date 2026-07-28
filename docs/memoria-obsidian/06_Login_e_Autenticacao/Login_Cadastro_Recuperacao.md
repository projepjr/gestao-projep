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

## Alteracao de email

Arquivos principais:

- `src/pages/Perfil.jsx`
- `src/contexts/AuthContext.jsx`
- `src/services/supabaseBridge.js`

Regra oficial:

- O email nao deve ser alterado diretamente em `profiles`/`usuarios` pela tela de perfil.
- O perfil deve solicitar senha atual antes de qualquer disparo, mostrar uma confirmacao explicita no site e so entao chamar `supabase.auth.updateUser({ email })`.
- O Supabase Auth envia o email de confirmacao usando o mesmo SMTP configurado para recuperacao de senha (Brevo SMTP).
- O email do perfil so deve ser sincronizado depois que o Supabase Auth confirmar a troca.
- No login, se a autenticacao pelo Supabase retornar um usuario cujo `supabaseId` ja existe no perfil, mas o email do perfil ainda esta antigo, o app reconcilia o perfil com o email confirmado.
- A confirmacao e enviada apenas para o novo email. Nao ha confirmacao pelo email antigo neste fluxo.

Motivo:

Editar apenas o email do perfil desassocia a identidade visual do app da credencial real do Supabase Auth. Isso quebra login, troca de senha e exclusao de conta, porque a senha continua vinculada ao email antigo no Auth.

Migracao manual de email de outra conta:

- O front-end com `VITE_SUPABASE_PUBLISHABLE_KEY` nao deve alterar email Auth de outro usuario.
- Para corrigir uma conta de outra pessoa, usar o painel do Supabase Auth ou uma rotina server-side segura com service role fora do front-end.
- Nunca salvar `service_role` no codigo, memoria ou variaveis publicas do Vite.

## Bugs corrigidos ou investigados

Pelo historico recente do repo:

- Usuario aprovado nao conseguia logar em outro navegador quando a aprovacao ficava apenas local.
- Fluxo de recuperacao simulava codigo na tela; foi migrado para Supabase Auth.
- Erro `{}` na recuperacao foi tratado para exibir mensagem real ou amigavel.
- Acesso rapido demo foi removido da tela de login.
- Sessao foi isolada por aba para evitar troca inesperada de usuario entre abas.
- Contas novas nao devem herdar notificacoes globais antigas; o sininho deve iniciar zerado para o novo membro.
- Contas novas aprovadas ou cadastradas diretamente pelo GP nao devem receber acesso automatico por setor/cargo.
- Permissao de modulo nao libera subareas automaticamente. Subareas como Pipeline e Calendario Comercial precisam ser liberadas explicitamente em Presidencia > Seguranca.
- O sininho de notificacoes e o alternador claro/escuro devem permanecer visiveis no header mesmo quando o usuario nao tem notificacoes.
- Excecao de Presidencia: liberar o modulo Presidencia libera a subarea Seguranca e permite administrar permissoes, mesmo que o cargo do usuario nao seja `presidente`.
- Edicao direta de email pelo perfil podia quebrar a conta ao atualizar o email no perfil, mas nao no Supabase Auth. O fluxo correto passou a exigir senha e confirmacao por email via Supabase Auth/Brevo.
- Cadastro podia acusar email ja existente por causa de usuarios antigos reidratados do cache local. O fluxo de cadastro passou a sincronizar `profiles`/`permissions` do Supabase antes da verificacao de duplicidade, mantendo o banco remoto como fonte principal.

## Exclusao da propria conta

Arquivo principal: `src/pages/Perfil.jsx`, com logica em `src/contexts/AuthContext.jsx`.

Cada usuario pode solicitar a exclusao da propria conta pelo perfil:

1. Clica em `Excluir minha conta`, abaixo de `Alterar Senha`.
2. Confirma a senha atual.
3. Depois da senha correta, confirma uma mensagem irreversivel.
4. O perfil e removido do Supabase/app, vinculos operacionais sao limpos quando possivel e a sessao e encerrada.

Essa exclusao propria nao muda a regra administrativa: excluir outro membro continua respeitando `canDeleteMember`, incluindo o bloqueio de remocao de contas de Presidencia por terceiros.

## Exclusao completa no Supabase Auth

Problema identificado: remover um membro pelo site apagava o perfil operacional em `public.profiles`, mas nao removia necessariamente o usuario em `Authentication > Users`. Isso acontece porque o front-end usa apenas `VITE_SUPABASE_PUBLISHABLE_KEY`, que nao tem permissao para executar `auth.admin.deleteUser`.

Correcao tecnica:

- foi criada a Edge Function `supabase/functions/delete-auth-user`;
- a funcao deve usar `SUPABASE_SERVICE_ROLE_KEY` apenas como secret do Supabase, nunca no codigo do front-end;
- `deleteUserFromSupabase` agora tenta chamar essa funcao antes do fallback de apagar apenas `profiles`;
- autoexclusao e exclusao administrativa sao validadas no servidor;
- se a funcao ainda nao estiver publicada, o app continua removendo o perfil, mas o Auth pode manter usuarios orfaos.

Acao operacional pendente quando houver usuarios antigos orfaos: remover uma vez pelo painel do Supabase Auth ou publicar a Edge Function e executar limpeza administrativa segura. Nao colocar `service_role` no Vite/Cloudflare Pages.
