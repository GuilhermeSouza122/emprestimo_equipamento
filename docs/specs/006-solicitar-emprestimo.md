# Spec 006 — Catálogo real e solicitar empréstimo

**Status:** aprovada pelo usuário em 2026-11-10, com as decisões da tabela abaixo,
a conta de teste no seed e os feriados confirmados.

**Implementação (2026-11-10):** feita e verificada por `lint`, `tsc`, `npm test` (68 testes,
repetido 3 vezes para estabilidade das provas de concorrência), `npm run build`, as 4
migrations em banco vazio e um teste no navegador com a conta de teste (login, catálogo com
as 12 fotos do Supabase, solicitar 3 itens, recusa por limite, manutenção, "Meus
empréstimos" e Sair), com o banco local restaurado depois. **Verificação independente
pendente:** o `verificador-specs` ainda não rodou sobre esta spec; ela consta como
"implementada, verificação pendente" (`rules/spec-flow.md`).

## Objetivo e vínculo

Ligar o catálogo e "Meus empréstimos" ao banco e implementar a primeira regra de
negócio: o colaborador logado solicita um equipamento disponível e o empréstimo é
criado na hora, sem aprovação nem fila. Segue o [PRD](../PRD.md) (itens 2 e 3 e as
regras que Operações já decidiu), o [ADR-001](../adr/001-stack.md) (tRPC, Prisma,
papéis), o [ADR-003](../adr/003-imagens-equipamentos.md) (imagens), a
[Spec 004](004-dados-iniciais.md) (equipamentos e seed) e a
[Spec 005](005-autenticacao.md) (sessão e procedimentos protegidos).

Hoje o catálogo, o detalhe e "Meus empréstimos" mostram dados de exemplo fixos da
[Spec 003](003-layout-nocturne.md): 32 itens `PAT-xxxx`, empréstimos fictícios e
"2 de 3 itens" para qualquer usuário, inclusive a conta do professor, que precisa
chegar à correção com zero empréstimos.

## Escopo

- **Modelo `Emprestimo`** e migration nova: id, usuário, equipamento, solicitado em,
  devolução prevista (data, sem hora) e devolvido em (nulo enquanto estiver em
  aberto). Um empréstimo está **em aberto** quando `devolvido em` é nulo. A coluna de
  devolução existe para evitar nova migration depois; esta spec não a preenche.
- **Procedimentos tRPC protegidos** (sessão válida; qualquer papel):
  - `equipamentos.listar`: os equipamentos com patrimônio, nome, categoria, situação
    e arquivo de imagem.
  - `emprestimos.solicitar`: recebe o patrimônio, aplica as regras e cria o empréstimo.
  - `emprestimos.meus`: os empréstimos em aberto do usuário logado, com a devolução
    prevista e se estão em atraso.
- **Regras de `solicitar`** (PRD e briefing, nesta ordem de verificação):
  1. O equipamento precisa existir.
  2. Situação `manutencao` ou `emprestado`: recusa. Só `disponivel` segue.
  3. Usuário com empréstimo em atraso: recusa.
  4. Usuário com 3 empréstimos em aberto: recusa (limite do PRD, não os 5 do briefing).
  5. Tudo certo: cria o empréstimo e muda o equipamento para `emprestado`, na mesma
     transação.
- **Prazo:** devolução prevista = 14 **dias úteis** depois do dia do empréstimo (ver
  tabela de decisões). Módulo próprio de calendário, com testes.
- **Concorrência:** dois pedidos ao mesmo equipamento ao mesmo tempo criam **um** só
  empréstimo; três pedidos simultâneos de um usuário que já tem 2 em aberto criam só
  mais um.
- **Telas:**
  - `/catalogo` lê o banco: imagem, nome, categoria e situação de cada equipamento,
    mais busca, filtro por categoria e "só disponíveis" (que já existem). Sem rodapé
    nem texto de crédito de fotos (decisão do briefing, item 9). Sem "Dados de exemplo".
  - `/catalogo/[patrimonio]` lê o banco, com 404 para patrimônio inexistente, e traz o
    painel de solicitação com a devolução prevista calculada pelo servidor. Saem os
    campos que não existem no banco (local, última devolução e histórico).
  - `/meus-emprestimos` lista só os empréstimos em aberto do usuário, com a data de
    devolução prevista e a marca de atraso. Sem empréstimos: estado vazio e "0 de 3
    itens". Saem o botão "Devolver", a barra de dias e o histórico, que dependem da
    devolução (fora de escopo).
  - O contador do cabeçalho ("X de 3 itens com você") e o selo de "Meus empréstimos"
    na barra lateral passam a mostrar o número real.
- **Imagens:** `<img>` com a URL `EQUIPAMENTOS_IMAGENS_BASE_URL` + `/` + arquivo,
  proporção 4:3, texto alternativo e carregamento preguiçoso. Se a imagem não carregar
  (por exemplo, antes do envio ao Supabase), a tela mostra o ícone da categoria.

## Fora de escopo

Devolução, telas de Operações (continuam com dados de exemplo e aviso), reserva com data
futura, notificação por e-mail, renovação, cadastro de equipamento, quem está com um
item (não é mostrado a outros usuários) e limite de tentativas.

## Decisões desta spec (a aprovar)

| Tema | Decisão | Por quê |
|---|---|---|
| Limite de itens | 3 em aberto | PRD, homepage e specs 001 a 003; o briefing dizia 5 e já foi decidido contra (ENTREGA.md) |
| Dia 0 do prazo | O dia do empréstimo não conta; o 1º dia útil é o seguinte | O PRD diz "a partir do dia do empréstimo" e não fala se ele entra; assim um pedido no sábado ou em feriado funciona sem regra extra |
| Feriados | Sábados, domingos e feriados nacionais (incluindo Sexta-feira Santa, 20/11), estadual de SP (09/07) e municipais de São Paulo (25/01 e Corpus Christi); **não** Carnaval, que é ponto facultativo | Segue o PRD ("nacionais, do estado e do município de SP"); os móveis são calculados pela Páscoa. Corpus Christi como feriado municipal foi confirmado pelo usuário |
| Fuso e datas | Dia civil em `America/Sao_Paulo`; devolução prevista guardada como data (`DATE`), sem hora | Evita empréstimo "virar o dia" em UTC |
| O que é atraso | Devolução prevista **anterior a hoje** e empréstimo em aberto; vence hoje ainda não é atraso | O PRD diz "em atraso", e prazo até o fim do dia é o uso comum |
| Quem pode solicitar | Qualquer usuário autenticado, `colaborador` ou `operacoes` | O PRD só diz que o colaborador pede; quem trabalha em Operações também é funcionário. Se preferir só `colaborador`, é uma linha |
| Como evitar duplicidade | Dentro de uma transação: trava a linha do usuário (`SELECT ... FOR UPDATE`) e muda a situação do equipamento só se ainda for `disponivel` (atualização condicional) | Garante "só um criado" e o limite mesmo com pedidos simultâneos, sem biblioteca nova. Alternativa descartada: índice único parcial, que o Prisma não representa no schema |
| Mensagens de recusa | Texto fixo por motivo, ver abaixo | Motivo visível para quem foi recusado, sem revelar dados de terceiros |
| Imagem | `<img>`, não `next/image` | `next/image` exigiria configurar o domínio do Supabase e otimização na Vercel; as imagens já têm 800x600 |

**Mensagens de recusa** (código do erro: texto):
`MANUTENCAO`: "Este equipamento está em manutenção e não pode ser solicitado." ·
`INDISPONIVEL`: "Este equipamento não está disponível no momento." ·
`ATRASO`: "Você tem um empréstimo em atraso. Devolva-o para solicitar outro." ·
`LIMITE`: "Você já está com 3 itens. Devolva um para solicitar outro."

## Critérios de aceitação

- **EMP-01:** `/catalogo` mostra os equipamentos do banco com imagem, nome, categoria e
  situação, sem texto de crédito, sem rodapé de fotos e sem aviso de dados de exemplo.
  Para a conta do professor, mostra os 12 itens da Spec 004.
- **EMP-02:** cada imagem usa a URL pública montada com `EQUIPAMENTOS_IMAGENS_BASE_URL`
  e tem texto alternativo; se falhar ao carregar, aparece o ícone da categoria.
- **EMP-03:** solicitar um equipamento `disponivel` cria o empréstimo e o muda para
  `emprestado` na mesma transação; a resposta traz a devolução prevista.
- **EMP-04:** a devolução prevista é 14 dias úteis depois do dia do empréstimo, no
  calendário de São Paulo. Exemplo: empréstimo em 10/11/2026 (terça) vence em
  01/12/2026, porque 20/11 (sexta) é feriado. Cobrem-se também pedido em fim de semana,
  em feriado, virada de ano e Sexta-feira Santa.
- **EMP-05:** equipamento em `manutencao` é recusado (`MANUTENCAO`) e um `emprestado`
  também (`INDISPONIVEL`), no servidor; na tela o botão fica desabilitado com nota.
- **EMP-06:** com 3 empréstimos em aberto o pedido é recusado (`LIMITE`) e a tela mostra
  o motivo; com 2 o pedido é aceito.
- **EMP-07:** com um empréstimo em atraso o pedido é recusado (`ATRASO`); com um que
  vence hoje, é aceito.
- **EMP-08:** dois pedidos simultâneos ao mesmo equipamento resultam em exatamente um
  empréstimo; três pedidos simultâneos de quem tem 2 em aberto resultam em exatamente
  mais um. Nenhum fica pela metade.
- **EMP-09:** `/meus-emprestimos` e `emprestimos.meus` mostram só os empréstimos em
  aberto do usuário logado, com a data de devolução prevista; outro usuário não os vê.
  Sem empréstimos, estado vazio e "0 de 3 itens".
- **EMP-10:** o contador do cabeçalho e o selo da barra lateral mostram o número real de
  empréstimos em aberto.
- **EMP-11:** os procedimentos exigem sessão (anônimo recebe `UNAUTHORIZED`); o patrimônio
  é validado; patrimônio inexistente dá `NOT_FOUND` e a página de detalhe dá 404.
- **EMP-12:** as recusas aparecem com `role="alert"`, texto legível e foco mantido, e
  nunca revelam quem está com um equipamento nem dados de outros usuários.
- **EMP-13:** a migration aplica do zero em banco vazio, a Spec 004 continua valendo
  (o seed não altera situação de equipamento existente) e o teste DADOS-04 continua
  passando.
- **EMP-14:** a spec passa pelo subagente `verificador-specs` (`rules/spec-flow.md`)
  antes de ser dada como pronta.

## Casos de erro e limites

- Banco indisponível: mensagem genérica de erro temporário, sem detalhes internos, sem
  empréstimo criado.
- Falha no meio da transação: nada fica gravado, nem o empréstimo nem a mudança de situação.
- Um mesmo usuário que clica duas vezes: o botão fica desabilitado durante o envio, e o
  segundo pedido, se chegar, recebe `INDISPONIVEL`.
- Sem devolução nesta spec, um item emprestado continua assim. Para repetir testes em
  produção é preciso liberar itens direto no banco, o que é ação do usuário.
- Operações (`/operacoes/*`) continua com dados de exemplo e não reflete empréstimos reais.
- A conta do professor **não** deve ser usada para testar: ela precisa ficar com zero
  empréstimos.

## Pendências que dependem de decisão

1. ~~**Conta de teste.**~~ **Resolvida em 2026-11-10:** o seed (Spec 004, critério
   DADOS-09) cria, de forma opcional, uma conta de colaborador a partir de
   `SEED_TESTE_EMAIL` e `SEED_TESTE_PASSWORD`. Nada no código.
2. ~~**Feriados.**~~ **Confirmado pelo usuário em 2026-11-10:** Corpus Christi vale como
   feriado municipal de São Paulo e o Carnaval não entra.
3. **Imagens no Supabase.** Enquanto o usuário não enviar as 12 imagens e definir
   `EQUIPAMENTOS_IMAGENS_BASE_URL`, o catálogo mostra o ícone da categoria.
4. **Estoque de teste.** São 9 itens disponíveis e ninguém devolve nada ainda: três
   solicitações de uma conta já consomem um terço.

## Contratos e documentação afetados

`prisma/schema.prisma` e migration, módulo de calendário, procedimentos tRPC, páginas
`/catalogo`, `/catalogo/[patrimonio]` e `/meus-emprestimos`, barra lateral e cabeçalho,
`.env.example` (`EQUIPAMENTOS_IMAGENS_BASE_URL` já existe), `README.md`, Spec 003 (os
trechos de dados de exemplo dessas três telas deixam de valer), `ENTREGA.md` (limite de
3, TI-0010, crédito e as decisões desta spec).

## Plano e verificação

1. Aprovar esta spec e resolver a pendência 1.
2. Escrever os testes de integração com Vitest em PostgreSQL local descartável: calendário
   (com os exemplos do EMP-04), cada regra de recusa, limite, atraso (inclusive vence
   hoje), pedidos simultâneos com `Promise.all`, isolamento entre usuários e `UNAUTHORIZED`.
3. Implementar modelo, migration, calendário, procedimentos e as três telas.
4. Executar `npm run lint`, `npm test`, `npm run build`, `npm audit --audit-level=high` e
   `git diff --check`, mais as migrations em banco local vazio e uma conferência no
   navegador (solicitar, limite, manutenção, atraso e "Meus empréstimos").
5. Chamar o `verificador-specs`, numa sessão em que ele esteja carregado, e corrigir o
   que ele reprovar. Sem o parecer APROVADA, a spec consta como "implementada,
   verificação pendente".

Commit, push e deploy não fazem parte desta etapa sem autorização correspondente.
