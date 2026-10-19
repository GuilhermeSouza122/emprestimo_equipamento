# ADR-002 — Layout e organização da homepage

**Status:** aceito para a homepage inicial, conforme implementação existente  
**Data:** 2026-10-02  
**Contexto do produto:** [PRD](../PRD.md)  
**Decisão de stack:** [ADR-001](001-stack.md)  
**Comportamento esperado:** [Spec 001 — Homepage](../specs/001-homepage.md)

## Contexto

O sistema controla empréstimos de equipamentos internos para colaboradores e
Operações. A homepage precisa apresentar o produto, explicar o fluxo de uso e
dar visibilidade às regras do PRD.

A implementação atual ainda não possui login, catálogo ou empréstimos reais.
Por isso, a página inicial apresenta o sistema por seções e usa navegação
interna. Os desenhos de equipamentos são ilustrativos; não representam itens
disponíveis no banco.

Este ADR registra as escolhas de apresentação já implementadas na homepage.
A spec continua responsável pelos comportamentos e critérios de aceitação.

## Decisão

### 1. Página única organizada por seções

A rota `/` terá uma homepage com esta ordem:

1. Cabeçalho com a marca, navegação e acesso ao estado do sistema.
2. Apresentação principal com título, descrição, ilustração e chamadas para
   conhecer o funcionamento e as regras.
3. Faixa curta com os benefícios do produto.
4. Explicação do fluxo de consulta, solicitação e devolução em três cartões.
5. Apresentação das regras já definidas no PRD.
6. Seção que explica o uso pelo time de Operações.
7. Estado real da conexão da aplicação com o banco.
8. Rodapé com identificação do produto e retorno ao início.

Os links desta versão apontam para seções existentes da própria página. Ações
de login, consulta ao catálogo e empréstimo serão adicionadas quando os
respectivos fluxos estiverem implementados.

### 2. Identidade visual inicial

Usar a identificação **Equipar** e uma linguagem visual consistente:

- Fundo claro principal (`#fbfaf7`) e superfícies brancas para cartões.
- Roxo na ação principal (`#6451c7`) e nos destaques dos títulos (`#7665cf`).
- Fundo lavanda (`#f0edff`) na apresentação principal.
- Texto principal escuro (`#202039`) e faixa de benefícios escura (`#2f2c4c`).
- Fonte de sistema: Arial, Helvetica ou outra fonte sem serifa disponível.
- Títulos grandes, textos curtos, cartões com cantos arredondados e sombras
  discretas para diferenciar planos visuais.

Esses valores descrevem a identidade atual. A escolha do nome não representa
uma decisão sobre registro de marca ou identidade institucional definitiva.

### 3. Layout responsivo

O conteúdo principal terá largura máxima de 1280 px. Em telas grandes, a
apresentação terá duas colunas: texto e ilustração. Os três passos aparecerão
lado a lado, e as quatro regras formarão uma grade de duas colunas.

Manter os pontos de adaptação existentes em 1100, 800 e 600 px:

- Até 1100 px, ajustar proporções e posições das ilustrações.
- Até 800 px, empilhar a apresentação principal, reduzir margens e ocultar os
  links centrais do cabeçalho; manter os acessos disponíveis no conteúdo.
- Até 600 px, apresentar passos e regras em uma coluna e reduzir o tamanho do
  título principal.

A ordem de leitura deve continuar a mesma nas diferentes larguras.

### 4. Componentes e estilos

Manter a homepage no Next.js App Router, usando React e TypeScript conforme o
ADR-001. O conteúdo de apresentação permanece em um componente de servidor;
o componente `HealthStatus` concentra a consulta dinâmica ao estado do sistema.

Usar CSS próprio no arquivo de estilos existente para grades, espaçamento,
tipografia e ilustrações. O layout inicial não exige adicionar uma biblioteca
de componentes, um pacote de ícones ou uma fonte remota.

