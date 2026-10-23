# ADR-002: Design System

## Status

Aceito

## Contexto

`layout.md` define a linguagem visual Nocturne adaptada à marca EmpresTI: modo
escuro, paleta azul-marinho, tipografia Open Sans, ícones Phosphor, layouts
densos e controles com medidas e estados especificados. Essa especificação
visual deve ser preservada na implementação das seis telas da v1.

Há uma divergência de implementação: a seção 10 de `layout.md` pede estilos
inline e carregamento do bundle Nocturne, enquanto a aplicação deve manter uma
CSP restritiva sem `unsafe-inline`. O ADR-001 não adota Tailwind CSS nem
shadcn/ui, e a homepage e o login já usam CSS próprio e CSS Modules. Adotar
literalmente os estilos inline entraria em conflito com a CSP; carregar outro
bundle de estilos em runtime criaria um caminho de estilização paralelo.

## Decisão

- Nocturne adaptado é a linguagem visual canônica do produto. Cores, tipografia,
  densidade, espaçamento, raios, componentes, navegação, estados, animações e
  exemplos visuais seguem `layout.md`.
- Os estilos são implementados com CSS Modules e variáveis CSS, sem Tailwind CSS,
  shadcn/ui ou outra biblioteca visual, conforme o ADR-001. Os componentes são
  próprios e seguem os tokens e variantes EmpresTI; ícones são SVG embutidos
  nos componentes, sem pacote de ícones.
- Os tokens de cor e os valores de tema de `layout.md` são centralizados como
  variáveis CSS no escopo `.nocturne` (`src/app/nocturne.css`), aplicado às telas
  do produto. CSS global contém apenas esses tokens e estilos base
  compartilhados; a homepage informativa mantém o CSS próprio da Spec 001.
- O trecho da seção 10 de `layout.md` sobre estilos inline, `_ds/nocturne-<id>` e
  `_ds_bundle.js` descreve a referência de protótipo, não a arquitetura de
  runtime do aplicativo. A implementação não usa atributos `style` nem carrega
  esse bundle em runtime. A CSP permanece sem `unsafe-inline`.
- A interface é somente modo escuro, sem alternador de tema. A primária
  `#001449` é reservada a fundos profundos; `#5B7FE0` é a cor de ação visível.
  Botões primários são contornados, não preenchidos com cor sólida.
- A tipografia é Open Sans nos pesos definidos em `layout.md`; títulos não usam
  peso 700. Ícones são Phosphor nos pesos regular e fill conforme o estado.
  A fonte é carregada com `next/font`, hospedada pela própria aplicação, sem
  requisição a CDN em runtime. O carregamento respeita a CSP, sem enfraquecê-la
  para permitir estilos inline.
- Animações seguem os tempos de `layout.md`, limitados a 240 ms, e respeitam
  `prefers-reduced-motion`. Foco de teclado deve permanecer visível.
- Texto da interface permanece em português do Brasil, com tom operacional e
  datas no formato `dd/mmm`, conforme `layout.md`.

## Justificativa

- Separar linguagem visual de mecanismo de estilo conserva a especificação do
  layout sem introduzir um segundo sistema de componentes ou enfraquecer a CSP.
- Variáveis CSS centralizam os tokens e CSS Modules reproduzem as medidas do
  layout sem nova dependência, mantendo o padrão já usado na homepage e no login.
- A especificação explícita dos estados de disponibilidade, empréstimo,
  manutenção e atraso mantém os sinais operacionais consistentes entre catálogo,
  empréstimos e telas de Operações.

## Alternativas descartadas

- **Usar estilos inline e carregar o bundle Nocturne em runtime** — conflita com
  a CSP sem `unsafe-inline` e mantém um caminho de estilos separado do Tailwind.
- **Adotar Tailwind CSS e shadcn/ui** — contradiz o ADR-001 e adiciona
  dependências sem necessidade para reproduzir o layout.
- **Usar um pacote de ícones ou CDN de fontes** — adiciona dependência ou
  requisição externa; ícones inline e `next/font` atendem à necessidade.
- **Adicionar modo claro ou alternador de tema** — contradiz a especificação de
  modo escuro único.

## Consequências

### Fica mais fácil

- Manter tokens, controles e estados visuais coerentes entre as telas.
- Ajustar o tema sem espalhar valores de cor e espaçamento por estilos locais.
- Preservar CSP restritiva e manter o stack atual, sem dependências novas.

### Fica mais difícil

- Converter medidas detalhadas de `layout.md` em tokens e CSS Modules
  reutilizáveis, e manter componentes e ícones próprios.
- Manter coerência entre a homepage, que ainda usa a identidade Equipar, e as
  telas Nocturne/EmpresTI até haver decisão sobre a homepage.

## Escopo

Este ADR decide a linguagem visual e a estratégia de estilos da interface. Não
altera rotas, regras de negócio, arquitetura de dados, comportamento de
autorização ou requisitos funcionais de `layout.md`.