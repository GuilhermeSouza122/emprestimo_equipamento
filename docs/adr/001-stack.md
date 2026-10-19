# ADR-001 — Stack do projeto

**Status:** aceito, confirmado pelo usuário em 2026-10-02

**Contexto do produto:** [docs/PRD.md](../PRD.md)  
**Data:** 2026-08-31

A aceitação registra a stack escolhida, não afirma que todas as peças já estão
implementadas. O estado executável está documentado no README.

## Contexto

Sistema web interno de empréstimo de equipamentos. O produto precisa de
login, catálogo, empréstimos, devoluções e uma tela para Operações. O time é
pequeno, o prazo é curto e não existe código anterior. O banco de dados já
estava decidido: PostgreSQL.

O critério geral é usar o menor número de peças móveis que atende ao PRD e
que a equipe consegue operar sem aprender uma ferramenta nova no meio do
caminho.

## Decisão

| Item | Escolha |
|---|---|
| Linguagem / runtime do backend | TypeScript sobre Node.js |
| Framework do backend | Next.js full-stack |
| Estilo e formato da API | tRPC com tipos compartilhados para funcionalidades de produto; `/health` permanece um endpoint HTTP operacional |
| Front | React/Next.js com TypeScript e etapa de build |
| Como o front é servido | Pelo mesmo servidor Next.js na execução Node.js local e em Docker |
| Arquitetura | Monólito modular |
| Autenticação | E-mail e senha; sessão no servidor identificada por cookie HTTP-only e persistida no PostgreSQL |
| Autorização | Papel (`colaborador` ou `operacoes`) armazenado no usuário e verificado nas rotas protegidas |
| Acesso ao banco | Prisma Client |
| Migrations | Prisma Migrate |
| Testes | Vitest; passa quando os testes automatizados e o fluxo mínimo de conexão com PostgreSQL passam |
| Execução local | Node.js + gerenciador de pacotes + PostgreSQL local ou em Docker Compose; comandos documentados no README |
| Configuração e segredos | `.env` local, com `.env.example` versionado e sem valores secretos |
| Banco | PostgreSQL |

## Justificativa

- **TypeScript sobre Node.js:** permite usar a mesma linguagem no front e no
  back, reduzindo a troca de contexto e mantendo os tipos próximos de quem
  consome e implementa cada operação.
- **Next.js full-stack:** concentra a interface e o backend no mesmo projeto,
  oferecendo a base para o monólito sem exigir dois servidores independentes.
- **tRPC:** mantém o contrato entre front e back tipado a partir dos
  procedimentos do servidor, evitando duplicar tipos e validações de uma API
  REST para uma aplicação consumida pelo próprio front.
- **React/Next.js com build:** o uso de componentes e tipos compartilhados
  organiza as cinco telas do PRD; a etapa de build é aceita como custo da
  decisão de usar TypeScript full-stack.
- **Mesmo processo:** evita configurar CORS, dois deploys e uma comunicação
  adicional para uma aplicação interna pequena.
- **Sessão no servidor:** o login pode ser invalidado no servidor e o cookie
  não carrega dados de autorização; isso atende ao login sem criar um cliente
  com estado complexo.
- **Papel no usuário:** a distinção entre Colaborador e Operações fica explícita
  no dado persistido e pode ser aplicada de forma uniforme nas rotas.
- **Prisma Client:** centraliza o acesso tipado às entidades do domínio e reduz
  a duplicação entre o schema usado pela aplicação e o modelo do banco.
- **Prisma Migrate:** registra cada alteração do schema como uma migration
  ordenada, permitindo criar e evoluir o banco de forma reproduzível.
- **Vitest:** permite testar regras do PRD isoladamente e os procedimentos tRPC;
  considerar a conexão com PostgreSQL evita declarar sucesso testando apenas
  mocks.
- **Node.js + PostgreSQL local ou Docker Compose:** oferece um caminho simples
  para quem já tem PostgreSQL e um caminho reproduzível para quem não tem;
  ambos devem usar a mesma configuração por variáveis de ambiente.
- **`.env.example`:** documenta as configurações necessárias sem colocar
  credenciais no repositório.
- **PostgreSQL:** é a decisão já tomada pelo time e será a fonte de verdade
  para usuários, equipamentos, empréstimos e sessões.

## Alternativas descartadas

- **Python com FastAPI:** descartado porque obrigaria a equipe a trabalhar com
  uma linguagem diferente entre front e back, sem uma necessidade do PRD.
- **Express com REST:** descartado porque exigiria definir e manter tipos,
  validações e contratos separados entre o servidor e o front.
- **Django:** descartado porque traz uma estrutura mais ampla do que a primeira
  versão precisa e não aproveita o contrato tipado escolhido para o front.
- **Frontend separado em React/Vite:** descartado porque criaria dois projetos,
  dois processos e uma comunicação adicional para uma aplicação interna pequena.
- **Frontend e backend em processos separados:** descartado porque exigiria
  CORS, dois processos para desenvolvimento e dois pontos de configuração sem
  benefício previsto no PRD.
- **JWT armazenado no navegador:** descartado porque a aplicação precisa apenas
  de sessão interna; revogar e controlar uma sessão no servidor é mais direto
  para este caso.
- **SQL direto com `pg`:** descartado porque perderia o modelo tipado e exigiria
  mais código repetido para mapear resultados do banco para o domínio.
- **Migrations escritas manualmente sem Prisma Migrate:** descartado porque não
  aproveitaria o schema único do Prisma e aumentaria o risco de divergência.
- **Testes apenas manuais:** descartado porque não protege as regras de limite
  de três itens, atraso e manutenção contra regressões.

## Consequências

- **O que fica mais fácil:** usar uma linguagem no front e no back; compartilhar
  tipos; servir o front e o tRPC juntos; e reproduzir o schema do PostgreSQL.
- **O que fica mais difícil:** o projeto depende do ecossistema Node.js e de uma
  etapa de build; o contrato tRPC acopla o front ao servidor; e a sessão
  persistida exige cuidado com expiração e limpeza.
- **O que fica impedido sem custo de mudança:** não podemos trocar o banco,
  separar o front em outro deploy, substituir React/Next.js ou mudar o modelo de
  autenticação sem revisar este ADR, a configuração e os testes.

## O que este ADR NÃO decide

Este ADR não decide a estrutura de pastas, a organização em camadas, os nomes
de módulos, o desenho visual das telas, o modelo detalhado das tabelas, os
endpoints específicos, as regras de negócio que o PRD deixou em aberto nem a
ordem de implementação das funcionalidades. Essas decisões serão registradas
nos artefatos apropriados e, quando forem arquiteturais, em ADRs posteriores.

## Relação com os rascunhos

`stacks_H.md` é material histórico, não uma extensão deste ADR. Supabase Auth,
multi-tenancy, Tailwind e shadcn/ui não foram adotados por esta decisão. A homepage
mantém o CSS próprio registrado no ADR-002. Hospedagem em produção permanece uma
decisão futura; não se presume Vercel ou um provedor de PostgreSQL gerenciado.
