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

No codigo atual, o pipe comercial usado pela dashboard e:

```js
const PIPEFY_COMERCIAL_PIPE_ID = '307210845'
```

O sistema deve usar somente o pipeline correto configurado para o comercial atual.

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

- tokens do Pipefy e chaves privadas devem ficar no n8n/Supabase/Vercel, nunca versionados no front-end.

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

Metricas auxiliares, como ligacoes e taxas de no-show, devem ficar em bloco separado de indicadores comerciais.

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

