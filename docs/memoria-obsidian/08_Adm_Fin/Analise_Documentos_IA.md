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

## Variaveis

Front-end Vite:

```env
VITE_N8N_DOCUMENT_ANALYSIS_WEBHOOK_URL=
```

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

Foi preparado um workflow local de importacao:

- `workflow-documentos-claude-v1.json`

Esse arquivo nao deve ser commitado. Ele foi sanitizado para usar `{{$env.ANTHROPIC_API_KEY}}` em vez de chave real.

Tentativa de criacao via API publica do n8n retornou HTTP 400 sem corpo de erro. Se a API continuar recusando a criacao, importar manualmente o JSON pela UI do n8n e configurar as variaveis de ambiente no servidor.

## Limitacoes conhecidas

- PDF e textos simples podem ser enviados diretamente para o Claude.
- TXT, MD, HTML e formatos textuais sao decodificados no n8n antes do envio.
- DOCX/RTF podem exigir conversao para PDF ou texto no n8n antes de uma analise completa.
- Arquivos muito grandes podem travar ou estourar limite de tempo; recomenda-se testar com documentos de contrato comuns antes de liberar uso amplo.
