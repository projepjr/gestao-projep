# Decisoes tecnicas

## React + Vite

O projeto e uma SPA em React + Vite. Nao usar padroes especificos de Next.js.

## Supabase como fonte principal

Decisao: dados importantes devem ficar no Supabase, nao apenas no navegador.

Isso inclui:

- autenticacao;
- perfis;
- status de aprovacao;
- permissoes;
- notificacoes;
- reunioes;
- snapshots comerciais.

`localStorage` ainda existe em `src/data/db.js`, mas deve ser tratado como cache/fallback/compatibilidade, nao como fonte principal para dados criticos.

## Sincronizacao e performance

Decisao: Supabase Realtime deve ser o caminho principal para atualizar notificacoes, permissoes e dados compartilhados entre navegadores.

Polling automatico deve existir apenas como fallback de seguranca, em intervalos moderados. Evitar buscas completas em intervalos muito curtos, porque cada sincronizacao pode atualizar o estado global do React e gerar travamentos perceptiveis conforme a base cresce.

Atualizacao 2026-07-29: a sincronizacao global foi separada em dois fluxos no `supabaseBridge`:

- dados do app: perfis, permissoes, reunioes e responsaveis;
- comunicacao: notificacoes e avisos.

Snapshots comerciais (`comercial_dashboard_snapshots`) nao devem disparar sincronizacao global do `DataContext`, porque os payloads do Pipefy sao grandes e podem travar a interface. As paginas comerciais que precisam desses snapshots devem buscar os dados diretamente, com limites pequenos e timeout defensivo.

O polling de comunicacao deve continuar apenas como fallback do Realtime. Intervalos curtos demais aumentam re-renderizacoes sem melhorar o uso normal quando o Realtime esta ativo.

## Auth

Decisao: Supabase Auth e a fonte principal para login e recuperacao de senha.

Consequencias:

- nao salvar senha em texto puro;
- nao exibir codigo de recuperacao no site;
- usar fluxo real de email;
- manter redirect `/redefinir-senha`.

## Sessao

Decisao: usar `sessionStorage` para a sessao ativa da aba.

Motivo:

- evitar que duas contas em abas/navegadores diferentes sobrescrevam a sessao uma da outra.

## Comercial

Decisao: dashboard comercial deve ser snapshot-driven.

Fluxo esperado:

1. Pipefy contem o pipeline comercial.
2. n8n coleta dados do Pipefy.
3. n8n grava snapshot no Supabase.
4. Front-end le `comercial_dashboard_snapshots`.
5. `mapComercialSnapshot` transforma os dados para a dashboard.

## Seguranca de chaves

Decisao: nenhuma chave privada deve entrar no repositorio.

Permitido no front-end:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Nao permitido no front-end:

- Supabase `service_role`;
- token Pipefy;
- token n8n;
- credenciais SMTP/Brevo;
- senhas de usuarios.

## Ordem global da sidebar

Decisao: a ordem das subpaginas da sidebar e uma configuracao global do sistema, nao uma preferencia local do navegador.

Implementacao:

- a estrutura oficial de setores e subareas continua em `src/config/accessControl.js`;
- a ordem customizada fica em `configuracoes.navigation.sidebarOrder`;
- a sincronizacao remota usa a tabela `notifications` com `type = app_config`, seguindo o mesmo padrao usado pela configuracao da equipe comercial;
- `src/components/Layout.jsx` aplica a ordem salva sem duplicar a lista de modulos;
- diretores podem editar a ordem dos setores aos quais possuem acesso;
- usuarios com autoridade de Presidencia podem editar qualquer setor editavel;
- Atualizacao 2026-07-29: o modulo de chat interno foi removido/desativado. A area global ativa passou a ser `Membros`, com rota `/membros`. A rota antiga `/chat` redireciona para `/membros` por compatibilidade.
- A pagina global `Membros` deve funcionar como diretorio compacto, com cards pequenos, avatares proporcionais e sem area de conversa. O icone global deve ser diferente do icone do setor `Gestao de Pessoas` para evitar ambiguidade visual.
- Modais abertos por clique devem fechar tambem com a tecla `Esc`, alem do botao visual de fechar e clique no fundo, para manter a navegacao mais rapida.
- a interface de edicao da ordem deve usar arrastar e soltar, nao botoes de seta, para ficar mais intuitiva para diretores e Presidencia.

Regra: nao salvar essa ordem em `localStorage` como fonte oficial, porque a mudanca precisa aparecer igual para todos os usuarios.

## Performance e sincronizacao

Atualizacao 2026-08-01: para reduzir travamentos no uso diario, as telas comerciais que dependem de snapshots grandes do Pipefy passaram a compartilhar a busca por `src/services/comercialDashboardData.js`.

Decisoes:

- evitar queries duplicadas para `comercial_dashboard_snapshots` em `Dashboard`, `Leads`, `Equipe` e `Meu Desempenho`;
- usar cache curto em memoria para snapshot comercial, com TTL de 60 segundos;
- reutilizar a mesma promise quando varias telas pedem o snapshot ao mesmo tempo;
- manter o botao global de atualizar como caminho para forcar busca nova (`force: true`);
- reduzir polling global do `DataContext` para 5 minutos, usando Realtime e atualizacao manual como caminhos principais;
- cachear tambem o resultado mapeado do snapshot comercial por snapshot + composicao da equipe, evitando recalcular a dashboard inteira a cada render.

Regra: nao reintroduzir busca direta de snapshot comercial dentro das paginas quando a mesma consulta puder usar `fetchLatestComercialSnapshot`.
