# Funil e Dashboard Comercial

## Arquivos principais

- `src/pages/comercial/Dashboard.jsx`
- `src/services/comercialSnapshotMapper.js`
- `src/pages/comercial/Equipe.jsx`
- `src/pages/comercial/Calendario.jsx`
- `src/data/comercial.js`
- `src/services/supabaseBridge.js`

## Pipefy

O dashboard comercial esta orientado ao Pipefy.

O pipeline comercial antigo era:

```js
const PIPEFY_COMERCIAL_PIPE_ID = '307210845'
```

Esse pipeline foi excluido no Pipefy e nao pode ser recuperado pela interface.

Pipeline comercial reconstruido em 2026-07-17:

```txt
307256948 - Pipeline Comercial (Não Excluir)
```

Backup estrutural detalhado do pipeline atual:

- `docs/memoria-obsidian/07_Funil_Comercial/Backup_Pipefy_Pipeline_307256948.md`

Regra obrigatoria:

- Somente o pipeline `307256948` esta autorizado para alteracoes no Pipefy.
- Nao editar, excluir, renomear, mover fases, criar campos ou alterar configuracoes de qualquer outro pipeline.
- Outros pipelines podem existir na organizacao, mas devem ser ignorados para a integracao comercial do Gestao Projep.
- n8n e dashboard devem ser atualizados para usar apenas `307256948` como pipeline comercial oficial.

## Supabase snapshots

A dashboard busca dados em:

```js
supabase
  .from('comercial_dashboard_snapshots')
  .select(...)
  .eq('source', 'pipefy')
```

O snapshot vindo do Pipefy/n8n e transformado por `mapComercialSnapshot(...)` em `src/services/comercialSnapshotMapper.js`.

## n8n

O n8n e usado como automacao para buscar dados do Pipefy e salvar snapshots no Supabase.

Regra:

- tokens do Pipefy e chaves privadas devem ficar no n8n/Supabase/provedor de hospedagem, nunca versionados no front-end.

Atualizacao em 2026-07-17:

- Foi gerado um workflow de importacao manual sanitizado em `workflow-pipefy-dashboard-307256948.json`.
- O arquivo fica ignorado pelo Git por regra `workflow-*.json`.
- O workflow gerado usa apenas o pipeline `307256948`.
- A linha de dashboard foi ajustada para salvar snapshot bruto do Pipefy com `pipeId`, `pipe`, `pipes`, `pipefyMembers` e `raw.cards`.
- A decisao tecnica e deixar o front-end (`src/services/comercialSnapshotMapper.js`) calcular funil, periodos, hunters, closers e KPIs a partir dos cards brutos, evitando que o n8n quebre quando houver pequenas mudancas de acento/grafia.
- A linha de reunioes/calendario tambem foi ajustada para usar `307256948` e campos atuais do pipe: datas de diagnostica/proposta, `no_show_confirmado`, `etapa_que_aconteceu_no_show` e `data_do_no_show`.
- O workflow original publicado no n8n nao deve ser alterado por `PUT /api/v1/workflows/...`, pois ja houve erro 500 recorrente nessa API. Preferir importar uma nova versao pela UI e testar antes de ativar.

## Equipe comercial e associacao Pipefy

Arquivo principal: `src/pages/comercial/Equipe.jsx`.

Objetivo:

- associar membro do site ao nome/email usado no Pipefy;
- evitar que hunters e closers fiquem misturados;
- permitir que a dashboard calcule metricas por pessoa correta.

Campos observados:

- `pipefyName`
- `pipefyAliases`
- `userId`
- `role`
- `active`

## Funil comercial

O funil nao deve misturar fase de pipeline com metrica auxiliar.

Fases principais definidas a partir do pipeline real:

1. Leads Cadastrados
2. Tentativa de Contato
3. Interesse Futuro
4. Diagnostica Agendada
5. Diagnostica Realizada
6. Proposta Agendada
7. Proposta Realizada
8. Negociacao
9. Pendentes / No-show
10. Contratos Fechados
11. Perdidos

Observacao de reconstrucao:

- O Pipefy retornou erro interno ao criar/renomear algumas fases com acentos pela API.
- Por isso, o pipeline reconstruido usa nomes tecnicos sem acento em algumas fases/campos, como `Diagnostica Agendada` e `Negociacao`.
- O mapper da dashboard ja considera variantes com e sem acento.

Campos essenciais do pipeline reconstruido apos correcao de estrutura:

- Formulario inicial: `Nome da Empresa`, `Nome do cliente`, `CNPJ`, `Numero de telefone`, `E-mail`, `Municipio`, `Segmento da empresa (CNAE)`, `Origem comercial do lead`, `Data de cadastro`, `Responsavel`, `Selecao de etiqueta`.
- Leads Cadastrados: `Data da primeira ligacao / contato`, `Canal de Prospeccao`.
- Tentativa de Contato: `Segunda tentativa de contato`, `Terceira tentativa de contato`, `Observacao do contato`.
- Interesse Futuro: `Data de retorno futuro`, `Motivo do interesse futuro`, `Foi marcada a Diagnostica?`.
- Diagnostica Agendada: `Data e hora da diagnostica agendada`, `Responsaveis pela diagnostica`.
- Diagnostica Realizada: `Data da diagnostica realizada`, `Responsaveis pela diagnostica`, `Observacoes da diagnostica`.
- Proposta Agendada: `Data e hora da proposta agendada`, `Responsavel pela proposta`.
- Proposta Realizada: `Data da proposta realizada`, `Valor apresentado`, `Observacoes da proposta`.
- Negociacao: `Data de entrada em negociacao`, `Valor em negociacao`, `Status atual da negociacao`.
- Pendentes / No-show: `Falta agendar data para reuniao?`, `No-show confirmado?`, `Etapa que aconteceu no-show`, `Data do no-show`, `Motivo/observacao`.
- Contratos Fechados: `Virou contrato confirmado?`, `Contrato assinado?`, `Valor fechado`, `Data da assinatura do contrato`, `Escopo do contrato`.
- Perdidos: `Data da perda`, `Motivo comercial da perda`, `Observacao da perda`.

Observacao sobre campos de selecao:

- Em 2026-07-17, campos `select` e `radio` criados pela API com `JSON.stringify(options)` ficaram quebrados na interface, aparecendo como uma unica opcao literal, por exemplo `["Sim","Nao"]`.
- A forma correta na mutacao `createPhaseField`/`updatePhaseField` e enviar `options` como lista real de strings, por exemplo `options: ["Sim", "Nao"]`.
- Campos antigos bugados foram arquivados quando a API permitiu. Como o Pipefy mantem titulos arquivados reservados, alguns campos ativos foram recriados com rotulos equivalentes, listados acima.

Observacao importante:

- Campos cadastrais da empresa devem ficar no formulario inicial, nao dentro da fase `Leads Cadastrados`.
- `Data da primeira ligacao / contato` e `Canal de Prospeccao` pertencem a `Leads Cadastrados`, pois sao preenchidos quando o lead passa a ser trabalhado.

Etiquetas criadas no pipeline reconstruido:

- Inbound
- Outbound
- Prioridade
- Retorno futuro
- No-show

Metricas auxiliares, como ligacoes e taxas de no-show, devem ficar em bloco separado de indicadores comerciais.

## Movimentacao entre fases no Pipefy

Estrutura desejada de movimento para o pipeline comercial:

- Leads Cadastrados -> Tentativa de Contato, Interesse Futuro, Perdidos.
- Tentativa de Contato -> Diagnostica Agendada, Interesse Futuro, Pendentes / No-show, Perdidos.
- Interesse Futuro -> Tentativa de Contato, Diagnostica Agendada, Perdidos.
- Diagnostica Agendada -> Diagnostica Realizada, Pendentes / No-show, Perdidos.
- Diagnostica Realizada -> Proposta Agendada, Interesse Futuro, Perdidos.
- Proposta Agendada -> Proposta Realizada, Pendentes / No-show, Perdidos.
- Proposta Realizada -> Negociacao, Interesse Futuro, Perdidos.
- Negociacao -> Contratos Fechados, Perdidos, Pendentes / No-show.
- Pendentes / No-show -> Tentativa de Contato, Diagnostica Agendada, Proposta Agendada, Negociacao, Perdidos.
- Contratos Fechados e Perdidos sao fases finais, com reabertura manual se necessario.

Limitacao observada em 2026-07-17:

- A API publica GraphQL do Pipefy permite consultar `cards_can_be_moved_to_phases`, `next_phase_ids` e `previous_phase_ids`.
- A API publica nao expoe campo/mutacao para alterar diretamente os destinos customizados de "Mover card para fase".
- A documentacao publica do Pipefy orienta ajustar essa configuracao pela UI: menu da fase -> Move card settings / Configurar mover cards.
- Portanto, se for necessario configurar destinos nao adjacentes, a alteracao precisa ser feita manualmente na interface do Pipefy ou por uma API interna nao documentada/autorizada.

## Periodos

A dashboard possui visoes:

- Ao vivo.
- Semanal.
- Mensal.

Regra importante ja implementada/investigada:

- Semana comercial deve considerar domingo a sabado.
- Algumas etapas devem usar a data real do campo do card, e nao apenas data de movimentacao.
- Para `Tentativa de Contato`, a contagem deve usar `Data da primeira ligação` ou `Data da primeira ligação / contato`.

## Historico vs estoque atual

O dashboard precisa diferenciar:

- estoque atual do pipeline: quantos cards estao em cada fase agora;
- historico de passagem/conversao: quais cards passaram por eventos/fases em determinado periodo.

Conversoes nao devem depender somente da coluna atual do card, porque o card sai da fase anterior quando avanca.

Tambem e necessario considerar movimentos de retorno, perda, reabertura e no-show sem inflar conversoes.

## Bugs corrigidos ou investigados

Pelo historico recente do repo:

- dashboard usando pipeline errado;
- filtro semanal inicialmente seg-sex, depois ajustado para domingo-sabado;
- `Tentativa de Contato` contando cards pela movimentacao em vez da data real de primeiro contato;
- percentuais do funil ajustados para representar fase sobre total filtrado;
- no-show de diagnostica/proposta precisou diferenciar a etapa em que o no-show aconteceu;
- associacao de equipe comercial precisava ligar membro do site ao nome/email do Pipefy.
