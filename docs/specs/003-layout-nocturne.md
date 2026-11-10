# Spec 003 — Layout Nocturne/EmpresTI (telas estáticas)

**Status:** implementado em 2026-10-23 como interface estática com dados de
exemplo; sem back-end.

## Objetivo e vínculo

Aplicar o layout `layout.md` (Nocturne adaptado à marca EmpresTI) às telas do
produto previstas no [PRD](../PRD.md), conforme o [ADR-002](../adr/002-desing_system.md)
e a stack do [ADR-001](../adr/001-stack.md). O comportamento do login continua
definido na [Spec 002](002-tela-login.md).

## Escopo

Rotas e telas: `/login` (01), `/catalogo` (02), `/catalogo/[patrimonio]` (03),
`/meus-emprestimos` (04), `/operacoes/emprestimos` (05) e
`/operacoes/equipamentos/novo` (06). Telas 02 a 06 compartilham sidebar de 236 px
e header de 64 px.

- Tokens, tipografia (Open Sans via `next/font`), ícones SVG embutidos, estados
  (disponível, emprestado, manutenção, atraso), botões, chips, tabelas e diálogo
  conforme `layout.md`; somente modo escuro.
- Dados de exemplo fixos (`sample-data.ts` e dados locais das telas). Nada é lido
  do banco nem gravado. Cada tela exibe o aviso "Dados de exemplo".
- Filtros e buscas locais no catálogo e em Operações; prévia ao vivo no cadastro.
- Homepage `/` redesenhada no mesmo visual (marca EmpresTI), mantendo o conteúdo e
  os critérios da [Spec 001](001-homepage.md).

## Critérios de aceitação

- **NOC-01:** cada rota acima responde e usa os tokens do layout, sem atributos
  `style` e sem CDN de fontes ou ícones.
- **NOC-02:** a sidebar destaca o item ativo (inclusive no detalhe do item) e leva
  às quatro telas; o fluxo catálogo → detalhe → diálogo → meus empréstimos tem
  links reais.
- **NOC-03:** o diálogo de confirmação abre, fecha com Cancelar, Esc e clique no
  fundo, e não registra solicitação: informa que é prévia.
- **NOC-04:** botões "Devolver", "Cadastrar" e "Solicitar" não alteram dados; o
  cadastro informa que nada foi gravado.
- **NOC-05:** itens indisponíveis não podem ser solicitados (botão desabilitado
  com nota); itens em manutenção não são clicáveis no catálogo.
- **NOC-06:** sem rolagem horizontal da página; até 960 px a sidebar vai para o
  topo e as grades empilham. Foco de teclado visível e
  `prefers-reduced-motion` respeitado.

## Limites e casos de erro

- ~~Não há autenticação nem autorização.~~ **Substituído pela Spec 005 (AUTH-05):** as
  telas 02 a 06 exigem sessão válida e as de Operações exigem o papel `operacoes`,
  verificados no servidor. A barra lateral esconde o grupo "Operações" para
  colaboradores (conveniência; a proteção real é a do servidor). Os dados continuam
  fictícios.
- ~~Regras de negócio (3 itens, 14 dias úteis, bloqueio por atraso) aparecem como
  informação, sem back-end.~~ **Substituído pela Spec 006 para `/catalogo`,
  `/catalogo/[patrimonio]` e `/meus-emprestimos`:** essas telas leem o banco e o servidor
  impõe as regras. Os critérios NOC-03, NOC-04 e NOC-05 passam a valer como EMP-03, EMP-05 e
  EMP-06 (o diálogo agora registra a solicitação de verdade). As telas de Operações
  continuam estáticas, com dados de exemplo.
- Patrimônio inexistente em `/catalogo/[patrimonio]` retorna 404.
- Reserva futura, e-mail e importação de planilha seguem fora de escopo (v1).

## Verificação

`npm run lint`, `tsc`, `npm run build` e conferência no navegador. `npm test`
depende do PostgreSQL local (Docker).
