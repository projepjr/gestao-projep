// Fonte ?nica de verdade ? projetos da PROJEP
// TODO: [Supabase] supabase.from('projetos').select('*, tarefas(*)')

const BASE_CONHECIMENTO_PROJETOS = [
  {
    "id": "p01",
    "tipo": "projeto",
    "titulo": "Fors — Plano de Marketing",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2023-04-30",
    "ano": "2023",
    "status": "Concluído",
    "tags": [
      "Marketing",
      "Digital",
      "Branding"
    ],
    "descricao": "Desenvolvimento de um plano de marketing completo para a Fors, empresa de Uberaba. Contemplou diagnóstico digital, análise de concorrência, definição de público-alvo com personas, estratégia de posicionamento de marca, plano de conteúdo para redes sociais, sugestões de campanhas sazonais e um plano de ação com metas e KPIs para acompanhamento em 12 meses. O cliente atuava no mercado há 3 anos sem estratégia de marketing estruturada.",
    "pontosFortes": [
      "Personas muito bem construídas com base em entrevistas e dados de redes sociais do cliente",
      "Plano de ação entregue com metas SMART, prazos e responsáveis definidos",
      "Análise de concorrência local trouxe benchmarks visuais e de conteúdo muito úteis",
      "Calendário editorial prático e de fácil implementação pela equipe do cliente",
      "Entrega dentro do prazo acordado com validação em todas as etapas"
    ],
    "pontosFracos": [
      "Análise de ROI estimado para as ações propostas foi superficial",
      "Estratégia de tráfego pago (anúncios) não foi detalhada com orçamento e projeção de resultados",
      "Não houve análise de churn ou retenção de clientes atuais",
      "Documento final muito extenso dificultou a leitura pelo cliente"
    ],
    "problemas": [
      "Cliente não tinha dados históricos de vendas para embasar a estratégia com números",
      "Identidade visual desatualizada limitou as propostas de conteúdo e comunicação",
      "Reunião de validação intermediária foi cancelada duas vezes por indisponibilidade do cliente",
      "Mudança de foco do cliente na metade do projeto exigiu reescrita de parte da estratégia"
    ],
    "errosEquipe": [
      "Não foi realizado um kick-off estruturado para alinhar expectativas desde o início — o cliente esperava entrega de artes prontas, não apenas estratégia",
      "A equipe subestimou o tempo necessário para a etapa de pesquisa primária, comprimindo as semanas finais",
      "Faltou definir um único ponto de contato com o cliente, o que gerou ruídos de comunicação",
      "O documento final não foi adaptado ao nível de conhecimento de marketing do cliente, ficando técnico demais",
      "Nenhum membro da equipe tinha experiência com o setor específico do cliente antes do projeto"
    ],
    "errosCliente": [
      "Demorou mais de duas semanas para enviar o briefing completo após o início do projeto",
      "Alterou o escopo (incluiu loja física além do digital) sem formalizar aditivo de contrato",
      "Não disponibilizou acesso às redes sociais para análise de métricas reais",
      "Aprovou entregas parciais sem leitura completa, pedindo alterações na entrega final"
    ],
    "licoesAprendidas": [
      "Sempre realizar kick-off estruturado com alinhamento de expectativas, formato de entrega e nível de profundidade esperado",
      "Definir contrato com escopo detalhado e cláusula de mudança de escopo antes de iniciar qualquer projeto",
      "Solicitar acesso a dados e ferramentas do cliente na primeira semana — não na metade do projeto",
      "Adaptar o formato do relatório final ao perfil do cliente: executivos preferem resumos visuais",
      "Manter um único canal e ponto de contato oficial com o cliente durante todo o projeto"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/13C4d5_5AlrSH13pzsPa5D7fA1K8FpMtH",
    "createdAt": "2023-04-30T12:00:00.000Z",
    "updatedAt": null
  },
  {
    "id": "p02",
    "tipo": "projeto",
    "titulo": "Mais Consultoria — Terceirização",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2023-06-15",
    "ano": "2023",
    "status": "Concluído",
    "tags": [
      "Terceirização",
      "Consultoria",
      "Processos",
      "Operações"
    ],
    "descricao": "Consultoria estratégica para a Mais Consultoria com foco em mapeamento e análise de processos passíveis de terceirização. A PROJEP realizou entrevistas com gestores, levantamento das atividades de cada setor, análise de custo-benefício de terceirização versus execução interna, benchmarking com empresas do setor e relatório executivo com recomendações priorizadas. O projeto visava reduzir custos operacionais e liberar a equipe para atividades de maior valor agregado.",
    "pontosFortes": [
      "Análise de custo-benefício bem estruturada com comparativo entre custo interno e custo de terceirização de mercado",
      "Benchmarking trouxe referências relevantes de empresas similares que já terceirizaram com sucesso",
      "Relatório executivo com linguagem clara, bem recebido pela diretoria do cliente",
      "Equipe soube conduzir entrevistas com gestores de forma profissional e empática",
      "Priorização das recomendações por impacto e facilidade de implementação foi muito valorizada pelo cliente"
    ],
    "pontosFracos": [
      "Prazo curto gerou sobrecarga na equipe nas últimas semanas — algumas análises ficaram menos aprofundadas",
      "Plano de implementação das recomendações não foi detalhado — entregou-se \"o quê\" mas não \"como\"",
      "Riscos trabalhistas da terceirização não foram abordados adequadamente no relatório",
      "Análise não incluiu impacto cultural e de clima organizacional da terceirização na equipe do cliente"
    ],
    "problemas": [
      "Cliente demorou 10 dias para disponibilizar os dados de folha de pagamento e custos internos essenciais para a análise",
      "Gestores de alguns setores resistiram às entrevistas por temer que o resultado impactasse seus empregos",
      "Dados fornecidos por diferentes setores eram inconsistentes entre si, exigindo reconciliação manual",
      "Dificuldade em obter cotações reais de fornecedores de terceirização para embasar a análise financeira"
    ],
    "errosEquipe": [
      "Não foi feita uma análise de riscos trabalhistas e legais da terceirização — lacuna grave num relatório executivo",
      "A equipe aceitou prazos muito curtos sem negociar entregas parciais, causando correria no final",
      "Faltou mapear os impactos na cultura organizacional, que é fator decisivo em processos de terceirização",
      "A comunicação dos resultados foi feita apenas por e-mail — deveria ter sido uma apresentação formal para a diretoria",
      "Não houve análise de qualidade dos potenciais fornecedores de terceirização, apenas de preço"
    ],
    "errosCliente": [
      "Disponibilizou dados financeiros incompletos e sem padronização, aumentando muito o esforço da equipe",
      "Não comunicou previamente aos gestores que haveria entrevistas, gerando resistência e desconfiança",
      "Queria respostas definitivas em uma área que exige análise prolongada e piloto — expectativa desalinhada",
      "Não designou um interlocutor único, fazendo a equipe PROJEP precisar confirmar informações com múltiplas pessoas"
    ],
    "licoesAprendidas": [
      "Em projetos de terceirização, incluir obrigatoriamente análise de riscos legais e trabalhistas",
      "Sempre negociar prazos realistas considerando a complexidade do projeto — não aceitar prazos impossíveis",
      "Preparar os gestores do cliente para entrevistas antes de realizá-las, explicando o propósito do projeto",
      "Entregas de consultoria sempre devem incluir \"como implementar\", não apenas \"o que fazer\"",
      "Consolidar dados de múltiplas fontes exige tempo — considerar isso no cronograma desde o início"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1jKWdayVLOTrPZtfhVM-20bRhgJTRZFFT",
    "createdAt": "2023-06-15T12:00:00.000Z",
    "updatedAt": null
  },
  {
    "id": "p03",
    "tipo": "projeto",
    "titulo": "Annalu Pizzaria — Mapeamento de Processos",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2023-05-20",
    "ano": "2023",
    "status": "Concluído",
    "tags": [
      "Mapeamento",
      "Processos",
      "Alimentação",
      "Operações"
    ],
    "descricao": "Mapeamento completo dos processos operacionais da Annalu Pizzaria, do recebimento de pedidos até a entrega ao cliente. A equipe realizou observação in loco em diferentes turnos, entrevistas com funcionários e proprietários, elaborou fluxogramas detalhados (BPMN), identificou gargalos críticos na linha de produção, e propôs um plano de melhoria com indicadores de desempenho (tempo de preparo, taxa de erro de pedido e satisfação do cliente).",
    "pontosFortes": [
      "Fluxogramas BPMN entregues com clareza visual, fáceis de entender mesmo por funcionários sem formação técnica",
      "Identificação de gargalos no processo de montagem de pizzas gerou economia real ao cliente na semana seguinte",
      "Observação in loco em múltiplos turnos capturou variações importantes que entrevistas sozinhas não captariam",
      "Proposta de checklist de abertura e fechamento foi implementada ainda durante o projeto, com resultado imediato",
      "Ótima relação com a proprietária durante todo o projeto"
    ],
    "pontosFracos": [
      "Mapeamento financeiro (margem por produto, custo de ingredientes) ficou completamente fora do escopo",
      "Não foram entrevistados clientes para entender a percepção de qualidade e tempo de espera",
      "Processo de compras e gestão de fornecedores não foi mapeado, sendo uma área crítica para a pizzaria",
      "As melhorias propostas não foram priorizadas por impacto e esforço de implementação"
    ],
    "problemas": [
      "Alta rotatividade de funcionários significou que nenhum colaborador conhecia todos os processos por completo",
      "Cada funcionário executava as mesmas tarefas de formas completamente diferentes, tornando o mapeamento mais lento",
      "Pico de movimento no fim de semana impossibilitou observações sem atrapalhar a operação",
      "Proprietária acumulava funções operacionais e gerenciais, tendo pouco tempo para reuniões"
    ],
    "errosEquipe": [
      "Não foi elaborado um plano de observação estruturado antes de ir ao campo — a equipe improvisou a coleta de dados",
      "Faltou fotografar os ambientes e fluxos físicos para enriquecer o relatório com evidências visuais",
      "A equipe não calculou indicadores de baseline (tempo médio de entrega, taxa de erro) antes de propor melhorias",
      "As recomendações não foram apresentadas com estimativa de custo de implementação",
      "Nenhum membro da equipe tinha feito mapeamento de processos em ambiente de alta rotatividade — faltou preparo"
    ],
    "errosCliente": [
      "Não garantiu que funcionários-chave estariam disponíveis nos dias agendados para observação",
      "Pediu inclusão de processos de gestão de estoque no escopo após a metade do projeto, sem aditivo",
      "Alguns funcionários foram orientados a \"mostrar o processo ideal\" e não o processo real do dia a dia"
    ],
    "licoesAprendidas": [
      "Sempre elaborar um protocolo de observação antes de ir a campo, com checklist do que observar",
      "Registrar baseline dos indicadores antes de propor qualquer melhoria — sem isso, não há como medir resultado",
      "Em processos com alta rotatividade, mapear o processo com vídeo além de texto e fluxograma",
      "Incluir no escopo inicial a gestão de estoque e compras em projetos de mapeamento de operações de alimentação",
      "Apresentar recomendações com prioridade, esforço estimado e custo — não só a lista de melhorias"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/18yGo1j9SSWy8Y4gpGnte6-hbx8Ey26my",
    "createdAt": "2023-05-20T12:00:00.000Z",
    "updatedAt": null
  },
  {
    "id": "p04",
    "tipo": "projeto",
    "titulo": "GMAD Placas Uberaba — Mapeamento de Processos",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2023-07-10",
    "ano": "2023",
    "status": "Concluído",
    "tags": [
      "Mapeamento",
      "Indústria",
      "Produção",
      "Qualidade"
    ],
    "descricao": "Mapeamento dos processos produtivos, de controle de qualidade e logística interna da GMAD Placas Uberaba, indústria do setor de sinalização e comunicação visual. A equipe acompanhou o fluxo completo desde o recebimento de matéria-prima até a expedição do produto final, mapeou gargalos, não-conformidades recorrentes no controle de qualidade e elaborou propostas de padronização com documentação técnica.",
    "pontosFortes": [
      "Acesso irrestrito às instalações industriais permitiu mapeamento completo e preciso",
      "Identificação de não-conformidades no controle de qualidade gerou proposta de inspeção com checklist",
      "Documentação técnica entregue com linguagem adequada para operadores e gestores",
      "Empresa muito colaborativa — gestores participaram ativamente de todas as etapas",
      "Mapeamento revelou gargalo no setor de acabamento que causava atraso em 40% dos pedidos"
    ],
    "pontosFracos": [
      "Equipe tinha pouca experiência com ambiente industrial, gerando insegurança inicial nas visitas técnicas",
      "Não foram calculados indicadores de OEE (Overall Equipment Effectiveness) para as máquinas principais",
      "Análise de custos de produção e desperdício de material não foi incluída no escopo",
      "O mapeamento foi feito apenas no turno diurno — o turno noturno tinha variações importantes não capturadas"
    ],
    "problemas": [
      "Linguagem técnica da indústria (nomenclaturas de máquinas e processos) foi uma barreira inicial para a equipe",
      "Dados de produção estavam em planilhas desatualizadas — informações divergentes entre o papel e a realidade",
      "Conflito de agenda entre dois membros da equipe causou atraso de 5 dias em uma entrega parcial",
      "Processo de aprovação de documentos pelo cliente era burocrático e lento, atrasando validações"
    ],
    "errosEquipe": [
      "A equipe não estudou o setor industrial (mapeamento de processos em indústria) antes de começar o projeto",
      "Não foram incluídos indicadores de eficiência (OEE, tempo de setup, refugo) no relatório — essenciais para indústria",
      "O conflito de agenda interno deveria ter sido resolvido antes do início do projeto, não durante",
      "Faltou fazer um glossário técnico junto com os operadores na primeira semana para nivelamento do vocabulário",
      "As melhorias não foram apresentadas em ordem de retorno sobre investimento"
    ],
    "errosCliente": [
      "Forneceu planilhas de produção desatualizadas sem avisar — a equipe só descobriu a inconsistência no campo",
      "Não comunicou previamente que o turno noturno tinha processos diferentes do diurno",
      "Aprovou entregas parciais sem consultar o gerente de produção, que depois pediu alterações"
    ],
    "licoesAprendidas": [
      "Antes de projetos industriais, fazer uma visita técnica exploratória sem compromisso de mapeamento — apenas para aprender o ambiente",
      "Incluir indicadores de eficiência (OEE, refugo, setup) em todo projeto de mapeamento industrial",
      "Mapear sempre mais de um turno em operações industriais — os processos variam significativamente",
      "Criar glossário técnico conjunto com operadores na semana 1 de todo projeto industrial",
      "Conflitos de agenda da equipe devem ser resolvidos antes do início — nunca durante a execução"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1qWv1D_8OUhoFDq9jqn-B8OH0J_7LFPPL",
    "createdAt": "2023-07-10T12:00:00.000Z",
    "updatedAt": null
  },
  {
    "id": "p05",
    "tipo": "projeto",
    "titulo": "Restaurante Transamérica — Mapeamento de Processos",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2023-08-05",
    "ano": "2023",
    "status": "Concluído",
    "tags": [
      "Mapeamento",
      "Restaurante",
      "Operações",
      "Compras"
    ],
    "descricao": "Mapeamento dos processos do Restaurante Transamérica com foco em atendimento, gestão de compras e controle de estoque de alimentos. Foram elaborados fluxogramas de todos os processos-chave, identificados pontos de desperdício e retrabalho, e entregue um manual de processos padronizados com rotinas de abertura, atendimento, cozinha, compras e fechamento. O projeto também incluiu a implantação de controles básicos de estoque.",
    "pontosFortes": [
      "Manual de processos padronizados entregue foi implementado imediatamente pelo proprietário",
      "Controles básicos de estoque implantados durante o projeto já mostraram resultados na primeira semana",
      "Equipe se adaptou bem ao ambiente dinâmico e barulhento do restaurante",
      "Identificação de desperdício no processo de compras revelou compras duplicadas que custavam R$ 800/mês ao cliente",
      "Fluxogramas foram impressos e fixados na cozinha — uso real e imediato pelo time do restaurante"
    ],
    "pontosFracos": [
      "DRE e análise de margem de contribuição por prato ficaram fora do escopo, sendo fundamentais para um restaurante",
      "Processos de marketing, captação e fidelização de clientes não foram incluídos",
      "Não foi realizado treinamento formal da equipe do restaurante sobre os novos processos documentados",
      "Indicadores de satisfação do cliente (NPS, avaliações online) não foram considerados"
    ],
    "problemas": [
      "Horário de pico (almoço e jantar) tornava impossível conversar com funcionários sem prejudicar o atendimento",
      "Proprietário tinha agenda extremamente ocupada — reuniões foram reagendadas 4 vezes",
      "Ausência total de registros históricos de compras e vendas impediu análises quantitativas aprofundadas",
      "Funcionários não queriam ser observados por medo de punição — resistência inicial ao processo"
    ],
    "errosEquipe": [
      "A equipe não agendou as visitas de observação nos momentos de menor movimento (entre refeições) — perdeu oportunidades de conversa com funcionários",
      "Não foi feita análise de DRE mesmo sendo fundamental para restaurantes — houve omissão de escopo relevante",
      "O manual de processos foi entregue sem treinamento — documento sem implementação assistida tem menor adesão",
      "Faltou mapear os processos de compra junto ao fornecedor, que era onde estava o maior desperdício",
      "A equipe não solicitou acesso ao sistema de caixa/PDV que teria dados valiosos de vendas por produto"
    ],
    "errosCliente": [
      "Não comunicou aos funcionários o propósito do projeto antes das visitas, gerando desconfiança inicial",
      "Não disponibilizou acesso ao sistema de gestão do restaurante, alegando \"privacidade\"",
      "Pediu inclusão do processo de eventos e buffets na última semana do projeto, sem aditivo de prazo"
    ],
    "licoesAprendidas": [
      "Em restaurantes, agendar observações entre 9h-11h e 15h-17h — fora do pico de atendimento",
      "Sempre incluir análise de DRE no escopo de projetos para restaurantes — é a principal dor do segmento",
      "Manual de processos deve vir acompanhado de pelo menos uma sessão de treinamento com a equipe",
      "Solicitar acesso ao sistema de PDV/caixa logo no kick-off — dados de vendas são essenciais",
      "Apresentar o projeto para os funcionários antes de iniciar as observações — gera confiança e cooperação"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1Q4T4luC-AXfUoH3NV-2_p1uzkFfewsp4",
    "createdAt": "2023-08-05T12:00:00.000Z",
    "updatedAt": null
  },
  {
    "id": "p06",
    "tipo": "projeto",
    "titulo": "HRX — Plano de Negócios",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2023-09-20",
    "ano": "2023",
    "status": "Concluído",
    "tags": [
      "Plano de Negócios",
      "Financeiro",
      "Estratégia",
      "Startup"
    ],
    "descricao": "Elaboração de plano de negócios completo para a HRX, empresa em fase de estruturação no setor de serviços. O projeto contemplou análise de mercado com dados primários e secundários, estudo de viabilidade financeira (VPL, TIR, payback), modelagem do plano operacional, estratégia de go-to-market, análise SWOT aprofundada e projeções financeiras para três cenários (pessimista, realista e otimista) nos primeiros três anos de operação. O documento foi utilizado com sucesso para captação de investidores.",
    "pontosFortes": [
      "Três cenários financeiros (pessimista, realista e otimista) com premissas detalhadas e rastreáveis",
      "Análise de viabilidade com VPL, TIR e payback despertou credibilidade nos investidores",
      "Estratégia go-to-market clara, com canais, táticas e cronograma de entrada no mercado",
      "Análise SWOT aprofundada conectada às estratégias propostas — não apenas um quadro solto",
      "O cliente usou o plano em apresentações para investidores e conseguiu interesse de dois deles"
    ],
    "pontosFracos": [
      "Volume de trabalho foi grosseiramente subestimado no início — a equipe entrou em sobrecarga na reta final",
      "Análise jurídica e regulatória do setor foi muito superficial — apenas citou a existência de regulações",
      "Não foi incluída análise de exit strategy para os investidores",
      "As fontes de dados de mercado não foram sistematicamente documentadas em apêndice"
    ],
    "problemas": [
      "Cliente alterou o modelo de negócio na metade do projeto — mudança de B2C para B2B exigiu reescrita de 60% das projeções",
      "Dados confiáveis sobre o mercado específico do cliente eram escassos e de difícil acesso",
      "Reunião de entrega final foi adiada três vezes por indisponibilidade do cliente — projeto ficou \"parado\" por 12 dias",
      "Projeções financeiras exigiram várias rodadas de revisão por divergências entre a visão do cliente e a realidade do mercado"
    ],
    "errosEquipe": [
      "Não foi feita uma estimativa realista do volume de trabalho antes de assinar o contrato — isso causou toda a sobrecarga",
      "A mudança de modelo de negócio pelo cliente deveria ter gerado formalização de aditivo de escopo e prazo — não gerou",
      "Análise regulatória foi negligenciada por falta de conhecimento da equipe sobre o setor",
      "Faltou criar uma estrutura de controle de versão dos documentos — várias versões do plano geraram confusão",
      "A equipe não estabeleceu reuniões de checkpoint semanais com o cliente, o que permitiu que a mudança de modelo ocorresse tarde demais"
    ],
    "errosCliente": [
      "Mudou o modelo de negócio na metade do projeto sem avisou com antecedência, gerando retrabalho massivo",
      "Não tinha clareza sobre o modelo de negócio antes de contratar a PROJEP — deveria ter feito isso antes",
      "Ficou 12 dias sem responder e-mails durante a fase de validação das projeções",
      "Tinha expectativa de que o plano de negócios \"garantiria\" captação de investimento — expectativa irreal"
    ],
    "licoesAprendidas": [
      "Fazer estimativa detalhada de horas por entrega antes de fechar qualquer contrato de plano de negócios",
      "Qualquer mudança de escopo pelo cliente deve gerar aditivo formal de prazo e valor — sem exceções",
      "Estabelecer reuniões de checkpoint semanais obrigatórias para detectar desvios cedo",
      "Em planos de negócios, incluir análise regulatória mesmo que simplificada — é sempre relevante para investidores",
      "Criar controle de versão claro dos documentos (v1.0, v1.1…) para evitar confusão com múltiplas revisões"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1pQ-gqxxFKWBHTqb5WnqHaQlJU4TdG0iB",
    "createdAt": "2023-09-20T12:00:00.000Z",
    "updatedAt": null
  },
  {
    "id": "p07",
    "tipo": "projeto",
    "titulo": "Açaí do Mineiro — Plano de Marketing",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2023-06-30",
    "ano": "2023",
    "status": "Concluído",
    "tags": [
      "Marketing",
      "Redes Sociais",
      "Alimentação",
      "Delivery"
    ],
    "descricao": "Desenvolvimento de plano de marketing para o Açaí do Mineiro, franquia local de Uberaba com forte presença no delivery. O projeto incluiu diagnóstico completo da presença digital (Instagram, Google Meu Negócio, iFood), análise de concorrentes diretos e indiretos, definição de estratégia de conteúdo para redes sociais, campanhas sazonais alinhadas ao calendário local, ações de fidelização, criação de calendário editorial para 6 meses e recomendações para melhorar o posicionamento no iFood.",
    "pontosFortes": [
      "Calendário editorial de 6 meses entregue completo, com temas, formatos e referências visuais para cada publicação",
      "Análise de concorrência com benchmark visual (prints e exemplos reais) muito prática para o cliente",
      "Diagnóstico do Google Meu Negócio revelou problemas graves de informações desatualizadas — corrigidos imediatamente",
      "Estratégia de fidelização com programa de selos digitais foi criativa e adaptada ao orçamento do cliente",
      "Entregue 3 dias antes do prazo — a antecipação surpreendeu positivamente o cliente"
    ],
    "pontosFracos": [
      "Estratégia de tráfego pago (Meta Ads e Google Ads) não foi desenvolvida com orçamentos e projeções reais",
      "Análise do canal de delivery (iFood) ficou superficial, apesar de representar +60% das vendas do cliente",
      "Não foram definidas métricas de acompanhamento mensal das ações do plano",
      "A estratégia não contemplou sazonalidade climática, que impacta muito as vendas de açaí"
    ],
    "problemas": [
      "Cliente não tinha acesso ao painel de dados do iFood — dados essenciais de conversão não estavam disponíveis",
      "Identidade visual inconsistente nas diferentes plataformas dificultou a criação de uma estratégia de conteúdo coesa",
      "A pessoa responsável pela aprovação de conteúdo era a proprietária, que viajava com frequência",
      "A franquia tinha restrições contratuais da marca principal que limitavam algumas ações de marketing local"
    ],
    "errosEquipe": [
      "A equipe não pesquisou as restrições contratuais da franquia antes de propor ações — algumas tiveram de ser descartadas depois",
      "Não foram definidas métricas de acompanhamento para avaliar o resultado do plano — entregou estratégia sem mensuração",
      "A análise do iFood foi claramente a mais fraca do relatório — faltou aprofundamento no principal canal de vendas do cliente",
      "Nenhum membro tinha experiência com marketing de franquias — as restrições da franqueadora foram uma surpresa",
      "O plano de tráfego pago ficou vago demais para ser implementado pelo cliente sem ajuda especializada"
    ],
    "errosCliente": [
      "Não mencionou as restrições contratuais da franqueadora no briefing inicial — a equipe descobriu por conta própria",
      "Não tinha acesso aos dados do iFood e não tentou obtê-los junto à franqueadora durante o projeto",
      "A aprovação de entregas demorava mais de uma semana por falta de disponibilidade da proprietária"
    ],
    "licoesAprendidas": [
      "Em projetos com franquias, incluir no checklist inicial: \"quais ações de marketing são permitidas pela franqueadora?\"",
      "Sempre definir métricas de acompanhamento (KPIs) como parte obrigatória de qualquer plano de marketing",
      "Para clientes com forte presença em delivery, o plano de marketing deve ter capítulo específico sobre essa plataforma",
      "Estabelecer SLA de aprovação de entregas no contrato (ex.: cliente tem 48h para aprovar cada entrega)",
      "Solicitar acesso a todas as plataformas digitais do cliente (Meta Business, Google Ads, iFood) na semana 1"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1NJ7gf8zXqvSdLQhuaGliwQGTpueFjxvD",
    "createdAt": "2023-06-30T12:00:00.000Z",
    "updatedAt": null
  },
  {
    "id": "p08",
    "tipo": "projeto",
    "titulo": "Minerva Foods — Pesquisa de Mercado (1ª)",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2023-05-15",
    "ano": "2023",
    "status": "Concluído",
    "tags": [
      "Pesquisa de Mercado",
      "Alimentação",
      "Grande Empresa",
      "B2B"
    ],
    "descricao": "Primeira pesquisa de mercado realizada para a Minerva Foods, uma das maiores empresas de proteína animal da América do Sul, com foco em análise de percepção de marca e comportamento de compra em segmentos específicos. O projeto envolveu coleta de dados primários (questionário online com 180 respondentes), análise de dados secundários (relatórios setoriais), segmentação por perfil de consumidor e relatório executivo com insights e recomendações. O sucesso deste projeto abriu portas para um segundo contrato.",
    "pontosFortes": [
      "Projeto com cliente de grande porte que elevou significativamente o portfólio e a credibilidade da PROJEP",
      "Questionário elaborado com rigor metodológico, com escala Likert e questões abertas para capturar nuances",
      "Segmentação dos consumidores em perfis claramente distintos facilitou a leitura dos resultados",
      "Relatório visual com gráficos e infográficos foi amplamente elogiado pela equipe de marketing da Minerva",
      "O projeto abriu portas para uma segunda pesquisa — prova de satisfação do cliente"
    ],
    "pontosFracos": [
      "Amostra de 180 respondentes foi insuficiente para o porte e a complexidade do cliente",
      "Análise estatística ficou limitada a médias e percentuais — sem testes de significância ou correlações",
      "Não foram realizadas entrevistas qualitativas em profundidade para complementar os dados quantitativos",
      "O relatório final não contextualizou os achados com dados de mercado nacionais do setor de proteína animal"
    ],
    "problemas": [
      "Taxa de resposta inicial do questionário foi de apenas 12% — necessitou de três rodadas de disparo",
      "Bases de dados setoriais pagas não estavam disponíveis para a equipe, limitando a análise secundária",
      "Dificuldade em alinhar o nível de profundidade esperado pelo cliente com a capacidade técnica da equipe",
      "Prazos curtos para um projeto de pesquisa de grande porte geraram pressão excessiva na coleta de dados"
    ],
    "errosEquipe": [
      "A equipe não tinha experiência com projetos de pesquisa para grandes corporações — foi aprender fazendo, o que gerou insegurança",
      "O tamanho da amostra não foi calculado estatisticamente antes da coleta — definiu-se 180 por feeling",
      "Análise de dados ficou limitada a estatística descritiva básica — para Minerva Foods, esperava-se mais sofisticação",
      "Não foi feito pré-teste do questionário com um grupo pequeno antes do disparo geral",
      "A estratégia de coleta de dados primários não previu baixa taxa de resposta — faltou plano B"
    ],
    "errosCliente": [
      "Não forneceu base de contatos qualificada para o disparo do questionário — a equipe teve de montar do zero",
      "Alterou o escopo da pesquisa (incluiu novo segmento) após o início da coleta de dados, afetando a comparabilidade",
      "A equipe de marketing da Minerva demorou 8 dias para aprovar o questionário antes do disparo"
    ],
    "licoesAprendidas": [
      "Calcular o tamanho da amostra estatisticamente (margem de erro e nível de confiança) antes de iniciar qualquer pesquisa quantitativa",
      "Sempre fazer pré-teste do questionário com 10-15 respondentes antes do disparo geral",
      "Incluir análise estatística inferencial (correlação, qui-quadrado) em pesquisas para grandes empresas",
      "Planejar estratégia de coleta com taxa de resposta esperada de apenas 15-20% — dimensionar o disparo adequadamente",
      "Para grandes clientes, combinar pesquisa quantitativa com ao menos 5-8 entrevistas qualitativas em profundidade"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1rkvQSfwgn73_7noggjx6uQ8S42KA5wTC",
    "createdAt": "2023-05-15T12:00:00.000Z",
    "updatedAt": null
  },
  {
    "id": "p09",
    "tipo": "projeto",
    "titulo": "Casa Rocha — Implantação 5S",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2023-07-25",
    "ano": "2023",
    "status": "Concluído",
    "tags": [
      "5S",
      "Qualidade",
      "Organização",
      "Metodologia",
      "Mudança"
    ],
    "descricao": "Projeto de diagnóstico e implantação da metodologia 5S na Casa Rocha, empresa de serviços. O projeto contemplou avaliação inicial com pontuação por setor, capacitação de toda a equipe (20 colaboradores) sobre os 5 sensos, elaboração de plano de implantação por fases, acompanhamento das primeiras ações de Seiri (utilização), Seiton (organização) e Seiso (limpeza), criação de checklists de auditoria e definição das responsabilidades para sustentação do Seiketsu e Shitsuke.",
    "pontosFortes": [
      "Capacitação foi dinâmica e com exemplos práticos do próprio ambiente de trabalho do cliente",
      "Diagnóstico inicial com pontuação por setor criou uma linha de base clara para medir evolução",
      "Checklists de auditoria interna criados foram práticos e já usados pelo cliente na semana seguinte",
      "Engajamento da liderança foi exemplar — o gestor participou de todas as atividades ao lado da equipe",
      "Fotografia antes e depois de cada área do 5S gerou evidências visuais poderosas do impacto"
    ],
    "pontosFracos": [
      "Acompanhamento pós-implantação foi limitado a apenas 2 semanas — insuficiente para consolidar o Shitsuke (disciplina)",
      "Não foi criado um painel de resultados (dashboard) para o cliente acompanhar a evolução do 5S ao longo do tempo",
      "Alguns setores receberam menos atenção pela equipe por serem percebidos como \"menos problemáticos\"",
      "A sustentação do 5S após o término do projeto não foi planejada com clareza suficiente"
    ],
    "problemas": [
      "Resistência significativa de parte dos funcionários mais antigos, que viam o 5S como crítica pessoal ao seu trabalho",
      "Espaço físico de alguns setores era muito pequeno para reorganizar conforme o Seiton indicava",
      "Dificuldade em manter a regularidade das visitas de acompanhamento por conflitos de agenda da equipe PROJEP",
      "Dois funcionários-chave estavam de férias durante a semana de capacitação e não participaram"
    ],
    "errosEquipe": [
      "A equipe não preparou estratégia de gestão da mudança para lidar com a resistência dos funcionários mais antigos",
      "Não foi planejado um programa de acompanhamento de pelo menos 30 dias após a implantação",
      "Os dois funcionários ausentes na capacitação não foram retreinados posteriormente — lacuna grave para o Shitsuke",
      "Faltou criar um painel visual (quadro 5S) para o cliente acompanhar a evolução internamente",
      "A equipe não avaliou as restrições de espaço físico antes de propor reorganizações — algumas propostas eram inviáveis"
    ],
    "errosCliente": [
      "Não garantiu a presença de todos os funcionários na capacitação — dois ausentes não foram reposicionados",
      "Não designou um \"líder 5S\" interno para ser o guardião da metodologia após o projeto",
      "Deu sinal verde para áreas que não haviam concluído o Seiri iniciarem o Seiton prematuramente"
    ],
    "licoesAprendidas": [
      "Em projetos de implantação de metodologia, incluir obrigatoriamente um plano de gestão da mudança",
      "Sempre designar, junto com o cliente, um \"guardião interno\" da metodologia antes do encerramento do projeto",
      "Planejar acompanhamento de pelo menos 30 dias após a implantação — o Shitsuke (disciplina) é o mais difícil",
      "Nunca pular etapas do 5S: o Seiton só funciona depois que o Seiri foi concluído em todos os setores",
      "Criar painel visual de acompanhamento (dashboard físico ou digital) para o cliente monitorar a evolução"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1SLhWpKQMS_hgkmz_JR44tikSjqdcpFNi",
    "createdAt": "2023-07-25T12:00:00.000Z",
    "updatedAt": null
  },
  {
    "id": "p10",
    "tipo": "projeto",
    "titulo": "Revesty Street Center — Pesquisa de Mercado",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2023-08-20",
    "ano": "2023",
    "status": "Concluído",
    "tags": [
      "Pesquisa de Mercado",
      "Moda",
      "Varejo",
      "Streetwear"
    ],
    "descricao": "Pesquisa de mercado para a Revesty Street Center, empresa de moda streetwear de Uberaba. O projeto analisou o perfil e comportamento do consumidor-alvo (jovens de 16 a 28 anos), tendências do mercado de moda urbana, análise de concorrentes (preço, produto, comunicação e experiência de compra) e percepção de marca da Revesty vs. concorrentes. Foram coletados dados por questionário online e entrevistas presenciais em pontos de fluxo do público-alvo.",
    "pontosFortes": [
      "Pesquisa com consumidores trouxe insights genuínos que surpreenderam o cliente sobre hábitos de compra do seu público",
      "Análise de tendências de moda urbana foi contextualizada para a realidade de Uberaba e cidades médias",
      "Metodologia mista (quantitativa + qualitativa) foi bem executada e produziu resultados complementares",
      "Relatório visual e bem diagramado, adequado ao perfil jovem e visual do cliente",
      "Análise de concorrentes incluiu visitas presenciais às lojas, trazendo dados de experiência de compra"
    ],
    "pontosFracos": [
      "Amostra de 95 respondentes foi pequena para representar de forma robusta o público-alvo",
      "Não foram realizados grupos focais, que teriam enriquecido muito a análise qualitativa",
      "Dados financeiros do mercado (tamanho, crescimento) foram superficiais por ausência de acesso a bases setoriais",
      "A pesquisa não mensurou a intenção de compra e a elasticidade de preço do consumidor"
    ],
    "problemas": [
      "Taxa de resposta online foi muito baixa no público de 16-18 anos — tiveram de ser abordados pessoalmente",
      "Dois concorrentes relevantes se recusaram a participar de qualquer forma de pesquisa",
      "Dados públicos sobre o mercado de streetwear em cidades médias do Brasil eram praticamente inexistentes",
      "Dificuldade em recrutar jovens para entrevistas presenciais sem incentivo financeiro"
    ],
    "errosEquipe": [
      "A equipe não planejou estratégia de coleta alternativa para o público jovem, que tem baixa taxa de resposta a questionários online",
      "O tamanho da amostra não foi justificado metodologicamente — foi definido por limitação de tempo, não de método",
      "Não foi oferecido nenhum incentivo (desconto na loja, brinde) para aumentar a taxa de resposta nas entrevistas",
      "Grupos focais foram descartados por limitação de prazo, mas deveriam ter sido priorizados sobre parte da coleta quantitativa",
      "A análise de preço não incluiu elasticidade — dado fundamental para decisões de precificação do cliente"
    ],
    "errosCliente": [
      "Não forneceu base de clientes para disparo do questionário online — afirmou não ter cadastro de clientes",
      "Não disponibilizou dados de vendas por categoria de produto que teriam enriquecido muito a análise",
      "Pediu inclusão de análise de lojas online (e-commerce) no escopo na última semana, sem aditivo"
    ],
    "licoesAprendidas": [
      "Para públicos jovens, combinar coleta presencial (abordagem in loco) com online — não depender apenas de questionário digital",
      "Sempre oferecer algum incentivo para participação em pesquisas com público externo (desconto, voucher)",
      "Grupos focais produzem insights qualitativos que questionários nunca captam — não devem ser descartados por prazo",
      "Incluir análise de elasticidade de preço em toda pesquisa de mercado para empresas de varejo",
      "Solicitar base de clientes do cliente no kick-off — é o ativo mais valioso para pesquisas de mercado"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1LiK_PaRdfFr9X1DyjOUtZnBwnt4vOzy5",
    "createdAt": "2023-08-20T12:00:00.000Z",
    "updatedAt": null
  },
  {
    "id": "p11",
    "tipo": "projeto",
    "titulo": "Geoparque — Estruturação de Custeio",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2023-09-10",
    "ano": "2023",
    "status": "Concluído",
    "tags": [
      "Custeio",
      "Financeiro",
      "Turismo",
      "Precificação",
      "Gestão"
    ],
    "descricao": "Projeto de estruturação do sistema de custeio do Geoparque, organização voltada ao turismo geológico e preservação ambiental de Uberaba. A PROJEP levantou e classificou todos os centros de custo, elaborou metodologia de rateio dos custos indiretos, calculou o custo real de cada serviço oferecido (visitas guiadas, eventos, trilhas, serviços educacionais), analisou as margens de contribuição por serviço e entregou planilha de controle financeiro para subsidiar decisões de precificação.",
    "pontosFortes": [
      "Planilha de custeio desenvolvida é dinâmica, de fácil atualização e já integrada à rotina do cliente",
      "Revelou que dois serviços eram prestados abaixo do custo — o cliente não tinha essa percepção",
      "Metodologia de rateio foi explicada de forma didática para os gestores do Geoparque",
      "Análise de margem de contribuição por serviço possibilitou reprec ificação com embasamento real",
      "Gestores ficaram muito satisfeitos com a profundidade técnica e a clareza das apresentações"
    ],
    "pontosFracos": [
      "O levantamento de custos indiretos consumiu quase o dobro do tempo previsto pelo volume e complexidade dos registros",
      "Não foi realizado treinamento aprofundado da equipe do Geoparque para manutenção e atualização da planilha",
      "A análise não incluiu projeção de cenários futuros (ex.: impacto de aumento de custos ou variação de demanda)",
      "Não foi desenvolvido um dashboard visual para acompanhamento gerencial dos custos ao longo do tempo"
    ],
    "problemas": [
      "Registros financeiros históricos estavam incompletos, inconsistentes e distribuídos em múltiplos arquivos sem padrão",
      "Classificação de custos mistos (parte diretos, parte indiretos) gerou debates internos prolongados com os gestores",
      "Múltiplos interlocutores no cliente forneceram informações conflitantes sobre os mesmos custos",
      "O cliente usava um sistema de gestão financeira incompatível com a metodologia de custeio proposta"
    ],
    "errosEquipe": [
      "A equipe subestimou gravemente a complexidade e o volume de registros financeiros a serem analisados",
      "Não foi definido um único interlocutor financeiro no cliente no início do projeto — causou informações conflitantes",
      "A planilha de custeio foi entregue sem sessão de treinamento para a equipe que iria mantê-la",
      "Faltou criar um guia de uso e atualização da planilha para garantir que o cliente continuaria a usar após o projeto",
      "A equipe não mapeou o sistema financeiro do cliente antes de propor a metodologia — gerou incompatibilidade"
    ],
    "errosCliente": [
      "Não organizou os registros financeiros antes de disponibilizá-los — equipe recebeu uma \"montanha\" de dados brutos",
      "Tinha múltiplos responsáveis financeiros que não conversavam entre si, gerando informações contraditórias",
      "Não informou sobre o sistema de gestão financeira utilizado — a incompatibilidade foi descoberta na metade do projeto"
    ],
    "licoesAprendidas": [
      "Em projetos financeiros, sempre solicitar que o cliente organize e padronize os registros antes do início das análises",
      "Definir um único interlocutor financeiro do cliente no kick-off — sem exceções",
      "Toda planilha ou ferramenta entregue deve vir com sessão de treinamento e guia de uso",
      "Mapear todos os sistemas de gestão do cliente antes de propor metodologias — evitar incompatibilidades",
      "Em projetos de custeio, incluir projeção de cenários futuros — é o que converte diagnóstico em decisão"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1swjCpeAKGEyyIKRErEs0o5uaKYdHxegN",
    "createdAt": "2023-09-10T12:00:00.000Z",
    "updatedAt": null
  },
  {
    "id": "p12",
    "tipo": "projeto",
    "titulo": "Metalúrgica Uberaba — Pesquisa de Fornecedores",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2023-10-05",
    "ano": "2023",
    "status": "Concluído",
    "tags": [
      "Fornecedores",
      "Supply Chain",
      "Indústria",
      "Compras",
      "Negociação"
    ],
    "descricao": "Mapeamento e análise comparativa de fornecedores para a Metalúrgica Uberaba, indústria de médio porte. A PROJEP identificou e contatou mais de 35 fornecedores alternativos de matérias-primas e insumos críticos, coletou cotações e condições comerciais, elaborou matriz de comparação com critérios ponderados (preço, prazo, qualidade, localização e histórico) e entregou relatório com recomendações para diversificação e negociação da base de fornecedores. O projeto identificou potencial de economia de ~12% nos custos de insumos.",
    "pontosFortes": [
      "Mais de 35 fornecedores mapeados e comparados em matriz estruturada com critérios ponderados",
      "Potencial de economia de 12% nos custos de insumos identificado e documentado com embasamento real",
      "Relatório foi apontado pelo cliente como o de maior impacto financeiro já realizado pela PROJEP",
      "Critérios de avaliação foram definidos em conjunto com o cliente, aumentando a legitimidade das recomendações",
      "A diversificação da base de fornecedores reduziu o risco de desabastecimento — benefício além do financeiro"
    ],
    "pontosFracos": [
      "Avaliação qualitativa de fornecedores (confiabilidade, histórico, saúde financeira) foi muito limitada",
      "Critérios de ESG (sustentabilidade, práticas trabalhistas) não foram incluídos na matriz de avaliação",
      "O plano de implementação das recomendações (como negociar, em qual ordem) não foi detalhado",
      "Não foram avaliados fornecedores internacionais, mesmo para insumos onde poderiam ser competitivos"
    ],
    "problemas": [
      "Mais da metade dos fornecedores contatados não respondeu às solicitações de cotação no prazo definido",
      "Dados técnicos detalhados dos produtos eram difíceis de obter sem visitas presenciais aos fornecedores",
      "O cliente mantinha sigilo sobre alguns fornecedores estratégicos, limitando o escopo da análise comparativa",
      "Especificações técnicas dos insumos eram muito complexas — a equipe precisou de apoio do cliente para interpretá-las"
    ],
    "errosEquipe": [
      "A equipe não previu a baixa taxa de resposta dos fornecedores e não planejou a coleta com folga de tempo",
      "Análise de saúde financeira e histórico dos fornecedores foi completamente omitida — é dado crítico para Supply Chain",
      "Critérios de ESG foram ignorados, apesar de serem cada vez mais relevantes para decisões de fornecimento",
      "O plano de negociação (como usar os dados coletados para negociar com fornecedores atuais) não foi incluído",
      "A equipe não verificou se os fornecedores mapeados tinham certificações técnicas exigidas pelo setor metalúrgico"
    ],
    "errosCliente": [
      "Não comunicou quais fornecedores eram estratégicos e não deveriam ser substituídos — a equipe mapeou alternativas para todos",
      "As especificações técnicas dos insumos foram entregues em formato ilegível (documentos escaneados à mão)",
      "Pediu inclusão de análise de fornecedores de equipamentos (não apenas insumos) na última semana, sem aditivo"
    ],
    "licoesAprendidas": [
      "Em pesquisas de fornecedores, contatar o dobro do número esperado de respostas — a taxa de retorno é muito baixa",
      "Sempre incluir análise de saúde financeira e certificações técnicas dos fornecedores mapeados",
      "Incluir critérios de ESG na matriz de avaliação de fornecedores — já é padrão para grandes empresas",
      "Elaborar um plano de negociação como entrega complementar — é o que converte o relatório em ação concreta",
      "Definir com o cliente, no kick-off, quais fornecedores são estratégicos e não devem ser substituídos"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1-NPS3qV1OddQVwBu5n_iLAomAmiMWr7I",
    "createdAt": "2023-10-05T12:00:00.000Z",
    "updatedAt": null
  },
  {
    "id": "p13",
    "tipo": "projeto",
    "titulo": "Renove Express — Plano de Marketing",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2023-10-25",
    "ano": "2023",
    "status": "Concluído",
    "tags": [
      "Marketing",
      "Automotivo",
      "Digital",
      "Parcerias B2B"
    ],
    "descricao": "Elaboração de plano de marketing para a Renove Express, empresa de estética automotiva de Uberaba. O projeto realizou diagnóstico da presença digital, mapeamento do público-alvo (pessoas físicas e empresas com frota), análise de concorrentes, estratégia de marketing digital e presença em redes sociais, ações de relacionamento e fidelização com clientes ativos, e levantamento de oportunidades de parceria com concessionárias, seguradoras e locadoras de veículos locais.",
    "pontosFortes": [
      "Identificação de parcerias B2B (concessionárias e seguradoras) foi o grande diferencial e foi muito bem recebida",
      "Diagnóstico digital revelou que o cliente tinha avaliações negativas sem resposta no Google — resolvido imediatamente",
      "Análise do público-alvo dividida em dois segmentos (PF e empresas com frota) foi estrategicamente valiosa",
      "Estratégia de redes sociais foi prática, com templates e roteiro de conteúdo adaptado à equipe do cliente",
      "Entrega dentro do prazo com todas as entregas parciais cumpridas pontualmente"
    ],
    "pontosFracos": [
      "Plano de mídia paga (Meta Ads e Google Ads) ficou sem orçamento definido nem projeção de resultados",
      "Análise da concorrência não incluiu mystery shopper (visita como cliente oculto) — perdeu insights valiosos",
      "Não foi incluído NPS ou pesquisa de satisfação com clientes atuais para embasar a estratégia de retenção",
      "A estratégia de parcerias B2B foi desenvolvida mas não incluiu roteiro de abordagem e argumentos de venda"
    ],
    "problemas": [
      "O cliente não tinha nenhuma presença digital estruturada — o diagnóstico consumiu muito mais tempo do que o planejado",
      "Proprietário resistia a investir em marketing pago, o que limitou significativamente as recomendações",
      "Não havia dados históricos de clientes, frequência de retorno nem ticket médio para embasar a estratégia",
      "O processo de aprovação de entregas dependia exclusivamente do proprietário, que tinha agenda muito apertada"
    ],
    "errosEquipe": [
      "A equipe não realizou mystery shopper na concorrência — perdeu a principal fonte de insight qualitativo sobre a experiência de compra",
      "Não foram levantados dados de ticket médio e frequência de retorno no kick-off — tornaram-se ausências críticas no relatório",
      "A estratégia de parcerias B2B ficou incompleta sem roteiro de abordagem — difícil de implementar sem esse guia",
      "O plano de mídia paga foi entregue sem orçamento — é o que o cliente mais precisava para tomar decisão",
      "Faltou realizar entrevistas com clientes atuais para entender por que voltavam (ou não) ao estabelecimento"
    ],
    "errosCliente": [
      "Não tinha nenhum registro de clientes (nome, contato, histórico) — dificultou toda a análise de retenção",
      "Resistência ao investimento em marketing pago foi comunicada apenas na entrega final, não no início",
      "Tomou decisões de aprovação sem consultar o sócio, que depois pediu alterações em duas entregas"
    ],
    "licoesAprendidas": [
      "Mystery shopper (cliente oculto) deve ser etapa padrão em projetos de marketing para empresas de serviço",
      "Dados de ticket médio, frequência de retorno e NPS devem ser coletados no kick-off — são base de toda estratégia de retenção",
      "A restrição de orçamento para marketing pago deve ser mapeada no início do projeto — não na entrega final",
      "Estratégias de parceria B2B devem incluir roteiro de abordagem, argumentos de venda e modelo de proposta",
      "Identificar todos os decisores do cliente no início do projeto — evita retrabalho por opiniões conflitantes"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1eihIUMLr8hMX3AyTf_aqGep13evcGUcl",
    "createdAt": "2023-10-25T12:00:00.000Z",
    "updatedAt": null
  },
  {
    "id": "p14",
    "tipo": "projeto",
    "titulo": "Telecasa — Plano de Marketing",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2023-11-10",
    "ano": "2023",
    "status": "Concluído",
    "tags": [
      "Marketing",
      "Telecomunicações",
      "Comunicação Integrada",
      "Retenção"
    ],
    "descricao": "Desenvolvimento do plano de marketing para a Telecasa, empresa de telecomunicações e serviços residenciais de Uberaba. O projeto abrangeu análise do mercado local de telecomunicações (concorrência, preços e posicionamento), definição de estratégia de posicionamento diferenciado, plano de comunicação integrada (digital e offline), estratégia de marketing de conteúdo, campanhas de retenção de clientes e captação, e análise dos principais motivos de cancelamento (churn).",
    "pontosFortes": [
      "Análise da concorrência local foi muito abrangente, com dados de preço, cobertura e proposta de valor de cada player",
      "Estratégia de retenção baseada na análise de churn foi o ponto mais elogiado pelo cliente",
      "Plano de comunicação integrada conectou de forma coesa os canais digitais e offline da empresa",
      "Excelente relacionamento com a equipe do cliente durante todo o projeto — comunicação fluida e produtiva",
      "Proposta de programa de indicação (member-get-member) foi inovadora para o setor local"
    ],
    "pontosFracos": [
      "Análise de métricas digitais foi limitada pela ausência de ferramentas de analytics configuradas no cliente",
      "O plano financeiro das campanhas de marketing não foi detalhado com orçamentos e projeções de resultado",
      "Não foi incluída análise de satisfação dos clientes atuais (NPS) que embasaria melhor a estratégia de retenção",
      "A estratégia offline (panfletagem, eventos, parcerias) ficou pouco desenvolvida em relação ao digital"
    ],
    "problemas": [
      "Regulações do setor de telecomunicações eram desconhecidas pela equipe e impuseram restrições às campanhas",
      "Alta competitividade do mercado local tornava a diferenciação muito difícil e as recomendações, menos óbvias",
      "O cronograma foi afetado por período de provas da equipe PROJEP — dois membros ficaram indisponíveis por 10 dias",
      "Os dados de churn do cliente estavam em formato manual (cadernos e anotações) e precisaram ser digitalizados"
    ],
    "errosEquipe": [
      "A equipe não pesquisou as regulações da ANATEL antes de iniciar — descobriu restrições a campanhas já propostas",
      "O período de provas da equipe não foi comunicado ao cliente como fator de risco ao cronograma",
      "Dados de churn manuais deveriam ter sido solicitados no kick-off para permitir digitalização prévia",
      "O plano offline ficou claramente mais fraco que o digital — houve desequilíbrio na distribuição de esforço",
      "Não foram realizadas entrevistas com clientes cancelados para entender os motivos reais do churn"
    ],
    "errosCliente": [
      "Não digitalizou os dados de churn antes do início do projeto — entregou cadernos manuscritos para a equipe",
      "Não mencionou no briefing as restrições regulatórias da ANATEL às campanhas de telecomunicações",
      "Aprovou entregas sem envolver o diretor comercial, que depois contestou as recomendações de canal"
    ],
    "licoesAprendidas": [
      "Em projetos para setores regulados (telecom, saúde, financeiro), pesquisar a regulação aplicável antes de qualquer proposta",
      "Períodos de provas da equipe devem ser comunicados como fator de risco no cronograma do projeto desde o kick-off",
      "Entrevistar clientes cancelados é a forma mais direta de entender o churn real — deve ser etapa obrigatória",
      "Todos os decisores relevantes do cliente devem estar presentes nas reuniões de validação de entregas estratégicas",
      "Dados manuais devem ser solicitados em formato digital no kick-off — ou incluir tempo para digitalização no cronograma"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1B40zZBdxUSOQ5dYwfuSkYfSxFQrsplNH",
    "createdAt": "2023-11-10T12:00:00.000Z",
    "updatedAt": null
  },
  {
    "id": "p15",
    "tipo": "projeto",
    "titulo": "Minerva Foods — Pesquisa de Mercado (2ª)",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2023-11-30",
    "ano": "2023",
    "status": "Concluído",
    "tags": [
      "Pesquisa de Mercado",
      "Alimentação",
      "Grande Empresa",
      "Qualitativo"
    ],
    "descricao": "Segunda pesquisa de mercado para a Minerva Foods, aprofundando segmentos identificados na primeira pesquisa. Esta edição expandiu a abrangência geográfica (três regiões do país), incorporou metodologia qualitativa com grupos focais (3 grupos, 24 participantes), ampliou a amostra quantitativa para 320 respondentes e integrou análise de tendências setoriais com dados de relatórios de consultorias especializadas. O projeto consolidou a PROJEP como parceira estratégica de pesquisa da Minerva Foods.",
    "pontosFortes": [
      "Grupos focais trouxeram profundidade qualitativa que a primeira pesquisa não teve — insights sobre motivações e barreiras de compra",
      "Amostra de 320 respondentes com cobertura geográfica de três regiões aumentou muito a representatividade",
      "A experiência da primeira pesquisa acelerou o projeto — equipe já conhecia o cliente e o contexto",
      "Integração dos resultados com tendências setoriais de consultorias especializadas elevou o nível analítico",
      "Relatório final foi considerado pelo cliente como o melhor trabalho de pesquisa já recebido de qualquer fornecedor"
    ],
    "pontosFracos": [
      "A expansão geográfica gerou custos logísticos não previstos no contrato original",
      "A integração narrativa entre os achados da 1ª e da 2ª pesquisa poderia ter sido mais desenvolvida no relatório",
      "Análise estatística ainda não atingiu o nível de sofisticação esperado para um cliente do porte da Minerva",
      "Alguns grupos focais tiveram número de participantes abaixo do ideal por dificuldade de recrutamento"
    ],
    "problemas": [
      "Coordenação da coleta em três regiões diferentes foi logisticamente muito desafiadora",
      "Recrutamento de participantes para os grupos focais foi mais difícil e caro do que previsto",
      "O prazo de entrega coincidiu com o período de alta demanda da equipe PROJEP — outros projetos ativos",
      "Empresa de recrutamento contratada para os grupos focais entregou participantes fora do perfil em dois grupos"
    ],
    "errosEquipe": [
      "A expansão geográfica foi aceita sem revisão do orçamento — gerou custos absorvidos pela PROJEP",
      "A empresa de recrutamento para grupos focais não foi avaliada adequadamente antes da contratação",
      "Análise estatística inferencial ainda era insuficiente — a equipe deveria ter buscado capacitação entre os dois projetos",
      "A sobrecarga com outros projetos ativos afetou a qualidade das análises na reta final",
      "Não foi elaborado um relatório comparativo formal entre a 1ª e a 2ª pesquisa — oportunidade perdida de valor agregado"
    ],
    "errosCliente": [
      "Incluiu expansão geográfica no escopo sem revisão formal do orçamento — a PROJEP absorveu o custo por não formalizar",
      "Aprovou o perfil de participantes para os grupos focais sem consultar sua equipe de marketing, gerando retrabalho",
      "Demorou 6 dias para aprovar o roteiro do grupo focal, comprimindo o cronograma"
    ],
    "licoesAprendidas": [
      "Qualquer ampliação de escopo (geográfica ou metodológica) deve gerar revisão formal de orçamento e prazo — sem exceção",
      "Avaliar fornecedores de recrutamento para grupos focais com critérios claros e com referências de projetos anteriores",
      "Investir na capacitação em análise estatística inferencial da equipe entre projetos de grande porte",
      "Elaborar relatório comparativo quando o projeto é sequencial — é o principal valor agregado de um segundo projeto",
      "Gerenciar a carteira de projetos ativos — sobrecarga da equipe é o maior risco para a qualidade das entregas"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/19oFE4Cvks61-C6wl3fWuFTir4aTWcbzT",
    "createdAt": "2023-11-30T12:00:00.000Z",
    "updatedAt": null
  },
  {
    "id": "p16",
    "tipo": "projeto",
    "titulo": "CCM — Revisão ISO 9001:2015",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2023-12-15",
    "ano": "2023",
    "status": "Concluído",
    "tags": [
      "ISO 9001",
      "Qualidade",
      "Auditoria",
      "Normas",
      "Certificação"
    ],
    "descricao": "Projeto de revisão e adequação do sistema de gestão da qualidade (SGQ) da CCM à norma ISO 9001:2015. A equipe realizou auditoria documental completa, análise de conformidade de todos os processos da empresa com os requisitos da norma, identificação e classificação das não-conformidades (maiores e menores), elaboração de Plano de Ação Corretivo (PAC) priorizado por criticidade e orientação sobre evidências necessárias para o processo de recertificação. Foi o projeto mais técnico da PROJEP em 2023.",
    "pontosFortes": [
      "Identificação de 23 não-conformidades classificadas por grau de criticidade e com evidências documentadas",
      "Plano de Ação Corretivo (PAC) priorizou as não-conformidades pelo risco para a recertificação",
      "A equipe PROJEP expandiu significativamente seu conhecimento técnico em sistemas de gestão da qualidade",
      "Linguagem do relatório foi adaptada para ser compreensível tanto por gestores quanto por auditores externos",
      "O cliente conseguiu avançar em 14 das 23 não-conformidades durante o prazo do projeto"
    ],
    "pontosFracos": [
      "A equipe precisou de um tempo considerável de estudo da norma — o que comprimiu o tempo de análise e relatório",
      "Algumas recomendações de alto custo não foram acompanhadas de alternativas mais acessíveis para o cliente",
      "A profundidade da auditoria foi limitada pelo prazo — alguns processos foram analisados superficialmente",
      "Não foi realizada uma simulação de auditoria (auditoria interna mock) ao final do projeto para treinar o cliente"
    ],
    "problemas": [
      "Documentação do SGQ estava desatualizada, incompleta e em formatos incompatíveis (Word, PDF, papel)",
      "Vários responsáveis por processos auditados estavam indisponíveis ou resistiam às entrevistas",
      "A resistência de gestores ao processo de auditoria foi significativa — temiam exposição de problemas",
      "A norma ISO 9001:2015 tem requisitos técnicos muito específicos que a equipe estava aprendendo durante o projeto"
    ],
    "errosEquipe": [
      "A equipe não se capacitou adequadamente na norma ISO 9001:2015 antes de iniciar o projeto — aprendeu durante a execução",
      "Não foi planejada uma simulação de auditoria interna ao final — seria a entrega de maior valor para o cliente",
      "A resistência dos gestores não foi gerenciada com uma estratégia de comunicação interna prévia",
      "Faltou solicitar toda a documentação do SGQ antes do início — a equipe ficou semanas aguardando documentos",
      "As não-conformidades foram identificadas mas sem análise de causa-raiz — o cliente não sabia por que aconteciam"
    ],
    "errosCliente": [
      "Não organizou previamente a documentação do SGQ — entregou para a equipe em estado caótico",
      "Não comunicou aos gestores o propósito e o benefício da auditoria — criou resistência desnecessária",
      "Esperava que a PROJEP fosse \"resolver\" as não-conformidades, não apenas identificá-las e orientar — expectativa errada",
      "Aprovou o plano de ação sem envolver os responsáveis pelos processos, que depois questionaram as recomendações"
    ],
    "licoesAprendidas": [
      "Em projetos de ISO e certificação, a equipe deve se capacitar formalmente antes de iniciar — não aprender durante",
      "Sempre incluir auditoria simulada (mock audit) como entrega final de projetos de adequação à ISO — é o maior valor",
      "Solicitar toda a documentação do SGQ com pelo menos 2 semanas de antecedência ao início do projeto",
      "Em processos de auditoria, preparar os gestores com comunicação interna antes das entrevistas — reduz resistência",
      "Identificação de não-conformidades deve vir acompanhada de análise de causa-raiz — sem isso, o plano de ação é fraco"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1VQishbiHs69c9mhweBbZZw0BVIyqetse",
    "createdAt": "2023-12-15T12:00:00.000Z",
    "updatedAt": null
  },
  {
    "id": "q01",
    "tipo": "projeto",
    "titulo": "Apoio Consultoria — Mapeamento de Processos",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2024-05-03",
    "ano": "2024",
    "status": "Concluído",
    "tags": [
      "Mapeamento",
      "Processos",
      "Consultoria",
      "2024"
    ],
    "descricao": "Mapeamento de processos realizado para a Apoio Consultoria Jr., empresa junior parceira localizada em Uberlandia. O projeto mapeou os processos internos com objetivo de padronizar procedimentos e identificar gargalos operacionais. O documento de problemas registrado estava vazio, indicando que o projeto transcorreu sem ocorrencias formais registradas pela equipe.",
    "pontosFortes": [
      "Projeto entre EJs gerou aprendizado mutuo e fortaleceu o relacionamento interEJs",
      "Escopo bem definido no TAP com metodologia BPMN estruturada",
      "Entrega de TAP, arquitetura de processos, mapas as is, relatorio de analise e mapas to be conforme planejado",
      "Projeto concluido sem ocorrencias formais registradas no quadro de problemas"
    ],
    "pontosFracos": [
      "Ausencia de registros de problemas pode indicar falta de uso do quadro de ocorrencias, nao ausencia real de problemas",
      "Projeto com cliente EJ tende a ter menor rigor contratual",
      "Distancia geografica (Uberlandia) pode ter limitado visitas presenciais e observacao direta dos processos"
    ],
    "problemas": [
      "Nenhuma ocorrencia formal registrada no documento de problemas do projeto"
    ],
    "errosEquipe": [
      "Quadro de problemas vazio sugere que a equipe nao utilizou a ferramenta ao longo do projeto, habito importante de gestao",
      "Projetos entre EJs podem ser tratados com menor rigor do que projetos com clientes externos pagantes"
    ],
    "errosCliente": [
      "Nao foram identificados erros formais do cliente neste projeto"
    ],
    "licoesAprendidas": [
      "Utilizar o quadro de problemas em TODOS os projetos, mesmo quando tudo vai bem, registros vazios sao suspeitos",
      "Projetos entre EJs devem ter o mesmo rigor metodologico que projetos com clientes externos",
      "Manter visitas presenciais mesmo em projetos com clientes parceiros, observacao direta e insubstituivel"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1TxL8Xq8I2jBUUG8RZCvMSwmqCYL5-5NH",
    "createdAt": "2024-05-03T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "q02",
    "tipo": "projeto",
    "titulo": "Producao Jr. — Pesquisa de Mercado",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2024-05-04",
    "ano": "2024",
    "status": "Concluído",
    "tags": [
      "Pesquisa de Mercado",
      "Empresa Junior",
      "MEJ",
      "2024"
    ],
    "descricao": "Pesquisa de mercado para a Producao Jr., empresa junior do setor audiovisual de Ribeirao Preto. Problemas reais registrados: a cliente nao respondia mensagens desde 19/03, atrasando o kick-off por mais de uma semana. Depois atrasou a validacao do formulario por mais duas semanas. Alem disso, o cliente solicitou pesquisa em condominios de luxo (Damha) aos quais a equipe nao tinha autorizacao de acesso, comprometendo a coleta.",
    "pontosFortes": [
      "Experiencia real de gestao de cliente dificil mesmo sendo uma EJ",
      "Formulario foi refinado ao longo do processo melhorando a qualidade das perguntas",
      "Projeto trouxe aprendizado sobre negociacao de escopo e gestao de expectativas"
    ],
    "pontosFracos": [
      "A solicitacao de pesquisa em condominios fechados nao foi contestada no TAP",
      "Validacao do formulario tomou 2 semanas que deveriam ter sido usadas na coleta",
      "Atraso inicial no kick-off nao gerou revisao formal do cronograma"
    ],
    "problemas": [
      "Cliente nao respondeu mensagens desde 19/03 ate 22/03, impedindo o kick-off e atrasando a fase de Planejamento",
      "Cliente atrasou 2 semanas para validar o formulario, comprimindo o prazo de coleta",
      "Cliente solicitou pesquisa em condominio Damha (fechado) sem autorizacao de acesso, equipe nao conseguiu entrar"
    ],
    "errosEquipe": [
      "A equipe nao mapeou restricoes de acesso ao publico-alvo no momento do briefing",
      "O atraso de 5 dias sem resposta deveria ter acionado protocolo de comunicacao formal mais cedo",
      "Nao houve revisao do cronograma apos os atrasos, entregou-se comprimindo etapas"
    ],
    "errosCliente": [
      "Ficou mais de 5 dias sem responder mensagens na fase de planejamento",
      "Atrasou 2 semanas para validar o formulario de pesquisa",
      "Solicitou pesquisa em local fechado sem avaliar a viabilidade de acesso da equipe PROJEP"
    ],
    "licoesAprendidas": [
      "Mapear restricoes de acesso ao publico-alvo ANTES de fechar o escopo, nunca assumir que a coleta sera possivel em qualquer local",
      "Apos 3 dias sem resposta do cliente, enviar comunicacao formal por e-mail com registro, nao apenas WhatsApp",
      "Qualquer atraso do cliente que afete o cronograma deve gerar revisao formal documentada do prazo"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/11-ayNHmTNKLQwgIoxo_Xg7fYdODM-q9p",
    "createdAt": "2024-05-04T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "q03",
    "tipo": "projeto",
    "titulo": "SunUp — Plano de Negocio",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2024-08-20",
    "ano": "2024",
    "status": "Concluído",
    "tags": [
      "Plano de Negocios",
      "Energia Solar",
      "Startup",
      "Financeiro",
      "2024"
    ],
    "descricao": "Elaboracao de plano de negocios completo para a SunUp, empresa do setor de energia solar fotovoltaica. O projeto contemplou analise de macroambiente PESTEL, analise de concorrencia, pesquisa de publico-alvo, segmentacao de mercado, criacao de personas, definicao de MVV, composto de marketing 4Ps, analise SWOT, plano operacional, plano de acao 5W2H e plano financeiro com projecoes. Documento final concluido em novembro de 2024.",
    "pontosFortes": [
      "Documento final muito completo com todos os elementos de um plano de negocios robusto",
      "Analise de macroambiente contextualizada para o setor de energia solar em expansao",
      "Criacao de personas fundamentada com dados de publico-alvo coletados em pesquisa",
      "Plano financeiro com projecoes e planilha de controle entregues junto ao relatorio"
    ],
    "pontosFracos": [
      "Analise regulatoria do setor eletrico poderia ter sido mais aprofundada",
      "Plano de expansao geografica ficou em segundo plano",
      "Analise de concorrencia nacional dos grandes players foi menos detalhada que a local"
    ],
    "problemas": [
      "Dados especificos do mercado fotovoltaico em Uberaba eram escassos, dependencia de dados nacionais",
      "Setor com terminologia tecnica especifica exigiu tempo de ambientacao da equipe"
    ],
    "errosEquipe": [
      "A equipe nao buscou apoio tecnico externo para a parte de engenharia eletrica, lacuna no dimensionamento de sistemas",
      "Analise de riscos regulatorios poderia ter sido mais detalhada dado o dinamismo do setor",
      "Analise de sensibilidade para variacoes no custo dos paineis solares deveria ter sido incluida"
    ],
    "errosCliente": [
      "Alterou premissas financeiras em fase avancada, exigindo retrabalho nas projecoes",
      "Nao forneceu dados historicos de custos operacionais para embasar as projecoes"
    ],
    "licoesAprendidas": [
      "Em setores tecnicos, buscar referencias e apoio especializado antes de comecar, nao descobrir as lacunas no meio do projeto",
      "Incluir analise de sensibilidade em planos financeiros de setores com alta variacao de custo de insumos",
      "Congelar premissas financeiras formalmente antes de iniciar as projecoes, qualquer mudanca posterior gera aditivo"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1jAQZNIgMub2OYluHOrKQuXnDbjZkbsdA",
    "createdAt": "2024-08-20T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "q04",
    "tipo": "projeto",
    "titulo": "Luderia — Pesquisa de Mercado",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2024-03-23",
    "ano": "2024",
    "status": "Concluído",
    "tags": [
      "Pesquisa de Mercado",
      "Entretenimento",
      "Jogos",
      "Varejo",
      "2024"
    ],
    "descricao": "Pesquisa de mercado para a Luderia, empresa de entretenimento com foco em jogos de tabuleiro e experiencias interativas em Uberaba. O projeto analisou o perfil do consumidor local de jogos, comportamento de compra, percepcao de marca e tendencias do mercado de entretenimento analogico. TAP definiu metodologia por formularios com amostra representativa.",
    "pontosFortes": [
      "Publico-alvo de jogos e naturalmente engajado, alta qualidade nas respostas",
      "Relatorio final com visualizacoes bem elaboradas e linguagem adequada ao perfil do cliente",
      "Analise de tendencias do mercado de jogos de tabuleiro no Brasil trouxe contexto relevante",
      "Entrega dentro do prazo com todas as etapas cumpridas"
    ],
    "pontosFracos": [
      "Mercado de jogos tem poucos dados publicos no Brasil, analise quantitativa limitada",
      "Nao foram mapeados concorrentes online, sendo estes os maiores competidores",
      "Sazonalidade impactou respostas sobre frequencia de compra sem ser controlada na analise"
    ],
    "problemas": [
      "Dados de mercado nacionais de jogos de tabuleiro eram escassos e pouco atualizados",
      "Recrutamento de participantes para entrevistas qualitativas foi desafiador"
    ],
    "errosEquipe": [
      "Concorrentes online nao foram incluidos na analise, erro estrategico para mercado crescentemente digital",
      "A sazonalidade nao foi controlada na analise, pode ter distorcido frequencia de compra reportada",
      "Nao foi feita analise de ticket medio e giro de produtos"
    ],
    "errosCliente": [
      "Nao disponibilizou dados de vendas por categoria para cruzar com os resultados",
      "Nao definiu claramente se queria foco em consumidor final ou comprador de presentes"
    ],
    "licoesAprendidas": [
      "Em pesquisas de mercado para varejo, sempre incluir analise de concorrentes online alem dos fisicos",
      "Definir com precisao o perfil do respondente antes de criar o formulario",
      "Controlar sazonalidade na analise ou coletar dados em diferentes periodos"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1owXJmav71662iuvCmSR_vK-1mtaUhkP8",
    "createdAt": "2024-03-23T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "q05",
    "tipo": "projeto",
    "titulo": "Crafter's — Plano de Marketing",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2024-05-03",
    "ano": "2024",
    "status": "Concluído",
    "tags": [
      "Marketing",
      "Artesanato",
      "E-commerce",
      "Redes Sociais",
      "2024"
    ],
    "descricao": "Elaboracao de plano de marketing para a Crafter's, empresa de artesanato e produtos personalizados. Problema real registrado: na fase de pesquisa de mercado, o cliente solicitou coleta em condominio de luxo Damha, mas a equipe nao tinha autorizacao de acesso, gerando atraso na etapa de Analise de Mercado. O projeto incluiu estrategia digital, calendario editorial e posicionamento de marca.",
    "pontosFortes": [
      "Calendario editorial sazonal muito pratico alinhado as datas mais relevantes para o segmento",
      "Estrategia de Instagram Shopping bem adaptada a realidade operacional do cliente",
      "Diagnostico digital revelou oportunidades de melhoria imediata na presenca online",
      "Relacionamento excelente com a cliente durante todo o projeto"
    ],
    "pontosFracos": [
      "Analise de precificacao dos produtos nao foi incluida, sendo crucial para e-commerce artesanal",
      "Estrategia de trafego pago ficou generica sem orcamento ou projecao de resultado",
      "Separacao entre marca pessoal e marca do negocio nao foi abordada"
    ],
    "problemas": [
      "Pesquisa de mercado atrasou pois cliente solicitou coleta em condominio Damha (fechado) sem viabilidade de acesso pela equipe PROJEP"
    ],
    "errosEquipe": [
      "A viabilidade de acesso ao local de coleta nao foi verificada antes de aceitar a solicitacao",
      "Analise de precificacao foi omitida mesmo sendo fundamental para um negocio de e-commerce",
      "Separacao PF/PJ nao foi abordada, ponto critico para negocios de artesanato pessoal"
    ],
    "errosCliente": [
      "Sugeriu local de coleta sem verificar se a equipe teria acesso, gerando atraso real no cronograma",
      "Nao tinha catalogo de produtos organizado para servir de referencia durante o projeto"
    ],
    "licoesAprendidas": [
      "Sempre verificar a viabilidade de acesso ao local ANTES de aceitar solicitacao de coleta de dados",
      "Analise de precificacao deve ser item obrigatorio em planos de marketing para e-commerce artesanal",
      "Abordar a separacao entre marca pessoal e empresarial no diagnostico inicial de negocios individuais"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1n4QsBCS54CLz-H5ajw5HTC3qrIUV5st9",
    "createdAt": "2024-05-03T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "q06",
    "tipo": "projeto",
    "titulo": "O Boticario — Inventario",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2024-05-27",
    "ano": "2024",
    "status": "Concluído",
    "tags": [
      "Inventario",
      "Varejo",
      "Controle de Estoque",
      "Franquia",
      "2024"
    ],
    "descricao": "Projeto de inventario para franquia do O Boticario em Uberaba. Problema real registrado: no dia 27/05, o cliente informou que as lojas abriam as 8h, mas abriram apenas as 9h, atrasando o inicio da contagem em algumas unidades. A equipe desenvolveu metodologia de inventario, treinou a equipe das lojas, conduziu a contagem fisica e elaborou relatorio com divergencias identificadas.",
    "pontosFortes": [
      "Metodologia de inventario foi bem estruturada e executada com precisao nas unidades visitadas",
      "Identificacao de divergencias de estoque revelou perdas nao mapeadas pelo cliente",
      "Treinamento da equipe das lojas foi pratico e bem recebido",
      "Relatorio final com ranking de produtos com maior divergencia foi muito util para a gestao"
    ],
    "pontosFracos": [
      "Analise das causas das divergencias poderia ter sido mais aprofundada",
      "Nao foi elaborado plano de prevencao de perdas para o futuro",
      "Sistema de gestao da franquia tinha restricoes de acesso que limitaram a conciliacao completa"
    ],
    "problemas": [
      "Cliente informou horario de abertura incorreto (8h vs. 9h real), atrasou inicio da contagem e gerou desorganizacao no cronograma do dia do inventario"
    ],
    "errosEquipe": [
      "Nao confirmou o horario de abertura real das lojas com o gerente no dia anterior",
      "Nao foi elaborado plano de prevencao de perdas, o inventario identificou o problema mas nao propoe solucao estrutural",
      "A analise de causa-raiz das divergencias foi superficial"
    ],
    "errosCliente": [
      "Informou horario de abertura incorreto sem verificar previamente com os gerentes das lojas",
      "Nao preparou a equipe das lojas com antecedencia suficiente sobre o dia do inventario"
    ],
    "licoesAprendidas": [
      "Para inventarios em multiplas lojas, confirmar horarios e condicoes de acesso com os gerentes locais na vespera",
      "Inventario deve sempre vir acompanhado de analise de causa-raiz das divergencias e plano de prevencao de perdas",
      "Em projetos de franquias, mapear restricoes de acesso ao sistema antes de comecar"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1MlZ_HNr63M1S4QfIE_mfbYT6EYb3FWmH",
    "createdAt": "2024-05-27T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "q07",
    "tipo": "projeto",
    "titulo": "Infinito Marmores e Granitos — Plano de Negocios",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2024-11-05",
    "ano": "2024",
    "status": "Concluído",
    "tags": [
      "Plano de Negocios",
      "Construcao Civil",
      "Marmore",
      "Uberaba",
      "2024"
    ],
    "descricao": "Elaboracao de plano de negocios completo para a Infinito Marmores e Granitos, localizada na Av. Nossa Senhora do Desterro em Uberaba. O documento final de novembro de 2024 teve mais de 65 paginas e contemplou: analise de macroambiente de Uberaba com populacao de 337.836 habitantes, analise de 9 concorrentes diretos (Pietra Roza, Marmoraria do Marcao, Paraiso, Marmohop, Arte Final, RM, Carre, Mundial e Imperio) e indiretos, analise de publico-alvo com dados de pesquisa, segmentacao, personas, 4Ps, SWOT, 5W2H e plano financeiro.",
    "pontosFortes": [
      "Documento mais completo do portfolio 2024, com 9 concorrentes diretos mapeados individualmente com avaliacao detalhada",
      "Analise de publico-alvo com dados reais de pesquisa cobrindo faixa etaria, frequencia de compra, meio de pesquisa e fatores de decisao",
      "Contexto de Uberaba muito bem documentado com dados demograficos, economia local e posicao no ranking estadual",
      "Criacao de personas baseada em dados reais de pesquisa, nao apenas intuicao",
      "Plano financeiro com projecoes e planilha de controle entregues junto ao relatorio final"
    ],
    "pontosFracos": [
      "Analise de concorrentes nacionais e marmorarias online nao foi incluida",
      "Risco cambial na importacao de marmores nao foi considerado nas analises de risco",
      "Capacidade produtiva da empresa nao foi avaliada, pode comprometer as projecoes de vendas"
    ],
    "problemas": [
      "Dados especificos do mercado de marmores e granitos em cidades medias eram escassos",
      "Setor com muita informalidade dificultou estimativas de tamanho de mercado local"
    ],
    "errosEquipe": [
      "Risco cambial nao foi considerado mesmo sendo fator critico para marmorarias que importam materiais",
      "A informalidade do setor deveria ter sido mapeada como variavel de risco explicita",
      "Capacidade produtiva da empresa nao foi avaliada, pode comprometer as projecoes financeiras"
    ],
    "errosCliente": [
      "Nao forneceu demonstrativo financeiro historico completo para embasar as projecoes com mais precisao",
      "Contato teve resposta lenta em algumas etapas do projeto"
    ],
    "licoesAprendidas": [
      "Em setores com exposicao a materiais importados, sempre incluir analise de risco cambial",
      "Mapeamento de concorrentes deve incluir players online e nacionais alem dos locais",
      "Sempre avaliar a capacidade produtiva atual antes de projetar crescimento de vendas"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1n4M7XipSPJehUHMBe7vKUw0mRV4bB0cI",
    "createdAt": "2024-11-05T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "q08",
    "tipo": "projeto",
    "titulo": "BOB's — Plano de Marketing",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2024-07-31",
    "ano": "2024",
    "status": "Concluído",
    "tags": [
      "Marketing",
      "Fast Food",
      "Franquia",
      "Shopping",
      "2024"
    ],
    "descricao": "Desenvolvimento de plano de marketing para franquia do BOB's no Segovia Mall de Uberaba, contato: Marcela Brazil. O projeto abrangeu diagnostico da presenca digital local, analise da concorrencia no segmento de fast food, estrategia de marketing local dentro das diretrizes da franqueadora, acoes de fidelizacao e plano de comunicacao sazonal. A franqueadora BOB's tem restricoes contratuais sobre acoes de marketing local.",
    "pontosFortes": [
      "Analise de concorrencia local foi muito detalhada com benchmarks praticos de experiencia e comunicacao",
      "Calendario de acoes sazonais bem estruturado e imediatamente utilizavel pelo franqueado",
      "Estrategia criativa dentro das restricoes da franqueadora demonstrou capacidade de adaptacao",
      "Entrega dentro do prazo com relacionamento positivo com o cliente"
    ],
    "pontosFracos": [
      "Estrategia de delivery ficou pouco desenvolvida para um fast food em shopping",
      "Analise de ticket medio e frequencia de visita dos clientes nao foi incluida",
      "Plano de midia paga ficou generico sem orcamento ou projecao de ROI"
    ],
    "problemas": [
      "Restricoes contratuais da franqueadora BOB's limitaram varias acoes que seriam mais efetivas localmente",
      "Franqueado tinha autonomia limitada para implementar acoes sem aprovacao previa da franqueadora"
    ],
    "errosEquipe": [
      "A equipe nao pesquisou o manual de franqueados do BOB's antes de propor estrategias, retrabalho na fase final",
      "A estrategia de delivery foi o ponto mais fraco, desconsiderou que shopping tem forte potencial de delivery no horario de pico",
      "Ticket medio e frequencia de visita deveriam ser dados coletados no kick-off"
    ],
    "errosCliente": [
      "Nao informou todas as restricoes da franqueadora no briefing inicial, equipe descobriu durante o desenvolvimento",
      "Aprovacao dependia da franqueadora e do proprio cliente, dois niveis de aprovacao nao previstos"
    ],
    "licoesAprendidas": [
      "Em projetos de franquias, o PRIMEIRO passo e sempre mapear o manual e as restricoes contratuais da franqueadora",
      "Delivery e canal critico para fast food em shopping, deve ter capitulo proprio no plano de marketing",
      "Sempre coletar ticket medio e frequencia de visita no kick-off, sao a base de qualquer estrategia de fidelizacao"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1CEBV20EbzzWhR6xpsjOu3UcQwib8ZPWc",
    "createdAt": "2024-07-31T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "q09",
    "tipo": "projeto",
    "titulo": "MMarra — Mapeamento de Processos",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2024-10-28",
    "ano": "2024",
    "status": "Concluído",
    "tags": [
      "Mapeamento",
      "Processos",
      "Automotivo",
      "Ribeirao Preto",
      "BPMN",
      "2024"
    ],
    "descricao": "Mapeamento de processos para a MMarra Distribuidora Automotiva Ltda, localizada em Ribeirao Preto-SP, contato: Larissa Marra. Setores mapeados: Oficina, Nota Fiscal e Processo de Compra. O projeto foi marcado por graves problemas de comunicacao: 26 dias sem validacao das etapas em setembro/outubro de 2024, com contatos sem resposta em 12, 13, 16, 17 e 18/09. O projeto chegou a beira do encerramento por abandono do cliente.",
    "pontosFortes": [
      "Visita presencial a Ribeirao Preto trouxe dados ricos sobre os processos reais da Oficina",
      "TAP muito bem estruturado com escopo detalhado de 6 etapas e entregaveis claros",
      "Contrato assinado digitalmente via D4Sign com todas as clausulas de obrigacoes formalizadas",
      "A equipe manteve profissionalismo e persistencia mesmo com o cliente sumindo por semanas",
      "Mapeamento dos setores Oficina, Nota Fiscal e Compra entregue com notacao BPMN via Bizagi"
    ],
    "pontosFracos": [
      "O setor de Service exigiu visita exclusivamente presencial, nao previsto no planejamento, causando atraso de mais de 1 semana",
      "A fase de analise foi desenvolvida sem validacao completa do mapeamento para nao atrasar mais, comprometeu a qualidade",
      "O NPS de 50% demorou para ser coletado por falta de resposta da Larissa"
    ],
    "problemas": [
      "25/06: Reuniao de identificacao adiada por Larissa para a proxima semana, ultima semana do mes",
      "03/07: Service precisou ser mapeado exclusivamente presencial, atraso de mais de 1 semana",
      "04/07: Funcionarios de ferias e impossibilitados de parar o servico, apenas 2 entrevistados no dia todo",
      "26/08: NPS 50%, Larissa nao retornou por 2 dias",
      "29/08: Envio do mapeamento para validacao, sem retorno ate 06/09",
      "10/09: Larissa prometeu reuniao as 16h mas mudou para o dia seguinte as 15h52",
      "12 a 18/09: 5 dias de contato diario sem nenhum retorno da Larissa",
      "23/09: Retorno apos 26 dias, projeto completamente estagnado",
      "27/09 a 08/10: Contato diario sem retorno, projeto em risco de cancelamento",
      "09/10: Larissa retornou dizendo estar sobrecarregada e prometendo reuniao"
    ],
    "errosEquipe": [
      "Nao previu no planejamento que setores industriais frequentemente exigem visita presencial exclusiva",
      "A analise foi desenvolvida sem validacao do mapeamento para nao atrasar, decisao arriscada que comprometeu a qualidade",
      "O protocolo de comunicacao para cliente sem resposta deveria ter sido acionado formalmente apos 5 dias, nao depois de 26",
      "Falta de escalonamento para a diretoria quando o projeto ficou estagnado por 26 dias"
    ],
    "errosCliente": [
      "Ficou 26 dias sem validar as etapas de mapeamento e analise, travando completamente o projeto",
      "Prometia retornos que nao cumpria, disse hoje te entrego tudo e mudou a reuniao na ultima hora",
      "Ficou de 12 a 18/09 sem responder nenhuma mensagem mesmo com contato diario da equipe",
      "Nao organizou a disponibilidade dos funcionarios para entrevistas, criou gargalos nas visitas presenciais"
    ],
    "licoesAprendidas": [
      "Incluir no contrato clausula de SLA de resposta: cliente sem retorno por X dias ativa protocolo formal com notificacao escrita",
      "Verificar no kick-off se todos os setores a mapear permitem entrevistas remotas, setores que exigem presencial devem constar no cronograma",
      "Nao avancar para analise sem validacao do mapeamento, a pressa gera retrabalho",
      "Escalar para a diretoria qualquer projeto parado por mais de 10 dias sem resposta, nao deixar o GP resolver sozinho",
      "Registrar TODOS os problemas de comunicacao no quadro de ocorrencias, documentacao e protecao juridica"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1TuCJUNItVh6xrjEO1InQqYsCrp9TPao9",
    "createdAt": "2024-10-28T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "q10",
    "tipo": "projeto",
    "titulo": "Paula Pisos — Plano Financeiro",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2024-07-15",
    "ano": "2024",
    "status": "Concluído",
    "tags": [
      "Financeiro",
      "Varejo",
      "Pisos",
      "DRE",
      "Fluxo de Caixa",
      "2024"
    ],
    "descricao": "Estruturacao do planejamento financeiro para a Paula Pisos, empresa de varejo de pisos e revestimentos. O projeto elaborou DRE gerencial, analise de margem de contribuicao por linha de produto, fluxo de caixa projetado, calculo do ponto de equilibrio e estruturacao de controles financeiros. O projeto identificou que a linha de porcelanato era deficitaria, insight de alto impacto que mudou a estrategia de compras do cliente.",
    "pontosFortes": [
      "DRE gerencial revelou que a linha de porcelanato era deficitaria, dado que o cliente nao sabia e mudou sua estrategia de compras",
      "Ponto de equilibrio calculado com precisao, primeira vez que o cliente tinha essa informacao",
      "Planilha de fluxo de caixa foi adotada imediatamente pela gestao na semana seguinte a entrega",
      "Analise de margem por linha de produto mudou concretamente a estrategia comercial do cliente"
    ],
    "pontosFracos": [
      "Projecao de cenarios futuros foi limitada a 12 meses",
      "Analise de capital de giro nao foi aprofundada, critica para empresa com alto estoque de materiais",
      "Analise de sazonalidade do mercado de construcao civil nao foi incluida"
    ],
    "problemas": [
      "Dados financeiros historicos estavam misturados com financas pessoais do proprietario, dados muito impuros",
      "Ausencia de separacao entre pessoa fisica e juridica criou inconsistencias nos dados analisados"
    ],
    "errosEquipe": [
      "Nao orientou o cliente sobre a importancia de separar PF e PJ antes de iniciar, impactou todo o projeto",
      "Analise de capital de giro foi negligenciada mesmo sendo critica para empresa com alto estoque",
      "Sazonalidade do setor de construcao civil nao foi incorporada nas projecoes de fluxo de caixa"
    ],
    "errosCliente": [
      "Misturava despesas pessoais com despesas da empresa, dados financeiros muito impuros",
      "Nao sabia a diferenca entre lucro e fluxo de caixa, expectativa de que o projeto resolveria coisas fora do escopo"
    ],
    "licoesAprendidas": [
      "Em projetos financeiros para pequenas empresas, verificar e orientar sobre separacao PF/PJ ANTES de iniciar",
      "Capital de giro deve ser item obrigatorio em todo plano financeiro para empresas com alto estoque",
      "Incluir sazonalidade do setor nas projecoes financeiras, construtoras e varejistas de materiais tem picos sazonais"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1WZ0wPVlN05sG7InAdycU6xWlwPCiseiX",
    "createdAt": "2024-07-15T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "q11",
    "tipo": "projeto",
    "titulo": "Lua de Mel — Plano de Marketing",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2024-08-14",
    "ano": "2024",
    "status": "Concluído",
    "tags": [
      "Marketing",
      "Confeitaria",
      "Delivery",
      "Instagram",
      "2024"
    ],
    "descricao": "Desenvolvimento de plano de marketing para a Lua de Mel, confeitaria artesanal com foco em bolos e doces para eventos em Uberaba. O projeto abrangeu diagnostico digital, analise de concorrencia, estrategia de conteudo para Instagram, acoes sazonais alinhadas as datas comemorativas, estrategia de precificacao e acoes de indicacao e fidelizacao. Identificou que o cliente cobrava abaixo do mercado, com recomendacao de aumento de precos.",
    "pontosFortes": [
      "Analise de precificacao revelou que o cliente cobrava abaixo do mercado local, aumento de precos recomendado e aceito",
      "Calendario de datas comemorativas foi detalhado e muito util para planejamento da confeitaria",
      "Estrategia de conteudo para Instagram foi visual e pratica de implementar",
      "Relacionamento excelente com a cliente durante todo o projeto"
    ],
    "pontosFracos": [
      "WhatsApp Business foi completamente ignorado mesmo sendo o principal canal de conversao para confeitarias",
      "A capacidade produtiva limitada da cliente nao foi considerada nas estrategias de crescimento",
      "Analise de concorrencia poderia ter incluido confeitarias de referencia de outras cidades"
    ],
    "problemas": [
      "Cliente misturava perfil pessoal e profissional no Instagram, dificultou analise de metricas reais",
      "Producao artesanal limitada impedia crescimento acelerado, restricao nao prevista no escopo inicial"
    ],
    "errosEquipe": [
      "WhatsApp Business foi completamente ignorado mesmo sendo o canal de conversao principal para confeitarias",
      "Nao foi mapeada a capacidade produtiva do cliente antes de propor estrategias de crescimento de demanda",
      "A separacao dos perfis pessoal e profissional nao foi incluida como entrega mesmo sendo necessidade obvia"
    ],
    "errosCliente": [
      "Nao mencionou que tinha capacidade produtiva limitada, varias estrategias se tornaram inpraticaveis operacionalmente",
      "Misturava conteudo pessoal e profissional no mesmo Instagram sem perceber o impacto negativo na marca"
    ],
    "licoesAprendidas": [
      "Para confeitarias e negocios artesanais, WhatsApp Business deve ser parte central do plano de marketing",
      "Sempre mapear capacidade produtiva do cliente ANTES de propor estrategias de crescimento de demanda",
      "Separacao de perfil pessoal e profissional deve ser entrega obrigatoria em projetos de marketing para negocios individuais"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1kvddnTYLfmOpDZzcwa0zWjwgRfTSklxA",
    "createdAt": "2024-08-14T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "q12",
    "tipo": "projeto",
    "titulo": "Paola Tecidos — Analise de Fornecedores",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2024-09-16",
    "ano": "2024",
    "status": "Concluído",
    "tags": [
      "Fornecedores",
      "Textil",
      "Compras",
      "Supply Chain",
      "Atacado",
      "2024"
    ],
    "descricao": "Mapeamento e analise comparativa de fornecedores para a Paola Tecidos, empresa atacadista do setor textil de Uberaba. O projeto identificou fornecedores alternativos de tecidos, aviamentos e embalagens, analisou condicoes comerciais, qualidade e prazos de entrega, e elaborou matriz de avaliacao ponderada com recomendacoes. O setor textil tem muitos fornecedores que negociam via WhatsApp sem formalizacoes.",
    "pontosFortes": [
      "Matriz de avaliacao de fornecedores com criterios ponderados foi muito bem estruturada e aceita pelo cliente",
      "Identificacao de fornecedores alternativos gerou poder de negociacao imediato",
      "Analise de prazo de entrega revelou gargalo critico com fornecedor principal que atrasava pedidos recorrentemente",
      "Relatorio com recomendacoes priorizadas facilitou a tomada de decisao imediata"
    ],
    "pontosFracos": [
      "Fornecedores internacionais nao foram mapeados mesmo sendo relevantes e competitivos no setor textil",
      "A analise de qualidade foi subjetiva por falta de criterios tecnicos objetivos definidos previamente",
      "Nao foi incluida analise de saude financeira dos fornecedores"
    ],
    "problemas": [
      "Muitos fornecedores do setor textil negociavam apenas por WhatsApp, sem resposta formal a solicitacoes por e-mail",
      "Especificacoes tecnicas dos tecidos exigiam conhecimento especifico do setor que a equipe nao dominava"
    ],
    "errosEquipe": [
      "Fornecedores internacionais foram ignorados, lacuna importante pois China e India sao competitivos em texteis",
      "Os criterios de qualidade nao foram definidos objetivamente antes de avaliar fornecedores, avaliacao ficou subjetiva",
      "Saude financeira dos fornecedores nao foi avaliada"
    ],
    "errosCliente": [
      "Nao forneceu ficha tecnica dos produtos, dificultou muito a avaliacao objetiva de qualidade",
      "Nao informou que a maioria dos fornecedores negociava por WhatsApp, estrategia de coleta de cotacoes foi inadequada"
    ],
    "licoesAprendidas": [
      "Em setores com forte presenca de fornecedores asiaticos, sempre inclui-los na analise comparativa",
      "Definir criterios objetivos e ponderados de qualidade com o cliente ANTES de avaliar fornecedores",
      "Adaptar a estrategia de coleta de informacoes ao canal do setor, textil usa WhatsApp nao e-mail formal"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1B7Om_gZB0aZ-cmJw2TmoQqh7EVChFhOi",
    "createdAt": "2024-09-16T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "q13",
    "tipo": "projeto",
    "titulo": "VL Chinelos — Pesquisa de Mercado",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2024-10-02",
    "ano": "2024",
    "status": "Concluído",
    "tags": [
      "Pesquisa de Mercado",
      "Calcados",
      "Varejo",
      "Uberaba",
      "2024"
    ],
    "descricao": "Pesquisa de mercado para a VL Chinelos com objetivo de entender a populacao ao redor do empreendimento em Uberaba. O TAP definiu escopo de 4 etapas: Planejamento e Definicao (1 semana), Pesquisa de Mercado (4 semanas de coleta por formularios), Analise das Informacoes Coletadas (2 semanas) e Finalizacao com apresentacao. Objetivo era identificar potencial de mercado e anseios da populacao para o empreendimento.",
    "pontosFortes": [
      "Pesquisa com consumidores por abordagem presencial teve alta taxa de resposta",
      "Relatorio com visualizacoes claras e linguagem executiva muito bem recebido",
      "Analise revelou preferencia por compra presencial, insight contrario ao esperado pelo cliente mas valioso",
      "Entrega dentro do prazo com apresentacao final ao cliente conforme previsto no TAP"
    ],
    "pontosFracos": [
      "Canal online foi ignorado mesmo sendo crescente no mercado de calcados",
      "Publico-alvo era amplo demais, dificultou segmentacao dos resultados",
      "Dados de sazonalidade de vendas nao foram coletados, impacto no negocio nao avaliado"
    ],
    "problemas": [
      "Cliente nao definiu claramente o segmento de publico-alvo, deixou a definicao para a equipe PROJEP",
      "Publico-alvo muito amplo dificultou a criacao de formulario especifico e relevante"
    ],
    "errosEquipe": [
      "Canal online nao foi incluido na analise, mercado de chinelos tem forte presenca em marketplaces",
      "O publico-alvo deveria ter sido segmentado antes do inicio da coleta, formulario ficou generico",
      "Sazonalidade nao foi considerada, chinelos vendem muito mais no verao"
    ],
    "errosCliente": [
      "Nao definiu o segmento de publico que queria atingir, deixou a decisao estrategica para a equipe PROJEP",
      "Nao forneceu dados historicos de vendas que teriam orientado melhor o escopo da pesquisa"
    ],
    "licoesAprendidas": [
      "Definir o publico-alvo com precisao antes de criar o formulario, segmentacao previa melhora muito a qualidade dos dados",
      "Mercado de calcados tem forte presenca online, sempre incluir analise de marketplaces e e-commerce",
      "O cliente DEVE tomar decisoes estrategicas sobre seu proprio publico, a PROJEP orienta mas nao decide sozinha"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/19iNaDSirPJTkmwFwBmp0WRnAL3Yfxscz",
    "createdAt": "2024-10-02T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "q14",
    "tipo": "projeto",
    "titulo": "E-Machine — Analise de Potenciais Clientes",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2024-11-11",
    "ano": "2024",
    "status": "Concluído",
    "tags": [
      "Prospeccao",
      "Clientes",
      "B2B",
      "Tecnologia",
      "ICP",
      "2024"
    ],
    "descricao": "Projeto de analise e mapeamento de potenciais clientes para a E-Machine, empresa de tecnologia e automacao industrial. A PROJEP realizou segmentacao do mercado-alvo B2B, definicao do Perfil Ideal de Cliente (ICP), levantamento de leads qualificados, scoring de potenciais clientes por atratividade e fit, e entrega de lista priorizada com estrategia de abordagem. O projeto abriu novo tipo de servico para o portfolio da PROJEP.",
    "pontosFortes": [
      "ICP (Ideal Customer Profile) bem definido foi o principal entregavel e muito valorizado pelo cliente",
      "Lista de leads qualificados com scoring foi imediatamente usada pela equipe comercial da E-Machine",
      "Segmentacao de mercado revelou nicho com menor concorrencia e alto potencial nao explorado",
      "Projeto abriu novo tipo de servico no portfolio da PROJEP, Analise de Potenciais Clientes"
    ],
    "pontosFracos": [
      "Estrategia de abordagem comercial foi generica, faltaram scripts e roteiros prontos para uso imediato",
      "Analise de timing de compra dos potenciais clientes nao foi incluida",
      "Sem historico de clientes da E-Machine, o scoring foi baseado em hipoteses nao validadas"
    ],
    "problemas": [
      "Dados publicos sobre empresas industriais na regiao eram limitados, base de leads foi construida com esforco manual",
      "Os criterios de scoring foram dificeis de definir sem historico real de clientes da E-Machine"
    ],
    "errosEquipe": [
      "Estrategia de abordagem foi entregue muito generica, o cliente precisava de scripts e roteiros prontos nao apenas a lista",
      "O scoring baseado em hipoteses deveria ter sido explicitamente validado com o cliente antes da entrega",
      "Nao foram incluidos canais especificos de prospeccao com taticas por canal (LinkedIn, e-mail, telefone)"
    ],
    "errosCliente": [
      "Nao compartilhou dados de clientes anteriores que teriam permitido construir o ICP com muito mais precisao",
      "Nao tinha clareza sobre quais eram suas objecoes e diferenciais, dificultou a definicao do argumento de venda"
    ],
    "licoesAprendidas": [
      "Em projetos de prospeccao, sempre entregar scripts e roteiros de abordagem por canal, nao apenas a lista de leads",
      "ICP deve ser construido a partir de dados reais de melhores clientes existentes, sem isso e hipotese nao perfil",
      "Incluir analise de timing de compra dos leads, identificar em qual fase do ciclo de compra cada potencial cliente esta"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1qa4-PeKsEY-lnPnSsR3N4uZfzN0a1Bot",
    "createdAt": "2024-11-11T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "r01",
    "tipo": "projeto",
    "titulo": "EXP Producoes — Mapeamento de Processos",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2025-03-17",
    "ano": "2025",
    "status": "Concluído",
    "tags": [
      "Mapeamento",
      "Processos",
      "Eventos",
      "Esportivo",
      "2025"
    ],
    "descricao": "Mapeamento de processos no setor esportivo da EXP Producoes (B.b.s.w Producoes e Eventos LTDA), empresa de producao de eventos localizada na R. Joao Caetano, 99, Uberaba. Contato: Felipe Garcia (felipe@exp.rec.br). O contrato previa: Mapeamento (4 semanas ate 10/02/2025), Analise (2 semanas ate 24/02), Otimizacao (2 semanas ate 10/03), Finalizacao (1 semana ate 17/03) e Pos-Venda (2 meses ate 19/05). A equipe tambem elaborou documento de organizacao para o estoque com pesquisa de prateleiras verticais para substituir paletes.",
    "pontosFortes": [
      "Projeto com empresa de eventos de Uberaba trouxe visibilidade local para a PROJEP",
      "Escopo bem definido no TAP com cronograma detalhado por etapa",
      "Entregavel diferenciado: documento de organizacao do estoque com pesquisa de aquisicao de prateleiras e links de fornecedores",
      "Setor esportivo mapeado com notacao BPMN via Bizagi",
      "Contrato assinado digitalmente via D4Sign com obrigacoes formalizadas"
    ],
    "pontosFracos": [
      "O TAP foi elaborado em dezembro de 2024 mas o projeto so iniciou em fevereiro de 2025, lacuna de quase 2 meses",
      "Empresa de eventos tem sazonalidade alta, o que pode ter dificultado a observacao dos processos em operacao real",
      "O documento de organizacao do estoque foi um entregavel nao previsto no TAP original"
    ],
    "problemas": [
      "Intervalo de quase 2 meses entre a assinatura do TAP (dezembro/2024) e o inicio do projeto (fevereiro/2025) gerou perda de contexto para a equipe",
      "Processos de eventos sao por natureza variaveis, o que dificultou a padronizacao por BPMN"
    ],
    "errosEquipe": [
      "Nao foi feita uma reuniao de reambientacao antes de retomar o projeto apos o longo intervalo desde a assinatura do TAP",
      "O entregavel do estoque foi gerado sem estar previsto no TAP, configurando expansao de escopo nao formalizada"
    ],
    "errosCliente": [
      "Assinou o TAP em dezembro mas so disponibilizou a equipe em fevereiro, causando perda de momentum e reaprendizado do contexto"
    ],
    "licoesAprendidas": [
      "Projetos com longa lacuna entre TAP e inicio devem ter reuniao de reambientacao obrigatoria antes da primeira etapa",
      "Todo entregavel gerado deve estar previsto no TAP, expansoes de escopo devem ser formalizadas mesmo quando beneficiam o cliente",
      "Em empresas de eventos, mapear processos durante um evento real e mais eficaz do que entrevistas isoladas"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1Dm0dz_FDTAOKOunlcK9oGRBRZlCS86yW",
    "createdAt": "2025-03-17T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "r02",
    "tipo": "projeto",
    "titulo": "GCO Negocios Imobiliarios — Plano de Marketing",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2025-02-26",
    "ano": "2025",
    "status": "Concluído",
    "tags": [
      "Marketing",
      "Imobiliario",
      "Cliente Oculto",
      "Posicionamento",
      "2025"
    ],
    "descricao": "Plano de marketing para a GCO Negocios Imobiliarios, empresa do setor imobiliario de Uberaba. O TAP (agosto de 2024, assinado em 2025) definiu um escopo completo de 7 etapas: Planejamento, Analise Interna (forcas e fraquezas), Analise Externa (macroambiente e concorrencia por cliente oculto), Analise de Mercado (pesquisa de consumidor), Segmentacao e Posicionamento, Estrategias de Marketing (4Ps e planos de acao) e Finalizacao. Pos-venda de 2 meses com acompanhamento de indicadores.",
    "pontosFortes": [
      "Uso da tecnica de cliente oculto na analise de concorrencia foi diferencial metodologico relevante",
      "Escopo completo com analise interna, externa, pesquisa de mercado, segmentacao e estrategias de marketing integradas",
      "Pos-venda estruturado de 2 meses com acompanhamento de indicadores e plano de acao",
      "Setor imobiliario relevante em Uberaba e projeto de alto valor percebido para o portfolio"
    ],
    "pontosFracos": [
      "O intervalo entre o TAP (agosto/2024) e a execucao (2025) pode ter desatualizado parte do contexto de mercado",
      "A analise de tendencias do mercado imobiliario nacional deveria ter sido mais aprofundada dado o dinamismo do setor",
      "Segmentacao por tipo de imovel poderia ter sido mais detalhada"
    ],
    "problemas": [
      "Longa distancia temporal entre elaboracao do TAP e inicio efetivo do projeto (agosto 2024 a fevereiro 2025)",
      "Setor imobiliario tem dados de mercado local escassos e pouco padronizados"
    ],
    "errosEquipe": [
      "Nao foi feita atualizacao do contexto de mercado imobiliario local antes de iniciar, dado o tempo decorrido desde o TAP",
      "A tecnica de cliente oculto exige treinamento previo dos consultores, que pode nao ter sido feito formalmente"
    ],
    "errosCliente": [
      "Demorou para assinar o TAP e iniciar o projeto, gerando defasagem no levantamento de dados",
      "Mercado imobiliario tem informacoes sensíveis que podem ter sido retidas pelo cliente"
    ],
    "licoesAprendidas": [
      "Quando ha longa lacuna entre TAP e inicio, atualizar o levantamento de dados de mercado antes de comecar",
      "Tecnica de cliente oculto deve ter protocolo padrao de observacao definido antes da visita, nao ser improvisada em campo",
      "Plano de marketing para imobiliarias deve incluir analise de tendencias nacionais (taxa Selic, financiamentos, FIIs)"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1Rd-CcjrWw71ixkviHSX4fqubeUdsP_pM",
    "createdAt": "2025-02-26T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "r03",
    "tipo": "projeto",
    "titulo": "Lua de Mel (Parte 2) — Continuidade",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2025-03-24",
    "ano": "2025",
    "status": "Concluído",
    "tags": [
      "Marketing",
      "Confeitaria",
      "Reincidencia",
      "Cliente Fidelizado",
      "2025"
    ],
    "descricao": "Segunda fase do projeto com a Lua de Mel, confeitaria artesanal de Uberaba que ja havia sido cliente da PROJEP em 2024. A pasta foi criada em marco de 2025, sinalizando continuidade do relacionamento comercial. O projeto e um indicativo de que o trabalho realizado em 2024 gerou satisfacao suficiente para uma segunda contratacao, validando a qualidade do servico prestado anteriormente.",
    "pontosFortes": [
      "Segunda contratacao pelo mesmo cliente e prova concreta de satisfacao com o trabalho de 2024",
      "Relacionamento comercial ja estabelecido reduziu tempo de ambientacao e alinhamento inicial",
      "Cliente ja conhecia a metodologia PROJEP, facilitando a comunicacao e as validacoes",
      "Projeto de reincidencia fortalece o portfolio e demonstra capacidade de geracao de valor de longo prazo"
    ],
    "pontosFracos": [
      "Sem informacoes detalhadas do escopo desta segunda fase disponíveis na pasta",
      "O risco de comodidade com cliente conhecido pode reduzir o rigor no registro de ocorrencias e problemas",
      "Sem TAP identificado nesta pasta especifica"
    ],
    "problemas": [
      "Ausencia de documentacao gerencial detalhada nesta pasta de projeto"
    ],
    "errosEquipe": [
      "Ausencia de documentos gerenciais na pasta sugere possivel informalidade no gerenciamento desta segunda fase",
      "O registro de problemas e ocorrencias pode ter sido negligenciado pela familiaridade com o cliente"
    ],
    "errosCliente": [
      "Nao identificados com as informacoes disponíveis"
    ],
    "licoesAprendidas": [
      "Projetos de reincidencia devem ter o mesmo rigor documental que projetos novos, a familiaridade nao justifica informalidade",
      "Documentar sempre o que motivou a segunda contratacao como case de sucesso para o comercial da PROJEP",
      "Fidelizacao de clientes deve ser medida e celebrada como indicador de qualidade do setor de projetos"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/19DHU2KiZxuMkr2t0nbMOeCSVLGoC1uEq",
    "createdAt": "2025-03-24T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "r04",
    "tipo": "projeto",
    "titulo": "Marie Steak Burguer — Mapeamento de Processos",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2025-04-07",
    "ano": "2025",
    "status": "Concluído",
    "tags": [
      "Mapeamento",
      "Processos",
      "Alimentacao",
      "Ribeirao Preto",
      "2025"
    ],
    "descricao": "Mapeamento de processos para a Marie Steak e Burguer, empresa de gastronomia localizada em Ribeirao Preto-SP. TAP assinado em abril de 2025. Escopo: Planejamento e Identificacao, Mapeamento (BPMN via Bizagi), Analise, Otimizacao e Finalizacao. O projeto foi mais um da serie de clientes de Ribeirao Preto, demandando logistica de visitas presenciais para levantamento de dados.",
    "pontosFortes": [
      "Projeto com cliente fora de Uberaba amplia o alcance geografico da PROJEP e fortalece o portfolio",
      "Metodologia madura de mapeamento com BPMN bem consolidada pela equipe em projetos anteriores",
      "TAP bem estruturado com escopo detalhado e entregaveis claros por etapa",
      "Setor de gastronomia com processos ricos e dinamicos para mapear"
    ],
    "pontosFracos": [
      "Distancia Uberaba-Ribeirao Preto (cerca de 150km) aumenta custo e tempo de visitas presenciais",
      "Processos de restaurante sao altamente dependentes do horario de funcionamento, dificultando observacao em diferentes momentos",
      "Sem registro de problemas identificados na pasta para analise"
    ],
    "problemas": [
      "Logistica de visitas presenciais em Ribeirao Preto requer planejamento antecipado de transporte e hospedagem",
      "Processos de restaurante sao diferentes nos horarios de almoco, jantar e fora de pico"
    ],
    "errosEquipe": [
      "Custos de deslocamento para Ribeirao Preto deveriam estar previstos explicitamente no orcamento do projeto",
      "Mapear apenas o horario de pico do restaurante seria insuficiente, necessario observar operacao em diferentes momentos"
    ],
    "errosCliente": [
      "Nao identificados com as informacoes disponíveis"
    ],
    "licoesAprendidas": [
      "Em projetos com clientes fora de Uberaba, prever explicitamente custos de deslocamento no contrato e orcamento",
      "Para restaurantes e empresas de alimentacao, sempre mapear pelo menos dois turnos diferentes, pico e vale",
      "Clientes de Ribeirao Preto e regiao geram visibilidade para a PROJEP em outras praças"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1olfU-T5iJ-2Bu9h4YIDC4JIJBoDjo38_",
    "createdAt": "2025-04-07T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "r05",
    "tipo": "projeto",
    "titulo": "Atletica Engenharia — Plano Estrategico",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2025-04-09",
    "ano": "2025",
    "status": "Concluído",
    "tags": [
      "Plano Estrategico",
      "Atletica",
      "Universidade",
      "MEJ",
      "2025"
    ],
    "descricao": "Elaboracao de plano estrategico para a Atletica Engenharia, entidade estudantil ligada ao curso de Engenharia da UFTM ou instituicao similar. Projeto diferenciado no portfolio da PROJEP por ser para uma entidade estudantil, nao uma empresa convencional. O escopo envolvia definicao de diretrizes estrategicas, metas, objetivos e planos de acao para a gestao da Atletica.",
    "pontosFortes": [
      "Projeto diferenciado que mostra capacidade da PROJEP de atender diferentes tipos de organizacao",
      "Proximidade com o ambiente universitario facilita o relacionamento e o alinhamento de expectativas",
      "Oportunidade de aplicar ferramentas de planejamento estrategico em um contexto academico",
      "Visibilidade interna na UFTM fortalece a marca da PROJEP junto a potenciais futuros membros"
    ],
    "pontosFracos": [
      "Atleticas tem alta rotatividade de gestao (mandatos curtos), dificultando a sustentabilidade do planejamento",
      "Recursos financeiros limitados podem restringir a implementacao das estrategias propostas",
      "A informalidade da gestao de atleticas pode dificultar a coleta de dados historicos"
    ],
    "problemas": [
      "Alta rotatividade dos gestores da atletica pode ter comprometido o alinhamento de expectativas ao longo do projeto",
      "Dados historicos de desempenho e financeiros podem ser escassos ou pouco organizados"
    ],
    "errosEquipe": [
      "O plano estrategico para atleticas deve considerar o ciclo de mandato curto como fator central de toda a estrategia",
      "Metas de longo prazo em um contexto de mandato de 1 ano precisam ser tratadas de forma diferente das empresas convencionais"
    ],
    "errosCliente": [
      "Nao identificados com as informacoes disponíveis"
    ],
    "licoesAprendidas": [
      "Para entidades com mandatos curtos (atleticas, CAs, associacoes), o planejamento estrategico deve ser desenhado para ser transferivel e nao depender das pessoas atuais",
      "Incluir capitulo especifico de transicao de gestao em planos estrategicos de entidades estudantis",
      "Projetos para entidades estudantis sao excelentes para treinar membros mais novos da PROJEP com menor risco"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1VKR8Fpqbgsik2M0bdacIHvRl5zWd8Y-r",
    "createdAt": "2025-04-09T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "r06",
    "tipo": "projeto",
    "titulo": "Trebeschi — Mapeamento de Processos",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2025-08-05",
    "ano": "2025",
    "status": "Concluído",
    "tags": [
      "Mapeamento",
      "Processos",
      "Logistica",
      "Araguari",
      "2025"
    ],
    "descricao": "Mapeamento de processos no setor de logistica da Trebeschi, empresa situada em Araguari-MG. TAP elaborado em dezembro de 2024. O projeto incluiu POPs dos processos internos da organizacao. A pasta Documentos Gerenciais continha o TAP da Trebeschi, indicando que o projeto foi executado com estrutura gerencial completa.",
    "pontosFortes": [
      "Projeto em Araguari amplia o alcance geografico da PROJEP no Triangulo Mineiro",
      "Escopo incluia elaboracao de POPs alem do mapeamento, valor agregado significativo para o cliente",
      "TAP elaborado com antecedencia demonstra planejamento da diretoria de projetos",
      "Setor de logistica tem processos altamente mapeaveis e com potencial de ganho de eficiencia"
    ],
    "pontosFracos": [
      "Distancia Uberaba-Araguari (cerca de 60km) ainda demanda planejamento de visitas presenciais",
      "Logistica tem processos que variam muito conforme o volume de demanda, dificultando a padronizacao"
    ],
    "problemas": [
      "Sem registro de problemas formais identificados na pasta"
    ],
    "errosEquipe": [
      "TAP elaborado em dezembro de 2024 com projeto executado em 2025, verificar se houve reuniao de reambientacao",
      "Logistica operada em Araguari pode ter restricoes de acesso fisico que deveriam ser mapeadas no TAP"
    ],
    "errosCliente": [
      "Nao identificados com as informacoes disponíveis"
    ],
    "licoesAprendidas": [
      "Para projetos em cidades vizinhas, agrupar visitas presenciais para otimizar deslocamentos",
      "POPs devem ser elaborados em conjunto com os operadores dos processos, nao apenas com os gestores",
      "Processos de logistica devem ser mapeados em dia de alto volume e em dia normal para capturar a variabilidade real"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1H3b0GV-K6A5LLLRbDjbMSptUOyRaBobo",
    "createdAt": "2025-08-05T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "r07",
    "tipo": "projeto",
    "titulo": "Camargo Emporio de Minas — Gestao Financeira",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2025-05-21",
    "ano": "2025",
    "status": "Concluído",
    "tags": [
      "Financeiro",
      "Gestao",
      "Fluxo de Caixa",
      "Precificacao",
      "Capacitacao",
      "2025"
    ],
    "descricao": "Projeto de diagnostico e estruturacao da gestao financeira do Camargo Emporio de Minas. TAP assinado em maio de 2025. Escopo de 6 etapas: Planejamento (1 semana), Levantamento de dados contabeis e financeiros (2 semanas), Analise de dados e diagnostico financeiro (2 semanas), Desenvolvimento de planilha automatizada de controle financeiro e precificacao (4 semanas), Capacitacao com manual pratico e video explicativo (2 semanas) e Pos-venda de 2 meses. Escopo mais completo que projetos financeiros anteriores por incluir capacitacao com video.",
    "pontosFortes": [
      "Escopo mais completo que projetos financeiros anteriores, com capacitacao formal incluindo video explicativo",
      "Manual pratico de uso das ferramentas garante autonomia do cliente apos o encerramento",
      "Pos-venda estruturado de 2 meses com acompanhamento de implementacao",
      "Planilha de precificacao entregue junto ao controle financeiro resolve duas dores simultaneamente",
      "A capacitacao com video e diferencial que aumenta muito a taxa de adocao das ferramentas pelo cliente"
    ],
    "pontosFracos": [
      "Producao de video explicativo exige habilidades de edicao que podem nao estar disponíveis na equipe",
      "O Levantamento de dados contabeis depende do contador do cliente, terceiro que pode atrasar o processo",
      "4 semanas para desenvolvimento da planilha e prazo apertado para uma planilha verdadeiramente automatizada"
    ],
    "problemas": [
      "Levantamento financeiro depende de disponibilidade do contador, que e terceiro em relacao ao projeto",
      "Dados contabeis e financeiros da empresa podem estar desorganizados ou misturados com financas pessoais"
    ],
    "errosEquipe": [
      "Producao de video explicativo deve ser planejada com antecedencia, definindo quem grava, edita e qual ferramenta sera usada",
      "O prazo de 4 semanas para a planilha deve considerar rodadas de revisao com o cliente, nao apenas o desenvolvimento"
    ],
    "errosCliente": [
      "Acesso ao contador e a dados contabeis deve ser providenciado antes do inicio do Levantamento, nao durante"
    ],
    "licoesAprendidas": [
      "Capacitacao com video e uma entrega poderosa e deve ser padronizada em projetos financeiros, definir um template e processo interno de producao",
      "Incluir o contador como parte interessada no TAP quando o levantamento depende de dados por ele organizados",
      "Planilhas automatizadas devem ter pelo menos 2 rodadas de feedback do cliente antes da entrega final"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1SBak7yTVG3V4hil3TE71XdaL4xmWiLex",
    "createdAt": "2025-05-21T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "r08",
    "tipo": "projeto",
    "titulo": "Clinica LGBT+ — Plano de Marketing",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2025-07-02",
    "ano": "2025",
    "status": "Concluído",
    "tags": [
      "Marketing",
      "Saude",
      "LGBT",
      "Inclusao",
      "Posicionamento",
      "2025"
    ],
    "descricao": "Plano de marketing para Clinica LGBT+, empresa de saude com foco no atendimento da populacao LGBTQIA+ em Uberaba. Projeto diferenciado no portfolio da PROJEP por atender um nicho altamente especifico com sensibilidades unicas de comunicacao e posicionamento. O projeto exigiu da equipe um entendimento profundo das particularidades do publico-alvo e das melhores praticas de marketing inclusivo.",
    "pontosFortes": [
      "Projeto pioneiro no portfolio da PROJEP com cliente do setor de saude especializado em LGBTQIA+",
      "Exigiu pesquisa e sensibilidade adicional da equipe sobre marketing inclusivo e comunicacao afirmativa",
      "Posicionamento de nicho claro facilita a diferenciacaoe estrategia de marketing",
      "Projeto de alto impacto social que reforca os valores da PROJEP como EJ comprometida com inclusao"
    ],
    "pontosFracos": [
      "Equipe pode nao ter tido formacao previa em comunicacao inclusiva e marketing para saude LGBTQIA+",
      "Dados de mercado sobre o segmento de saude LGBTQIA+ sao escassos no Brasil",
      "Regulamentacoes do CFM sobre publicidade medica impuseram restricoes importantes as estrategias propostas"
    ],
    "problemas": [
      "Restricoes do Codigo de Etica Medica (CFM) sobre publicidade de servicos de saude limitaram varias estrategias de marketing digital",
      "Dados de tamanho e perfil do mercado LGBTQIA+ em Uberaba eram praticamente inexistentes"
    ],
    "errosEquipe": [
      "A equipe deveria ter pesquisado as restricoes do CFM sobre publicidade medica ANTES de propor estrategias",
      "Marketing para saude tem regulamentacao especifica que exige pesquisa regulatoria preliminar"
    ],
    "errosCliente": [
      "Nao alertou sobre as restricoes do CFM no briefing inicial"
    ],
    "licoesAprendidas": [
      "Em projetos para clinicas e servicos de saude, pesquisar as restricoes do CFM e CRM sobre publicidade medica antes de qualquer proposta",
      "Marketing inclusivo para publico LGBTQIA+ requer pesquisa e cuidado com linguagem, nao e apenas colocar a bandeira arco-iris",
      "Projetos de nicho exigem pesquisa preliminar do setor mais aprofundada do que projetos convencionais"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1qEwnb8MGgrGyOM219aZJTU-XhOTnapp-",
    "createdAt": "2025-07-02T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "r09",
    "tipo": "projeto",
    "titulo": "Pizzaria e Choperia Eron — Mapeamento de Processos",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2025-07-30",
    "ano": "2025",
    "status": "Concluído",
    "tags": [
      "Mapeamento",
      "Processos",
      "Alimentacao",
      "Sao Simao",
      "2025"
    ],
    "descricao": "Mapeamento de processos para a Pizzaria e Choperia Eron, empresa de gastronomia localizada em Sao Simao (proximo a Ribeirao Preto). TAP assinado em julho de 2025. Escopo padrao de mapeamento: Planejamento e Identificacao, Mapeamento BPMN via Bizagi, Analise, Otimizacao e Finalizacao. Pos-venda de 2 meses. Mais um projeto com cliente fora de Uberaba, evidenciando a expansao geografica da PROJEP.",
    "pontosFortes": [
      "Projeto em Sao Simao amplia ainda mais o alcance geografico da PROJEP alem do Triangulo Mineiro",
      "TAP bem estruturado com escopo e entregaveis claros",
      "Setor de gastronomia tem processos ricos e impactantes para mapeamento",
      "Expericiencia acumulada em projetos de restaurantes anteriores (Transamerica, Annalu, BOBs, Marie Steak) da maturidade a equipe"
    ],
    "pontosFracos": [
      "Sao Simao e ainda mais distante de Uberaba do que Ribeirao Preto, elevando os custos logisticos",
      "Pizzaria com choperia tem operacao complexa em dois frentes (cozinha e bar) que dobra o escopo real",
      "Alta rotatividade de funcionarios em pizzarias dificulta o mapeamento de processos padronizados"
    ],
    "problemas": [
      "Distancia geografica elevada aumenta os riscos de atrasos em caso de necessidade de visitas adicionais nao planejadas",
      "Operacao simultanea de pizzaria e choperia gera dois universos de processos diferentes para mapear"
    ],
    "errosEquipe": [
      "O escopo do TAP deve especificar claramente se o mapeamento cobre apenas a pizzaria, apenas a choperia ou ambas",
      "Custos de deslocamento para Sao Simao deveriam estar explicitamente contemplados no orcamento"
    ],
    "errosCliente": [
      "Nao identificados com as informacoes disponíveis"
    ],
    "licoesAprendidas": [
      "Para clientes com operacoes compostas (pizzaria+bar, loja+deposito), o TAP deve delimitar explicitamente quais processos estao no escopo",
      "Projetos em cidades mais distantes devem prever margem de segurança no cronograma para visitas presenciais",
      "Experiencia acumulada em clientes do mesmo setor deve ser documentada e compartilhada com a equipe do novo projeto"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1KgGGzT4aTqQcu8W9nGhAll0Cp4rUxbph",
    "createdAt": "2025-07-30T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "r10",
    "tipo": "projeto",
    "titulo": "Labareda Agropecuaria — Mapeamento de Processos",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2025-07-23",
    "ano": "2025",
    "status": "Concluído",
    "tags": [
      "Mapeamento",
      "Processos",
      "Agronegocio",
      "Sankhya",
      "Cafe",
      "2025"
    ],
    "descricao": "Mapeamento de processos no setor de Cafe e Varejo da Labareda Agropecuaria, empresa localizada em Cristais Paulista-SP e Franca-SP. TAP de julho de 2025. Projeto diferenciado: alem do mapeamento BPMN, incluiu uma etapa exclusiva de Entendimento do sistema Sankhya (ERP) para compreender modulos, funcionalidades e pontos de customizacao. Primeiro projeto da PROJEP com analise de sistema ERP como parte do escopo.",
    "pontosFortes": [
      "Primeiro projeto com analise de sistema ERP (Sankhya) no escopo, habilidade diferenciada no portfolio",
      "Cliente em duas cidades (Cristais Paulista e Franca) amplia o alcance geografico da PROJEP para o interior paulista",
      "Setor de agronegocio de cafe e um dos mais relevantes economicamente em Minas e Sao Paulo",
      "Escopo inovador com etapa exclusiva de analise do sistema gerencial do cliente"
    ],
    "pontosFracos": [
      "Entender um ERP corporativo como o Sankhya exige conhecimento tecnico que a equipe pode nao ter tido previamente",
      "Duas unidades em cidades diferentes (Cristais Paulista e Franca) duplicam o esforco logistico",
      "Sem acesso a dados do Sankhya, a analise de integracao pode ter ficado superficial"
    ],
    "problemas": [
      "A equipe precisou estudar o Sankhya durante o proprio projeto, consumindo tempo que seria do mapeamento",
      "Logistica com duas cidades e mais complexa e cara do que um unico site"
    ],
    "errosEquipe": [
      "Nao foi feito estudo previo do Sankhya antes do inicio do projeto, a curva de aprendizado aconteceu durante a execucao",
      "O cronograma deveria ter sido calibrado para absorver o tempo de ambientacao com o ERP"
    ],
    "errosCliente": [
      "Nao disponibilizou acesso de teste ao Sankhya previamente ao inicio, dificultando a preparacao da equipe"
    ],
    "licoesAprendidas": [
      "Quando o projeto envolve um ERP do cliente, solicitar acesso e documentacao do sistema com 2 semanas de antecedencia",
      "Analise de ERP requer pelo menos um membro da equipe com conhecimento basico em sistemas de gestao empresarial",
      "Projetos em agronegocio abrem um mercado novo e importante para a PROJEP, vale desenvolver expertise especifica no setor"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1LfpXam_Bpxd1QsN5Lvm70oLN7Jk_4neZ",
    "createdAt": "2025-07-23T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "r11",
    "tipo": "projeto",
    "titulo": "Gi Carvalho — Mapeamento de Processos",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2025-10-19",
    "ano": "2025",
    "status": "Concluído",
    "tags": [
      "Mapeamento",
      "Processos",
      "Uberaba",
      "2025"
    ],
    "descricao": "Mapeamento de processos para a Gi Carvalho, empresa localizada em Uberaba na Avenida da Saudade, 599. TAP assinado em julho de 2025. O projeto seguiu a metodologia padrao de Mapeamento da PROJEP: Planejamento e Identificacao, Mapeamento BPMN, Analise, Otimizacao e Finalizacao. O documento de Problemas Identificados foi criado, indicando que houve registro formal de ocorrencias durante o projeto.",
    "pontosFortes": [
      "Cliente em Uberaba facilita logistica de visitas presenciais sem custos adicionais de deslocamento",
      "TAP bem elaborado com escopo e entregaveis claros por etapa",
      "Registro formal de problemas identificados demonstra maturidade no gerenciamento do projeto",
      "Metodologia madura aplicada com consistencia"
    ],
    "pontosFracos": [
      "O documento de problemas estava em branco nas versoes disponiveis, nao sendo possivel extrair as ocorrencias reais",
      "Sem acesso ao conteudo dos problemas identificados, a licao aprendida fica limitada"
    ],
    "problemas": [
      "Documento de Problemas Identificados criado mas conteudo nao foi acessado pela equipe de gestao do conhecimento"
    ],
    "errosEquipe": [
      "O documento de problemas foi criado mas nao preenchido com as ocorrencias reais, ou o preenchimento nao esta acessivel",
      "Problemas identificados devem ser registrados em tempo real, nao ao final do projeto quando a memoria ja esmaeceu"
    ],
    "errosCliente": [
      "Nao identificados com as informacoes disponiveis"
    ],
    "licoesAprendidas": [
      "O documento de Problemas Identificados deve ser preenchido ao longo do projeto, nao deixado para o final",
      "A Diretoria de Projetos deve verificar periodicamente se os GPs estao registrando ocorrencias durante a execucao",
      "Versionar os documentos de problemas garante que o historico nao seja perdido"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1zSKfoDcQtmlD-ChFgb4Z8MhtYHlwGxkB",
    "createdAt": "2025-10-19T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "r12",
    "tipo": "projeto",
    "titulo": "Metalizza — Mapeamento de Processos",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2025-09-08",
    "ano": "2025",
    "status": "Concluído",
    "tags": [
      "Mapeamento",
      "Processos",
      "Industria",
      "Fabricacao",
      "Uberaba",
      "2025"
    ],
    "descricao": "Mapeamento de processos para a Metalizza Engenharia e Fabricacao LTDA, empresa industrial de Uberaba. TAP de setembro de 2025. Escopo incluia alem do mapeamento BPMN a elaboracao de POPs dos processos internos. A Metalizza e empresa do setor de fabricacao metalica, exigindo da equipe ambientacao ao ambiente industrial e terminologia tecnica especifica.",
    "pontosFortes": [
      "Projeto em empresa industrial de Uberaba com POPs como entregavel adicional ao mapeamento",
      "Setor de fabricacao tem processos altamente sequenciais e bem definidos, favoraveis ao BPMN",
      "TAP bem elaborado com escopo e entregaveis claros",
      "Experiencia anterior com a GMAD (2023) e Labareda deu a equipe base para projetos industriais"
    ],
    "pontosFracos": [
      "Ambiente industrial requer EPIs e protocolos de seguranca que a equipe pode nao estar habituada a seguir",
      "Terminologia tecnica da fabricacao metalica exige periodo de ambientacao da equipe",
      "Processos industriais frequentemente rodam em turnos, necessitando de observacao em mais de um turno"
    ],
    "problemas": [
      "Sem registro de problemas formais identificados nas pastas pesquisadas"
    ],
    "errosEquipe": [
      "Nao foi verificado se a equipe precisaria de EPIs para entrar no chao de fabrica, risco de imprevistos no campo",
      "A terminologia tecnica da metalurgia deveria ter sido estudada previamente por todos os membros"
    ],
    "errosCliente": [
      "Nao identificados com as informacoes disponiveis"
    ],
    "licoesAprendidas": [
      "Em projetos industriais, verificar requisitos de seguranca (EPIs, areas restritas) antes da primeira visita ao cliente",
      "Elaborar glossario tecnico do setor com o cliente na primeira semana, essencial para entrevistas com operadores",
      "POPs em industrias devem ser validados pelos proprios operadores antes da entrega ao cliente"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1UAkhA1QJqqi6qA7bVyrJ4aBG8Kdxm8Gb",
    "createdAt": "2025-09-08T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "r13",
    "tipo": "projeto",
    "titulo": "Agua Mineral Talisma — Plano de Marketing",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2025-10-25",
    "ano": "2025",
    "status": "Concluído",
    "tags": [
      "Marketing",
      "Agua Mineral",
      "Bebidas",
      "Posicionamento",
      "2025"
    ],
    "descricao": "Plano de marketing para a Agua Mineral Talisma, empresa do setor de bebidas. TAP de outubro de 2025. Escopo completo de Plano de Marketing com 7 etapas: Planejamento, Analise Interna, Analise Externa (macroambiente e cliente oculto), Analise de Mercado (pesquisa), Segmentacao e Posicionamento, Estrategias de Marketing (4Ps e planos de acao) e Finalizacao, com pos-venda de 2 meses.",
    "pontosFortes": [
      "Escopo de plano de marketing mais completo e maduro da PROJEP, com 7 etapas estruturadas",
      "Uso de cliente oculto na analise de concorrencia e diferencial metodologico valorizado",
      "Pos-venda de 2 meses com acompanhamento de indicadores e plano de acao",
      "Setor de aguas minerais e bebidas tem concorrencia intensa, tornando o posicionamento estrategico mais relevante"
    ],
    "pontosFracos": [
      "Agua mineral e um produto commoditizado, dificultando a diferenciacaoe posicionamento premium",
      "Dados do mercado de aguas minerais no Brasil sao dominados pelos grandes players (Bonafont, Crystal, Indaia), o que pode ter limitado a analise local",
      "A analise de concorrencia por cliente oculto em bebidas e menos direta do que em servicos ou varejo"
    ],
    "problemas": [
      "Produto commoditizado (agua mineral) dificulta a construcao de argumentos de diferenciacaoe posicionamento convincentes",
      "Dados de mercado local de agua mineral sao escassos e pouco acessiveis"
    ],
    "errosEquipe": [
      "A estrategia de diferenciacaopara um produto commoditizado precisa ir alem do preco e qualidade, explorar historia, origem e sustentabilidade",
      "Cliente oculto para bebidas deve ser adaptado para avaliar pontos de venda e nao apenas o produto"
    ],
    "errosCliente": [
      "Nao identificados com as informacoes disponiveis"
    ],
    "licoesAprendidas": [
      "Para produtos commoditizados, o plano de marketing deve explorar narrativa de marca, origem e sustentabilidade como diferenciais",
      "Analise de concorrencia para bebidas deve incluir presenca nos pontos de venda (PDV), nao apenas publicidade",
      "O cliente oculto em bebidas deve visitar os pontos de distribuicao do produto, nao apenas dos concorrentes diretos"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1wz1hltc87osUGlpfmYl6JooZEekhY3mA",
    "createdAt": "2025-10-25T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "r14",
    "tipo": "projeto",
    "titulo": "Vanesa Sorveteria — Plano de Marketing",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2025-11-03",
    "ano": "2025",
    "status": "Concluído",
    "tags": [
      "Marketing",
      "Sorveteria",
      "Alimentacao",
      "Posicionamento",
      "2025"
    ],
    "descricao": "Plano de marketing para a Vanesa Sorveteria. TAP de novembro de 2025. Escopo identico ao da Agua Mineral Talisma com 7 etapas: Planejamento, Analise Interna, Analise Externa (com cliente oculto na concorrencia), Analise de Mercado, Segmentacao e Posicionamento, Estrategias de Marketing e Finalizacao, alem de pos-venda de 2 meses. Dois projetos de plano de marketing simultâneos ou proximos no 2025.2 demonstram amadurecimento deste servico.",
    "pontosFortes": [
      "Escopo maduro de 7 etapas padronizado e bem executado pela equipe",
      "Tecnica de cliente oculto aplicada na analise de concorrencia direta em sorveteria e muito rica em insights",
      "Setor de sorveterias em Uberaba e competitivo, tornando o posicionamento estrategico mais necessario e relevante",
      "Dois projetos de marketing no mesmo semestre consolidam expertise da equipe neste servico"
    ],
    "pontosFracos": [
      "Sazonalidade do setor de sorveterias (muito maior no verao) pode ter distorcido dados de pesquisa se coletados no outono",
      "Analise de delivery nao pode ser negligenciada para sorveteria moderna",
      "Sem dados de faturamento do cliente, as projecoes de ROI das acoes ficam fragilizadas"
    ],
    "problemas": [
      "Sazonalidade do produto pode ter impactado a coleta de dados se feita fora do pico de consumo",
      "Sem faturamento historico do cliente, difícil estimar retorno das acoes de marketing"
    ],
    "errosEquipe": [
      "A sazonalidade das sorveterias deveria ter sido considerada no planejamento da coleta de dados",
      "Delivery e canal critico para sorveteria atual, nao pode ser secundario no plano de marketing"
    ],
    "errosCliente": [
      "Nao disponibilizou dados de faturamento que tornaria as projecoes mais precisas"
    ],
    "licoesAprendidas": [
      "Para negocios com alta sazonalidade, coletar dados em pelo menos dois momentos distintos do ano (pico e baixa)",
      "Delivery deve ser canal prioritario em planos de marketing para alimentacao em Uberaba, a cultura de pedido pelo app e forte",
      "Padronizacao do escopo de Plano de Marketing em 7 etapas e um ativo da PROJEP, deve ser documentado como servico padrao"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/15EvZYh1wvglvwEBUNJ7x9ueVyHlkjUJE",
    "createdAt": "2025-11-03T00:00:00Z",
    "updatedAt": null
  },
  {
    "id": "r15",
    "tipo": "projeto",
    "titulo": "TDS Construcao — Mapeamento de Processos",
    "responsavel": "Equipe PROJEP",
    "responsavelId": null,
    "data": "2025-10-28",
    "ano": "2025",
    "status": "Concluído",
    "tags": [
      "Mapeamento",
      "Processos",
      "Construcao Civil",
      "POPs",
      "Uberaba",
      "2025"
    ],
    "descricao": "Mapeamento de processos para a TDS Construcao, empresa do setor de construcao civil localizada em Uberaba-MG. TAP de setembro de 2025. Escopo incluia alem do mapeamento BPMN a elaboracao de POPs. O setor de construcao civil e um dos mais desafiadores para mapeamento por ter processos altamente variaveis por obra, dependentes de subcontratados e sujeitos a condicoes externas (clima, fornecimento).",
    "pontosFortes": [
      "Setor de construcao civil com alto potencial de ganho com padronizacao de processos",
      "Escopo com POPs agrega valor significativo ao cliente alem do mapeamento",
      "TAP elaborado com estrutura padrao PROJEP e entregaveis bem definidos",
      "Uberaba tem mercado de construcao civil ativo, cliente estrategico para o portfolio"
    ],
    "pontosFracos": [
      "Construcao civil tem processos altamente dependentes de variaveis externas (clima, subempreiteiros, fiscalizacao)",
      "Cada obra e unica, dificultando a criacao de POPs verdadeiramente genericos e reutilizaveis",
      "A alta rotatividade de mao de obra no setor de construcao dificulta a padronizacao e adesao aos POPs"
    ],
    "problemas": [
      "Processos de obra variam significativamente entre projetos diferentes, questionando a aplicabilidade dos mapas",
      "Alta rotatividade de funcionarios e subcontratados torna a implementacao dos POPs muito desafiadora"
    ],
    "errosEquipe": [
      "O escopo deve delimitar claramente quais processos serao mapeados (administrativos, operacionais de obra, ou ambos)",
      "POPs para construcao civil precisam ser adaptaveis por tipo de obra, nao genericos"
    ],
    "errosCliente": [
      "Nao identificados com as informacoes disponiveis"
    ],
    "licoesAprendidas": [
      "Para construtoras, mapear processos administrativos (orcamento, contrato, medicao, faturamento) tende a ser mais impactante e padronizavel do que processos de execucao de obra",
      "POPs em construcao civil devem ser modulares e adaptaveis por tipo de obra, nao um unico documento generico",
      "Incluir subcontratados como parte interessada no TAP de projetos de construtoras"
    ],
    "cargaHoraria": "",
    "link": "https://drive.google.com/drive/folders/1wCLFBR3UaBuVGwu9D53UCjyQ07JP0sGM",
    "createdAt": "2025-10-28T00:00:00Z",
    "updatedAt": null
  }
]

export const PROJECT_TAG_OPTIONS = [
  "2024",
  "2025",
  "5S",
  "Agronegocio",
  "Agua Mineral",
  "Alimentacao",
  "Araguari",
  "Artesanato",
  "Atacado",
  "Atletica",
  "Auditoria",
  "Automotivo",
  "B2B",
  "Bebidas",
  "BPMN",
  "Branding",
  "Cafe",
  "Calcados",
  "Capacitacao",
  "Certificação",
  "Cliente Fidelizado",
  "Cliente Oculto",
  "Clientes",
  "Compras",
  "Comunicação Integrada",
  "Confeitaria",
  "Construcao Civil",
  "Consultoria",
  "Controle de Estoque",
  "Custeio",
  "Delivery",
  "Digital",
  "DRE",
  "E-commerce",
  "Empresa Junior",
  "Energia Solar",
  "Entretenimento",
  "Esportivo",
  "Estratégia",
  "Eventos",
  "Fabricacao",
  "Fast Food",
  "Financeiro",
  "Fluxo de Caixa",
  "Fornecedores",
  "Franquia",
  "Gestao",
  "Grande Empresa",
  "ICP",
  "Imobiliario",
  "Inclusao",
  "Industria",
  "Instagram",
  "Inventario",
  "ISO 9001",
  "Jogos",
  "LGBT",
  "Logistica",
  "Mapeamento",
  "Marketing",
  "Marmore",
  "MEJ",
  "Metodologia",
  "Moda",
  "Mudança",
  "Negociação",
  "Normas",
  "Operações",
  "Organização",
  "Parcerias B2B",
  "Pesquisa de Mercado",
  "Pisos",
  "Plano de Negocios",
  "Plano Estrategico",
  "POPs",
  "Posicionamento",
  "Precificacao",
  "Processos",
  "Produção",
  "Prospeccao",
  "Qualidade",
  "Qualitativo",
  "Redes Sociais",
  "Reincidencia",
  "Restaurante",
  "Retenção",
  "Ribeirao Preto",
  "Sankhya",
  "Sao Simao",
  "Saude",
  "Shopping",
  "Sorveteria",
  "Startup",
  "Streetwear",
  "Supply Chain",
  "Tecnologia",
  "Telecomunicações",
  "Terceirização",
  "Textil",
  "Turismo",
  "Uberaba",
  "Universidade",
  "Varejo"
]

export const INITIAL_PROJETOS = {
  baseConhecimento: BASE_CONHECIMENTO_PROJETOS,
  projetos: [
    {
      id: 1,
      contractId: 1,
      nome: 'Consultoria TechStart',
      clienteId: 'nexus-tech',
      clienteNome: 'Nexus Tech',
      responsavelId: 2,
      membros: [2, 5],
      status: 'ativo',
      dataInicio: '2026-06-09',
      dataFim: '2026-09-09',
      valor: 45000,
      descricao: 'Consultoria em processos organizacionais e reestruturação de fluxos internos.',
      tarefas: [
        { id: 1, titulo: 'Diagnóstico inicial',           responsavelId: 2, status: 'concluida', prazo: '2026-06-20' },
        { id: 2, titulo: 'Mapeamento de processos',       responsavelId: 5, status: 'andamento', prazo: '2026-07-15' },
        { id: 3, titulo: 'Entrega do relatório final',    responsavelId: 2, status: 'pendente',  prazo: '2026-09-01' },
      ],
    },
    {
      id: 2,
      contractId: 2,
      nome: 'Transformação Digital',
      clienteId: 'omega-digital',
      clienteNome: 'Omega Digital',
      responsavelId: 1,
      membros: [1, 5],
      status: 'ativo',
      dataInicio: '2026-06-02',
      dataFim: '2026-08-02',
      valor: 28000,
      descricao: 'Transformação digital e mapeamento de processos para modernização do negócio.',
      tarefas: [
        { id: 4, titulo: 'Levantamento de sistemas atuais', responsavelId: 5, status: 'concluida', prazo: '2026-06-10' },
        { id: 5, titulo: 'Proposta de arquitetura digital',  responsavelId: 1, status: 'concluida', prazo: '2026-06-25' },
        { id: 6, titulo: 'Implementação fase 1',             responsavelId: 5, status: 'andamento', prazo: '2026-07-20' },
        { id: 7, titulo: 'Documentação e treinamento',       responsavelId: 1, status: 'pendente',  prazo: '2026-08-01' },
      ],
    },
    {
      id: 3,
      contractId: 3,
      nome: 'Pesquisa de Mercado Beta',
      clienteId: 'beta-solutions',
      clienteNome: 'Beta Solutions',
      responsavelId: 3,
      membros: [3, 7],
      status: 'concluido',
      dataInicio: '2026-04-01',
      dataFim: '2026-06-01',
      valor: 18000,
      descricao: 'Pesquisa de mercado e benchmarking do setor de tecnologia educacional.',
      tarefas: [
        { id: 8, titulo: 'Coleta de dados primários',  responsavelId: 7, status: 'concluida', prazo: '2026-04-20' },
        { id: 9, titulo: 'Análise e relatório final',  responsavelId: 3, status: 'concluida', prazo: '2026-05-30' },
      ],
    },
  ],
}
