---
name: imagens-equipamentos
description: Prepara as fotos dos equipamentos do catálogo (800x600, sem repetição, com créditos) a partir da API do Pixabay, conforme o ADR-003. Use ao criar, trocar ou refazer qualquer imagem de equipamento. Nunca envia nada ao Supabase do deploy.
---

# Skill imagens-equipamentos

Fonte, processamento e armazenamento estão decididos no
[ADR-003](../../../docs/adr/003-imagens-equipamentos.md). Esta skill não redefine
o ADR; se algo aqui conflitar com ele, vale o ADR.

## Regras que não se negociam

- **Única fonte:** API do Pixabay. Nenhuma outra origem de imagem; o código recusa
  qualquer download fora de `pixabay.com`.
- **O agente nunca envia imagens ao Supabase do deploy.** Ele só prepara arquivos
  em `data/imagens/`. O envio é feito pelo usuário (`references/envio-producao.md`).
  Não peça nem use `SUPABASE_SERVICE_ROLE_KEY`, URL do projeto de produção ou o CLI do Supabase.
- **Nenhum segredo em código ou git.** A chave fica em `PIXABAY_API_KEY`, só em
  `.env.local`. Não imprima, não grave e não cole a chave.
- **Nenhuma dependência além do que o ADR-003 permite** (`sharp`, de desenvolvimento).
- **Foto só vale com revisão humana aprovada.** O agente propõe; quem aprova é o usuário.

## Fluxo

1. Fonte de verdade da lista: `data/equipamentos.json` (campo `busca` = termo de pesquisa).
2. Buscar candidatos e propor uma foto por equipamento:
   ```bash
   node --env-file=.env.local .claude/skills/imagens-equipamentos/scripts/buscar.mjs
   ```
   Gera `data/imagens/candidatos.json` (não versionado) e preenche
   `data/imagens/selecao.json` com propostas `"revisao": "pendente"`.
3. **Revisão visual (humana).** Mostre ao usuário, para cada proposta, a página da
   foto (`pageURL`) e peça a decisão seguindo `references/revisao-visual.md`.
   - Aprovada: o usuário (ou o agente, a pedido explícito dele) muda para `"revisao": "aprovada"`.
   - Reprovada: acrescente em `data/imagens/reprovadas.json`
     (`{ "id": ..., "patrimonio": "...", "motivo": "..." }`), apague a entrada de
     `selecao.json` e rode `buscar.mjs` de novo para uma nova proposta.
4. Preparar as aprovadas (baixa, recorta para 800×600 e grava créditos):
   ```bash
   node --env-file=.env.local .claude/skills/imagens-equipamentos/scripts/preparar.mjs
   ```
5. Validar o contrato (deve terminar com `OK`):
   ```bash
   node --env-file=.env.local .claude/skills/imagens-equipamentos/scripts/validar.mjs
   ```
6. Parar aqui. Entregue ao usuário `data/imagens/*.jpg` e `creditos.json` e indique
   `references/envio-producao.md`.

Repetir os passos é seguro: arquivos e créditos são nomeados pelo patrimônio, e
`preparar.mjs` pula o que já está pronto (use `--forcar` para refazer).

## Quem garante cada requisito do contrato

| Requisito | Garantido por |
|---|---|
| Fonte só Pixabay | **Código** (`baixar` recusa outros domínios; a API consultada é só a do Pixabay) |
| Sem pessoa, marca, logo ou texto legível | **Triagem por tags (código)** + **revisão humana** (decisiva) |
| Todas em 800×600 | **Código** (`sharp` + conferência em `validar.mjs`); nunca amplia fotos menores |
| Sem repetição | **Código** (mesmo id e mesmo hash são recusados) |
| Créditos por imagem | **Código** (`creditos.json`; `validar.mjs` exige todos os campos) |
| Não duplicar ao repetir | **Código** (nome por patrimônio, id já preparado é pulado) |
| Agente não envia à produção | **Estrutura** (não há script de envio) + **instrução** (regra acima) |
| Sem chave no git | **Código** (`validar.mjs` procura a chave; `.gitignore`) + **instrução** |
| Crédito visível na tela | **Decisão do usuário: não há crédito na tela** (briefing do catálogo, item 9). A autoria fica só em `creditos.json` |

## Referências

- `references/pixabay-api.md`: parâmetros, campos e limites da API.
- `references/revisao-visual.md`: critérios para aprovar ou reprovar uma foto.
- `references/envio-producao.md`: passos do usuário para publicar no Supabase.
