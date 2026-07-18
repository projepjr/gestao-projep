# Backup estrutural do Pipefy - Pipeline 307256948

Este arquivo registra a estrutura atual do pipeline comercial no Pipefy para servir como memoria tecnica e backup de reconstrucao.

Captura realizada em 2026-07-17, via API GraphQL do Pipefy.

Escopo da captura:

- Inclui estrutura do pipe, formulario inicial, fases, campos, opcoes, obrigatoriedade, sincronizacao com card, labels, membros e destinos de movimentacao.
- Nao inclui cards cadastrados, pois os cards existentes no momento eram temporarios de teste.
- Nao inclui token, API key, senha, cookie ou qualquer credencial.

## Identificacao

- Pipe ID: `307256948`
- UUID: `33df0bfd-bcb7-4c6f-a121-a97f71f39dc2`
- SUID: `SiFi8Mdx`
- Nome: `Pipeline Comercial (Não Excluir)`
- Titulo do card: `Nome da Empresa`
- Campo de titulo: `nome_da_empresa`
- Tipo do campo de titulo: `short_text`
- Formulario publico: `https://app.pipefy.com/public/form/SiFi8Mdx`
- Visibilidade do formulario inicial: `public`
- Cards existentes no momento da captura: ignorados no backup estrutural

## Regra de seguranca

- Este e o unico pipeline Pipefy autorizado para alteracoes comerciais do Gestão Projep.
- Nao editar, recriar, excluir ou consultar outros pipelines para a integracao comercial.
- Se este pipeline for perdido, este arquivo deve ser usado como base de reconstrucao.

## Labels

- `Inbound` - `#2F80ED`
- `Outbound` - `#CF7029`
- `Prioridade` - `#EB5757`
- `Retorno futuro` - `#F2C94C`
- `No-show` - `#9B51E0`

## Membros do pipe

- `Diretoria` - `diretoria@projepjr.com` - role `admin`
- `Felipe Rodrigues Daniel` - `felipedaniel.wk@gmail.com` - role `admin`

## Condicoes

- Condicoes no formulario inicial: nenhuma.
- Condicoes globais de campos: nenhuma.
- Condicoes por fase: nenhuma registrada na API no momento da captura.

## Formulario inicial

Campos ativos:

1. `Nome da Empresa`
   - ID: `nome_da_empresa`
   - Tipo: `short_text`
   - Obrigatorio: sim
   - Sincroniza com card: nao

2. `Nome do cliente`
   - ID: `nome_do_cliente`
   - Tipo: `short_text`
   - Obrigatorio: nao
   - Sincroniza com card: nao

3. `CNPJ`
   - ID: `cnpj`
   - Tipo: `short_text`
   - Obrigatorio: nao
   - Sincroniza com card: nao

4. `Numero de telefone`
   - ID: `numero_de_telefone`
   - Tipo: `short_text`
   - Obrigatorio: nao
   - Sincroniza com card: nao

5. `E-mail`
   - ID: `e_mail`
   - Tipo: `email`
   - Obrigatorio: nao
   - Sincroniza com card: nao

6. `Municipio`
   - ID: `municipio`
   - Tipo: `short_text`
   - Obrigatorio: nao
   - Sincroniza com card: nao

7. `Segmento da empresa (CNAE)`
   - ID: `segmento_da_empresa_cnae`
   - Tipo: `short_text`
   - Obrigatorio: nao
   - Sincroniza com card: nao

8. `Origem comercial do lead`
   - ID: `origem_comercial_do_lead`
   - Tipo: `select`
   - Obrigatorio: nao
   - Sincroniza com card: nao
   - Opcoes: `Inbound`, `Outbound`, `Manualmente`, `Casa dos dados`, `Indicacao`, `Evento`, `Site`, `Instagram`, `LinkedIn`, `Outro`

9. `Data de cadastro`
   - ID: `data_de_cadastro`
   - Tipo: `date`
   - Obrigatorio: nao
   - Sincroniza com card: nao

10. `Responsavel`
    - ID: `responsavel`
    - Tipo: `assignee_select`
    - Obrigatorio: nao
    - Sincroniza com card: sim

Campos arquivados/deletados do formulario inicial:

