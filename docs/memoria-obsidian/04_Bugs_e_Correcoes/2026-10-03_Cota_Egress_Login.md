# Restricao de egress e login — 2026-10-03

## Diagnostico confirmado

- Supabase retornou HTTP 402 com exceed_egress_quota em Auth, inclusive renovacao de sessao.
- AuthContext convertia essa falha em "Email ou senha invalidos".
- Organizacao continua Free; plano, pagamentos e limite de gastos nao foram alterados.
- Snapshots comerciais recentes tem aproximadamente 8,5 MB em representacao JSONB interna.
- Snapshots 2026-10-02-21 e 2026-10-02-22 possuem o mesmo conteudo, descontados os timestamps.
- O tamanho total da tabela inclui historico, indices e espaco interno; nao equivale a egress.

## Correcao

- RPC comercial_snapshot_versions: SECURITY INVOKER, search_path vazio, apenas authenticated/service_role; respeita RLS existente. Retorna no maximo cinco versoes com hash do conteudo, sem payload. SQL reproduzivel em supabase/commercial-snapshot-versions.sql; aplicado via migracao commercial_snapshot_versions_reduce_egress.
- Front-end reaproveita cache para mesma versao ou mesmo conteudo, inclusive refresh manual e snapshots de horarios diferentes. Dados alterados continuam sendo baixados.
- Removida assinatura Realtime da tabela de snapshots para nao receber o payload inteiro antes de baixa-lo novamente. Verificacao por metadados a cada cinco minutos enquanto a aba estiver visivel e ao retornar a ela.
- DataProvider sincroniza somente depois do login; consultas periodicas ignoram abas ocultas.
- Login autentica antes de buscar perfis. Falhas do servico nao tentam criar/migrar contas nem validam senha via cache.
- Transporte aplica pausa de cinco minutos apos HTTP 402; proxima requisicao testa recuperacao, sem repetir escritas automaticamente.
- Erros de cota, rede, limite de tentativas e credenciais possuem mensagens distintas.

## Validacao e limites

- node scripts/egress-test.mjs: concorrencia, refresh, snapshot identico/alterado, pausa 402 e classificacao de erros.
- Build de producao aprovado.
- Consulta real confirmou hashes iguais para os dois snapshots mais recentes. Teste com role authenticated retornou metadados; anon nao tem EXECUTE; funcao nao usa SECURITY DEFINER.
- Lint global e smoke existentes apresentam falhas fora desta correcao (smoke: scripts/smoke-test.mjs:52, autorizacao do diretor GP).
- Advisors detectaram problemas preexistentes de RLS em outras tabelas e uma view SECURITY DEFINER. Exigem auditoria propria; nao foram ampliadas permissoes para contorna-los.
- A correcao reduz desperdicio, mas nao garante consumo abaixo de uma cota fixa para qualquer volume de usuarios. Nao remove restricao ja aplicada nem reduz consumo passado. Acompanhar Usage > Egress no painel apos liberacao.