Os desenhos feitos em HTML/CSS serão decorativos e marcados com `aria-hidden`.
Seu conteúdo não poderá ser usado como fonte de informação sobre o estoque.

### 5. Hierarquia, navegação e feedback

Usar um título principal, títulos de seção, regiões semânticas e links com
destinos definidos. Manter indicação visível de foco para navegação por teclado.
Respeitar a preferência de redução de movimento para rolagem e transições.

O estado da conexão deve combinar texto e cor e ser anunciado por uma região
de estado. A indicação de conexão disponível não comprova que login ou
empréstimos já estão operacionais.

## Justificativas

- **Página única:** reúne a apresentação inicial em uma rota simples de
  consultar enquanto os fluxos operacionais ainda estão em desenvolvimento.
- **Seções na ordem escolhida:** apresenta primeiro o propósito, depois o uso,
  os combinados e a visão de Operações.
- **Identidade clara com destaque roxo:** diferencia a ação principal e os
  títulos mantendo continuidade entre as seções da página.
- **Cartões e grades:** facilitam comparar os passos e localizar cada regra.
- **Responsividade:** mantém a leitura e o acesso ao conteúdo em computador
  e celular sem criar páginas distintas.
- **CSS e fonte de sistema:** aproveitam a estrutura existente sem acrescentar
  dependências para o layout inicial.
- **Ilustrações decorativas:** apresentam a categoria do produto sem depender
  de fotos ou dados de equipamentos reais.
- **Componente dinâmico isolado:** permite que a apresentação seja estática
  enquanto o estado da conexão é consultado pelo componente existente.

## Alternativas descartadas

- **Dashboard com indicadores e lista de equipamentos:** exigiria dados reais,
  autenticação e funcionalidades que ainda não existem na implementação atual.
- **Uma rota para cada seção de apresentação:** aumentaria a navegação e a
  manutenção para um conteúdo curto que pode ser lido na mesma página.
- **Interface baseada apenas em tabelas:** não atende tão bem à apresentação
  do produto e torna a leitura inicial menos direta em celular.
- **Biblioteca visual completa nesta etapa:** adicionaria dependência e
  convenções para uma página que já pode ser atendida pelo CSS existente.
- **Fotografias externas como base do layout:** criariam dependência de assets,
  licenças e carregamento adicional sem necessidade para explicar o produto.

## Consequências

- **O que fica mais fácil:** manter uma apresentação coerente, localizar regras,
  adaptar o conteúdo às diferentes larguras e evoluir a homepage sem depender
  de informações do catálogo.
- **O que fica mais difícil:** manter os estilos globais organizados quando
  surgirem novas telas; a extração de componentes e estilos compartilhados
  precisará ser avaliada conforme houver repetição real.
- **Custo de mudança:** trocar a identidade, a biblioteca visual ou a estrutura
  de navegação exigirá revisar estilos, conteúdo, comportamento responsivo e
  os critérios da spec da homepage.
- **Limite atual:** a homepage apresenta o produto. Os fluxos operacionais e a
  conformidade completa de acessibilidade precisam de definição e verificação
  próprias; este registro não certifica esses aspectos.

## Quando revisar esta decisão

Revisar o ADR quando os fluxos reais exigirem mudar as chamadas da homepage,
quando novas telas precisarem de componentes compartilhados ou quando houver
uma identidade institucional aprovada que substitua a apresentação atual.

## O que este ADR NÃO decide

Este ADR não altera regras de negócio, autenticação, autorização, contratos
tRPC, schema do banco, migrations ou a stack do ADR-001. Também não define os
layouts das futuras telas de catálogo, empréstimos e Operações, nem transforma
ilustrações em dados reais.

## Referências da implementação

- [Homepage](../../src/app/page.tsx)
- [Estilos e adaptações responsivas](../../src/app/globals.css)
- [Layout raiz e metadados](../../src/app/layout.tsx)
- [Estado da conexão](../../src/app/_components/health-status.tsx)