- `Origem do lead`
  - ID: `origem_do_lead`
  - Tipo: `select`
  - Arquivado: sim
  - Deletado: nao
  - Observacao: campo antigo com opcoes bugadas em formato JSON literal.

## Fases

### 1. Leads Cadastrados

- ID: `343749642`
- Cor: `lime`
- Fase final: nao
- Destinos permitidos: `Tentativa de Contato`, `Interesse Futuro`, `Diagnostica Agendada`, `Perdidos`, `Pendentes / No-show`
- Condicoes: nenhuma

Campos ativos:

1. `Data da primeira ligacao / contato`
   - ID: `data_da_primeira_ligacao_contato`
   - Tipo: `date`
   - Obrigatorio: sim
   - Sincroniza com card: nao

2. `Canal de Prospeccao`
   - ID: `canal_de_prospeccao`
   - Tipo: `select`
   - Obrigatorio: sim
   - Sincroniza com card: nao
   - Opcoes: `Cold call`, `WhatsApp`, `E-mail`, `LinkedIn`, `Outro`

### 2. Tentativa de Contato

- ID: `343749649`
- Cor: `indigo`
- Fase final: nao
- Destinos permitidos: `Leads Cadastrados`, `Interesse Futuro`, `Diagnostica Agendada`, `Perdidos`, `Pendentes / No-show`
- Condicoes: nenhuma

Campos ativos:

1. `Segunda tentativa de contato`
   - ID: `segunda_tentativa_de_contato`
   - Tipo: `date`
   - Obrigatorio: nao
   - Sincroniza com card: nao

2. `Terceira tentativa de contato`
   - ID: `terceira_tentativa_de_contato`
   - Tipo: `date`
   - Obrigatorio: nao
   - Sincroniza com card: nao

3. `Observacao do contato`
   - ID: `observacao_do_contato`
   - Tipo: `long_text`
   - Obrigatorio: nao
   - Sincroniza com card: nao

### 3. Interesse Futuro

- ID: `343749650`
- Cor: `purple`
- Fase final: nao
- Destinos permitidos: `Diagnostica Agendada`, `Tentativa de Contato`, `Perdidos`, `Pendentes / No-show`
- Condicoes: nenhuma

Campos ativos:

1. `Data de retorno futuro`
   - ID: `data_de_retorno_futuro`
   - Tipo: `date`
   - Obrigatorio: sim
   - Sincroniza com card: nao

2. `Motivo do interesse futuro`
   - ID: `motivo_do_interesse_futuro`
   - Tipo: `long_text`
   - Obrigatorio: nao
   - Sincroniza com card: nao

### 4. Diagnostica Agendada

- ID: `343749667`
- Cor: `indigo`
- Fase final: nao
- Destinos permitidos: `Diagnostica Realizada`, `Pendentes / No-show`, `Perdidos`
- Condicoes: nenhuma

Campos ativos:

1. `Data e hora da diagnostica agendada`
   - ID: `data_e_hora_da_diagnostica_agendada`
   - Tipo: `datetime`
   - Obrigatorio: sim
   - Sincroniza com card: nao

2. `Responsaveis pela diagnostica`
   - ID: `responsaveis_pela_diagnostica`
   - Tipo: `assignee_select`
   - Obrigatorio: nao
   - Sincroniza com card: sim

### 5. Diagnostica Realizada

- ID: `343749668`
- Cor: `blue`
- Fase final: nao
- Destinos permitidos: `Diagnostica Agendada`, `Proposta Agendada`, `Pendentes / No-show`, `Perdidos`
- Condicoes: nenhuma

Campos ativos:

1. `Data da diagnostica realizada`
   - ID: `data_da_diagnostica_realizada`
   - Tipo: `date`
   - Obrigatorio: sim
   - Sincroniza com card: nao

2. `Responsaveis pela diagnostica`
   - ID: `responsaveis_pela_diagnostica_1`
   - Tipo: `assignee_select`
   - Obrigatorio: nao
   - Sincroniza com card: sim

3. `Observacoes da diagnostica`
   - ID: `observacoes_da_diagnostica`
   - Tipo: `long_text`
   - Obrigatorio: nao
   - Sincroniza com card: nao

### 6. Proposta Agendada

