# Analise de Documentos com IA - Adm e Fin

## Contexto

Foi criado um modulo para o setor de Adm e Fin analisar contratos, propostas e documentos com apoio de IA.

Rota do site:

- `/adm-fin/analise-documentos`

Arquivos principais:

- `src/pages/adm/AnaliseDocumentos.jsx`
- `src/services/documentAnalysisService.js`
- `src/config/accessControl.js`
- `src/App.jsx`

## Decisao tecnica

A chave da IA nao deve ficar no front-end.

Fluxo correto:

1. Usuario acessa a tela de Analise de Documentos no site.
2. Usuario envia arquivo e pergunta/instrucao.
3. Front-end chama um webhook publico do n8n configurado por variavel de ambiente.
4. n8n chama a Claude/Anthropic API usando segredo guardado no ambiente do n8n.
5. n8n retorna a resposta para o site.
6. Site tenta salvar o historico no Supabase em `document_analyses`, se a tabela existir.

## Interface

- A tela deve ser orientada ao usuario final, sem expor detalhes tecnicos como n8n, webhook, Supabase ou chave de API.
- A experiencia principal e um chat com IA sobre o documento enviado.
- O usuario escolhe um documento, seleciona o tipo de conversa e envia perguntas em sequencia.
- Perguntas de continuacao enviam o historico recente da conversa para manter contexto.
- O historico deve usar linguagem simples, como "Nenhum historico encontrado ainda", sem citar infraestrutura.
- A tela foi ajustada para um layout estilo ChatGPT: coluna principal de conversa, upload pelo icone de clipe no compositor, seletor de tipo de conversa discreto no cabecalho do chat e historico recente abaixo da conversa.
- Evitar barras laterais grandes nessa tela. Upload, modo de conversa e historico nao devem competir visualmente com o chat.

## Variaveis

Front-end Vite:

```env
VITE_N8N_DOCUMENT_ANALYSIS_WEBHOOK_URL=
```

Cloudflare Pages:

- `VITE_N8N_DOCUMENT_ANALYSIS_WEBHOOK_URL` configurada em Production e Preview.
- A variavel aponta para o webhook publico do n8n de analise de documentos.
- A chave da Anthropic/Claude continua protegida no n8n, fora do front-end.

n8n:

```env
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=
```

`ANTHROPIC_MODEL` pode ficar vazio para usar o modelo padrao definido no workflow.

## Seguranca

- Nao salvar `ANTHROPIC_API_KEY` no repositorio.
- Nao salvar chave Claude/Anthropic em variavel `VITE_`, porque variaveis `VITE_` ficam expostas no navegador.
- Nao commitar exports de workflows n8n com tokens, cookies, senhas, headers de autorizacao ou API keys reais.
- Arquivos `workflow-*.json` devem permanecer ignorados pelo Git.

## Supabase

Tabela opcional para historico:

- `document_analyses`

Campos esperados pelo front-end:

- `id`
- `profile_id`
- `file_name`
- `file_type`
- `file_size`
- `analysis_type`
- `question`
- `result`
- `status`
- `created_at`

Se a tabela nao existir, a analise continua funcionando, mas o historico nao sera salvo.

## n8n

Workflow criado no n8n:

- Nome: `Projep - Analise de Documentos Claude`
- ID: `W7xbPfaPhUtfR1bc`
- Webhook: `https://optimistic-chowchow.pikapod.net/webhook/projep/documentos/analisar`
- Status: ativo

O workflow recebe o arquivo e a pergunta do site, prepara o payload para a API da Anthropic/Claude, chama a API com credencial protegida no n8n e responde ao front-end com `{ ok, analysis, model, usage, analyzedAt }`.

Modelo configurado no workflow:

- `claude-sonnet-4-6`

Foi criada uma credencial protegida no n8n para o header `x-api-key`. A chave real da Anthropic nao deve ser registrada no repositorio, na memoria ou em variaveis `VITE_`.

Arquivo local de referencia/export:

- `workflow-documentos-claude-v1.json`

Esse arquivo nao deve ser commitado. Workflows JSON devem permanecer ignorados porque podem carregar configuracoes sensiveis.

Observacao tecnica: o n8n bloqueou acesso direto a `$env` no Code node (`access to env vars denied`). A solucao aplicada foi usar credencial nativa `httpHeaderAuth` no node HTTP, mantendo a chave fora do codigo.

## Limitacoes conhecidas

- PDF e textos simples podem ser enviados diretamente para o Claude.
- TXT, MD, HTML e formatos textuais sao decodificados no n8n antes do envio.
- DOCX/RTF podem exigir conversao para PDF ou texto no n8n antes de uma analise completa.
- Arquivos muito grandes podem travar ou estourar limite de tempo; recomenda-se testar com documentos de contrato comuns antes de liberar uso amplo.
