# Spec 005 — Autenticação (login, sessão e papéis)

**Status:** aprovada pelo usuário em 2026-11-10, incluindo as dependências
`@trpc/server` e `@trpc/client` (versões exatas) e as decisões da tabela abaixo.
A decisão sobre os alertas do `npm audit` continua aberta.

**Implementação (2026-11-10):** feita e verificada por `lint`, `tsc`, `npm test` e
`npm run build`, mais um teste ponta a ponta local (curl e navegador) com usuários
temporários, já removidos. **Verificação independente pendente:** o
`verificador-specs` ainda não rodou sobre esta spec, então ela consta como
"implementada, verificação pendente" (`rules/spec-flow.md`).

## Objetivo e vínculo

Tornar real o login que hoje é só interface ([Spec 002](002-tela-login.md)): entrar
com e-mail e senha, manter uma sessão no servidor e aplicar o papel do usuário nas
rotas protegidas. Segue o PRD (item 1: "Login. Cada pessoa vê os próprios
empréstimos") e o [ADR-001](../adr/001-stack.md): e-mail e senha, sessão no servidor
identificada por cookie HTTP-only e persistida no PostgreSQL, papel
(`colaborador` ou `operacoes`) guardado no usuário e verificado nas rotas protegidas,
e API de produto em tRPC.

Depende da [Spec 004](004-dados-iniciais.md), que cria o modelo `Usuario` e o usuário
do professor. Esta spec vem **antes** da de solicitar empréstimo.

## Escopo

- Modelo `Sessao` e migration nova: id, hash do token (único), usuário, criada em,
  expira em, revogada em (opcional).
- Token de sessão: 32 bytes aleatórios. O cookie leva o token; o banco guarda só
  `HMAC-SHA256(SESSION_SECRET, token)`. Cookie `HttpOnly`, `SameSite=Lax`, `Path=/`,
  `Secure` em produção, com validade igual à da sessão.
- Procedimentos tRPC em `/api/trpc`: `auth.entrar` (e-mail e senha), `auth.sair` e
  `auth.eu` (usuário atual ou nulo, sem o hash da senha).
- Conferência da senha com o mesmo `scrypt` da Spec 004, num único módulo
  compartilhado por seed e login (`src/server/auth/senha.mjs`, definido na Spec 004,
  com declaração de tipos `.d.mts`). Comparação em tempo constante.
- Proteção no servidor: `/catalogo`, `/meus-emprestimos` e `/operacoes/*` exigem
  sessão válida (anônimo vai para `/login`); `/operacoes/*` exige papel `operacoes`.
- Interface: `/login` passa a autenticar de verdade, e as telas autenticadas ganham a
  ação "Sair". Visual conforme ADR-002 e Spec 003, sem redesenho.
- Validação de entradas no servidor, sem biblioteca nova de esquemas (ver
  dependências).

## Fora de escopo

Cadastro, recuperação ou troca de senha, "lembrar de mim", OAuth, seleção de cargo,
limite de tentativas de login (risco registrado abaixo), múltiplos dispositivos
gerenciados, empréstimos e telas de negócio.

## Decisões desta spec (a aprovar)

| Tema | Decisão | Por quê |
|---|---|---|
| Duração da sessão | 8 horas, sem renovação | O PRD não define; uso interno e computador de balcão compartilhado pedem prazo curto |
| Mensagem de falha | "E-mail ou senha incorretos", idêntica para e-mail inexistente e senha errada | Não revelar quais e-mails existem |
| E-mail inexistente | Mesmo custo de `scrypt` do caso real, contra um hash falso | Evitar enumeração de usuários pelo tempo de resposta |
| Token no banco | HMAC com `SESSION_SECRET`, não SHA-256 simples | Vazamento só do banco não permite forjar cookie; usa o segredo que o `.env.example` já prevê |
| Sem JavaScript | O formulário continua sem enviar credenciais | Mantém LOGIN-03 da Spec 002; o login usa tRPC, que exige JavaScript |
| Validação | Funções próprias de validação, sem `zod` | O `npm audit` já acusa `zod` com severidade alta; evita aumentar a superfície |

## Dependências novas (a aprovar)

`@trpc/server` e `@trpc/client`, com versões exatas, para cumprir o ADR-001 (tRPC está
decidido, mas ainda não instalado). Nenhuma outra. O `npm audit` já tem alertas altos
e um crítico em dependências existentes (`next`, `vite`, `zod`, `source-map-js`);
esta spec não os resolve e exige decisão explícita sobre eles (`rules/checks.md`).

## Critérios de aceitação

- **AUTH-01:** credenciais válidas criam uma sessão, definem o cookie (`HttpOnly`,
  `SameSite=Lax`, `Secure` em produção) e levam a `/catalogo`. A senha não vai na URL
  nem em logs e não é guardada no navegador.
- **AUTH-02:** e-mail inexistente e senha errada devolvem a mesma mensagem e o mesmo
  status, e não criam sessão.
- **AUTH-03:** o banco não contém token utilizável: só o HMAC. Dois logins geram
  tokens diferentes.
- **AUTH-04:** sessão expirada ou revogada é recusada no servidor; `auth.sair`
  revoga a sessão no banco e limpa o cookie.
- **AUTH-05:** sem sessão, `/catalogo`, `/meus-emprestimos` e `/operacoes/*`
  redirecionam para `/login`. Colaborador em `/operacoes/*` é recusado no servidor,
  inclusive por chamada direta ao procedimento.
- **AUTH-06:** `auth.eu` devolve só id, nome, e-mail e papel, nunca o hash.
- **AUTH-07:** o servidor valida e-mail (formato e tamanho máximo), senha obrigatória
  e tamanho máximo antes de tocar no banco; entrada inválida não cria sessão.
- **AUTH-08:** o fluxo completo (entrar, `auth.eu`, sair) funciona com um usuário
  criado pelo próprio teste. Testes não usam a senha do professor.
- **AUTH-09:** a spec passa pelo subagente `verificador-specs` antes de ser dada
  como pronta.

## Casos de erro e limites

- Cookie ausente, malformado ou de sessão inexistente: tratado como anônimo.
- Banco indisponível: o login falha com mensagem genérica de erro temporário, sem
  detalhes internos, e não concede acesso.
- `SESSION_SECRET` ausente ou fraca em produção: a aplicação recusa criar sessões e
  registra o motivo sem expor o valor.
- Risco aceito e registrado: sem limite de tentativas, um atacante pode tentar
  senhas em sequência. Mitigação futura: bloqueio temporário por e-mail e por origem.
- Ocultar controles na interface não conta como proteção: toda verificação é feita
  no servidor (`rules/restrictions.md`).

## Contratos e documentação afetados

- Spec 002: LOGIN-03 e "Casos de erro e limites" deixam de valer na parte que diz que
  a autenticação está indisponível e que não se mostra "senha incorreta"; passam a
  valer AUTH-01 e AUTH-02. Atualizar a Spec 002 junto com a implementação.
- Spec 003: o limite que diz que as telas de Operações são acessíveis a qualquer
  visitante é substituído por AUTH-05.
- Spec 004: a pendência 1 fica resolvida por esta spec.
- `prisma/schema.prisma` e migration, `package.json` e lockfile, `.env.example`
  (`SESSION_SECRET` já existe), `README.md` (estado implementado) e `ENTREGA.md`.
- Em produção, `SESSION_SECRET` precisa existir nas variáveis de ambiente da Vercel.

## Plano e verificação

1. Aprovar esta spec e as dependências, e decidir sobre os alertas do `npm audit`.
2. Ler `node_modules/next/dist/docs/` sobre cookies e proteção de rotas desta versão
   do Next.js, que o `AGENTS.md` avisa ter mudanças incompatíveis, antes de escrever
   a proteção.
3. Escrever os testes de integração com Vitest em PostgreSQL local descartável:
   login válido, falha genérica, expiração com relógio injetável, logout, papéis,
   token sem texto claro no banco.
4. Implementar modelo, migration, módulo de senha compartilhado, procedimentos tRPC,
   proteção de rotas e ajustes de interface.
5. Executar `npm run lint`, `npm test`, `npm run build`, `npm audit --audit-level=high`
   e `git diff --check`, mais a aplicação das migrations em banco local vazio.
6. Chamar o `verificador-specs` e corrigir o que ele reprovar.

Commit, push e deploy não fazem parte desta etapa sem autorização correspondente.