- ID: `343749669`
- Cor: `indigo`
- Fase final: nao
- Destinos permitidos: `Proposta Realizada`, `Pendentes / No-show`, `Perdidos`
- Condicoes: nenhuma

Campos ativos:

1. `Data e hora da proposta agendada`
   - ID: `data_e_hora_da_proposta_agendada`
   - Tipo: `datetime`
   - Obrigatorio: sim
   - Sincroniza com card: nao

2. `Responsavel pela proposta`
   - ID: `responsavel_pela_proposta`
   - Tipo: `assignee_select`
   - Obrigatorio: nao
   - Sincroniza com card: sim

### 7. Proposta Realizada

- ID: `343749670`
- Cor: `gray`
- Fase final: nao
- Destinos permitidos: `Negociacao`, `Interesse Futuro`, `Pendentes / No-show`, `Perdidos`
- Condicoes: nenhuma

Campos ativos:

1. `Responsáveis pela proposta`
   - ID: `respons_veis_pela_proposta`
   - Tipo: `assignee_select`
   - Obrigatorio: sim
   - Sincroniza com card: sim

2. `Data da proposta realizada`
   - ID: `data_da_proposta_realizada`
   - Tipo: `date`
   - Obrigatorio: sim
   - Sincroniza com card: nao

3. `Plano de serviço apresentado`
   - ID: `plano_de_servi_o_apresentado`
   - Tipo: `short_text`
   - Obrigatorio: sim
   - Sincroniza com card: nao

4. `Valor apresentado`
   - ID: `valor_apresentado`
   - Tipo: `currency`
   - Obrigatorio: sim
   - Sincroniza com card: nao

5. `Observacoes da proposta`
   - ID: `observacoes_da_proposta`
   - Tipo: `long_text`
   - Obrigatorio: nao
   - Sincroniza com card: nao

### 8. Negociacao

- ID: `343749671`
- Cor: `purple`
- Fase final: nao
- Destinos permitidos: `Pendentes / No-show`, `Perdidos`, `Contratos Fechados`
- Condicoes: nenhuma

Campos ativos:

1. `Responsável pela negociação`
   - ID: `respons_vel_pela_negocia_o`
   - Tipo: `assignee_select`
   - Obrigatorio: sim
   - Sincroniza com card: sim

2. `Data de entrada em negociacao`
   - ID: `data_de_entrada_em_negociacao`
   - Tipo: `date`
   - Obrigatorio: sim
   - Sincroniza com card: nao

Campos arquivados/deletados nesta fase:

- `Status da negociacao`
  - ID: `status_da_negociacao`
  - Tipo: `select`
  - Arquivado: sim
  - Deletado: nao
  - Observacao: campo antigo com opcoes bugadas em formato JSON literal.

### 9. Pendentes / No-show

- ID: `343749672`
- Cor: `purple`
- Fase final: nao
- Destinos permitidos: `Contratos Fechados`, `Negociacao`, `Leads Cadastrados`, `Tentativa de Contato`, `Interesse Futuro`, `Diagnostica Agendada`, `Diagnostica Realizada`, `Proposta Agendada`, `Proposta Realizada`, `Perdidos`
- Condicoes: nenhuma

Campos ativos:

1. `Falta agendar data para reuniao?`
   - ID: `falta_agendar_data_para_reuniao`
   - Tipo: `radio_horizontal`
   - Obrigatorio: nao
   - Sincroniza com card: nao
   - Opcoes: `Sim`, `Nao`

2. `No-show confirmado?`
   - ID: `no_show_confirmado`
   - Tipo: `radio_horizontal`
   - Obrigatorio: nao
   - Sincroniza com card: nao
   - Opcoes: `Sim`, `Nao`

3. `Etapa que aconteceu no-show`
   - ID: `etapa_que_aconteceu_no_show`
   - Tipo: `select`
   - Obrigatorio: nao
   - Sincroniza com card: nao
   - Opcoes: `Diagnostica`, `Proposta`

4. `Data do no-show`
   - ID: `data_do_no_show`
   - Tipo: `date`
   - Obrigatorio: nao
   - Sincroniza com card: nao

5. `Motivo/observacao`
   - ID: `motivo_observacao`
   - Tipo: `long_text`
   - Obrigatorio: nao
   - Sincroniza com card: nao

Campos arquivados/deletados nesta fase:

- `Foi no-show?`
  - ID: `foi_no_show`
  - Tipo: `radio_horizontal`
  - Arquivado: sim
  - Deletado: nao
  - Observacao: campo antigo com opcoes bugadas em formato JSON literal.

### 10. Contratos Fechados

- ID: `343749673`
- Cor: `purple`
- Fase final: sim
- Destinos permitidos: `Pendentes / No-show`, `Perdidos`
- Condicoes: nenhuma

Campos ativos:

1. `Responsáveis pelo contrato`
   - ID: `respons_veis_pelo_contrato`
   - Tipo: `assignee_select`
   - Obrigatorio: sim
   - Sincroniza com card: sim

2. `Data da assinatura do contrato`
   - ID: `data_da_assinatura_do_contrato`
   - Tipo: `date`
   - Obrigatorio: sim
   - Sincroniza com card: nao

3. `Valor fechado`
   - ID: `valor_fechado`
   - Tipo: `currency`
   - Obrigatorio: sim
   - Sincroniza com card: nao

Campos arquivados/deletados nesta fase:

- `Virou contrato?`
  - ID: `virou_contrato`
  - Tipo: `radio_vertical`
  - Arquivado: sim
  - Deletado: nao
  - Observacao: campo antigo com opcoes bugadas em formato JSON literal.
- `Contrato fechado`
  - ID: `contrato_fechado`
  - Tipo: `radio_vertical`
  - Arquivado: sim
  - Deletado: nao
  - Observacao: campo antigo com opcoes bugadas em formato JSON literal.
- `Escopo contratado`
  - ID: `escopo_contratado`
  - Tipo: `select`
  - Arquivado: sim
  - Deletado: nao
  - Observacao: campo antigo com opcoes bugadas em formato JSON literal.

### 11. Perdidos

- ID: `343749674`
- Cor: `yellow`
- Fase final: sim
- Destinos permitidos: `Contratos Fechados`, `Pendentes / No-show`
- Condicoes: nenhuma

Campos ativos:

1. `Data da perda`
   - ID: `data_da_perda`
   - Tipo: `date`
   - Obrigatorio: sim
   - Sincroniza com card: nao

2. `Motivo comercial da perda`
   - ID: `motivo_comercial_da_perda`
   - Tipo: `select`
   - Obrigatorio: sim
   - Sincroniza com card: nao
   - Opcoes: `Não atendeu`, `Sem resposta no follow up`, `Concorrente / Não se enquadra`, `Preço`, `Outro`

3. `Observacao da perda`
   - ID: `observacao_da_perda`
   - Tipo: `long_text`
   - Obrigatorio: nao
   - Sincroniza com card: nao

Campos arquivados/deletados nesta fase:

- `Motivo da perda`
  - ID: `motivo_da_perda`
  - Tipo: `select`
  - Arquivado: sim
  - Deletado: nao
  - Observacao: campo antigo com opcoes bugadas em formato JSON literal.

## Observacoes para n8n e dashboard

- O n8n e a dashboard devem usar apenas o pipe `307256948`.
- Para metricas de primeiro contato, usar `data_da_primeira_ligacao_contato`.
- Para diagnostica agendada, usar `data_e_hora_da_diagnostica_agendada`.
- Para diagnostica realizada, usar `data_da_diagnostica_realizada`.
- Para proposta agendada, usar `data_e_hora_da_proposta_agendada`.
- Para proposta realizada, usar `data_da_proposta_realizada`.
- Para negociacao, usar `data_de_entrada_em_negociacao`.
- Para no-show, usar `no_show_confirmado`, `etapa_que_aconteceu_no_show` e `data_do_no_show`.
- Para contratos fechados, usar `data_da_assinatura_do_contrato`, `valor_fechado` e `respons_veis_pelo_contrato`.
- Para perdas, usar `data_da_perda` e `motivo_comercial_da_perda`.

## Observacoes sobre campos arquivados

Campos arquivados ainda aparecem na API GraphQL, mas nao devem ser usados pelo n8n nem pela dashboard.

Em especial, ignorar:

- `origem_do_lead`
- `status_da_negociacao`
- `foi_no_show`
- `virou_contrato`
- `contrato_fechado`
- `escopo_contratado`
- `motivo_da_perda`
