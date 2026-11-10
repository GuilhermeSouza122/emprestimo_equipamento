# Spec 004 — Dados iniciais (equipamentos, imagens e conta do professor)

**Status:** aprovada pelo usuário em 2026-11-10, incluindo as decisões da tabela
abaixo (TI-0010 em manutenção, senha por variável de ambiente, nome "Marcelo Grilo").

## Objetivo e vínculo

Fazer o sistema em produção ter equipamentos reais, com foto, e a conta do
professor para teste. Segue o [PRD](../PRD.md), a stack do
[ADR-001](../adr/001-stack.md) (Prisma, PostgreSQL, papéis `colaborador` e
`operacoes`) e o [ADR-003](../adr/003-imagens-equipamentos.md) (imagens no
Supabase Storage, preparadas pela skill `imagens-equipamentos`).

Hoje o schema só tem `SystemStatus`: não existem usuários nem equipamentos.

## Escopo

- Modelos Prisma e migration nova (sem editar a migration existente):
  - `Usuario`: id, e-mail único, nome, papel (`colaborador` | `operacoes`), hash da
    senha, criado em.
  - `Equipamento`: id, patrimônio único, nome, categoria (`notebook` | `monitor` |
    `cabo` | `camera`), situação (`disponivel` | `manutencao` | `emprestado`),
    nome do arquivo da imagem, criado/atualizado em.
- Seed idempotente em JavaScript (`prisma/seed.mjs` e `prisma/seed-lib.mjs`),
  executado por `npm run db:seed`. JavaScript porque o projeto não tem executor de
  TypeScript e adicionar um exigiria dependência nova, que o ADR-001 não prevê.
- Fonte dos 12 equipamentos: `data/equipamentos.json` (lista dada pela prática).
  O seed ignora o campo `busca`, que só serve à skill de imagens.
- Imagem: o banco guarda só o nome do arquivo (`TI-0001.jpg`). A URL pública é
  montada pela aplicação com `EQUIPAMENTOS_IMAGENS_BASE_URL` (variável pública, sem
  segredo). Bucket público `equipamentos` no Supabase Storage.
- Usuário do professor: `marcelo.grilo@institutojef.org.br`, papel `colaborador`,
  nome "Marcelo Grilo", com zero empréstimos.
- Senha lida da variável de ambiente `SEED_PROFESSOR_PASSWORD` no momento de rodar o
  seed; nunca escrita em código, seed ou git. Hash com `scrypt` do `node:crypto`
  (sem dependência nova), salt aleatório por usuário. A função de hash fica em
  `src/server/auth/senha.mjs`, com `senha.d.mts`, porque o seed é JavaScript e o
  `tsconfig.json` tem `allowJs: false`; a Spec 005 reutiliza o mesmo módulo.
- Se o usuário já existe, o seed não altera nome, papel nem senha.
- **Conta de teste opcional** (emenda de 2026-11-10, pedida pelo usuário na Spec 006):
  se `SEED_TESTE_EMAIL` e `SEED_TESTE_PASSWORD` estiverem definidas (as duas juntas, ou
  nenhuma), o seed cria também um colaborador com esse e-mail e senha, para testar sem
  usar a conta do professor, que precisa chegar à correção com zero empréstimos. Mesmas
  regras da conta do professor: valores só do ambiente, hash `scrypt`, idempotente, e
  uma conta existente não é alterada. Não pode ser o e-mail do professor.

## Fora de escopo

Tela de catálogo, cadastro de equipamento pela interface, importação da planilha,
autenticação real e sessões (ver pendência 1), empréstimos (tabela e regras),
usuário de Operações, envio de imagens ao Supabase (feito pelo usuário).

## Decisões desta spec (a aprovar)

| Tema | Decisão | Por quê |
|---|---|---|
| Situação de TI-0010 | Seguir a lista: TI-0004, TI-0007 e **TI-0010** em manutenção; 9 disponíveis | O briefing diz "só TI-0004 e TI-0007, os outros 10 disponíveis", mas a lista "exata" marca TI-0010 como manutenção. Dois trechos do enunciado conflitam; a lista é o dado, o texto é a descrição |
| Senha | Variável de ambiente em vez de escrita no seed | O briefing pede a senha no arquivo, mas `rules/restrictions.md` proíbe senhas versionadas |
| Situação `emprestado` | Existe no enum, mas o seed não a usa | O PRD e a Spec 003 já a tratam; criar depois exigiria nova migration |
| Hash | `scrypt` do Node | Evita dependência fora do ADR-001 |
| Seed em outro banco | Recusa host que não seja local, salvo a flag `--producao` | Impede escrita acidental no deploy; o agente nunca passa essa flag |
| Atualização | Upsert por patrimônio: equipamento existente tem nome, categoria e imagem atualizados, mas **a situação só é definida na criação** | Repetir o seed corrige dados sem duplicar; se ele regravasse a situação, um item emprestado voltaria a "disponível" |

## Critérios de aceitação

- **DADOS-01:** a migration nova aplica do zero em banco vazio e cria `usuarios` e
  `equipamentos`, com unicidade em e-mail e patrimônio.
- **DADOS-02:** o seed cria exatamente os 12 equipamentos de `data/equipamentos.json`,
  com patrimônio, nome, categoria, situação e arquivo de imagem iguais aos da lista.
- **DADOS-03:** existe um usuário `marcelo.grilo@institutojef.org.br`, papel
  `colaborador`, com hash `scrypt` (nunca a senha em texto), e nenhum empréstimo (a
  tabela de empréstimos passou a existir na Spec 006; o seed nunca cria linhas nela).
- **DADOS-04:** rodar o seed duas ou mais vezes mantém 12 equipamentos e 1 usuário,
  sem duplicar, sem trocar o hash do usuário existente e sem alterar a situação de um
  equipamento já cadastrado.
- **DADOS-05:** o seed recusa um `DATABASE_URL` não local sem `--producao`, e nunca
  imprime senha nem credenciais do `DATABASE_URL`.
- **DADOS-06:** nenhum segredo no git: `SEED_PROFESSOR_PASSWORD` aparece só como nome,
  com um valor de exemplo (`replace-with-...`), no `.env.example`; uma busca no
  repositório e no histórico não encontra a senha real.
- **DADOS-07:** cada equipamento aponta para um arquivo existente em `data/imagens/`
  com 800×600 (conferido por `validar.mjs`); em produção, a URL pública de cada
  imagem abre sem login (conferência manual do usuário).
  **Conferido em 2026-11-10** por requisição HTTP sem login ao bucket público `equipamentos` do
  Supabase: as 12 URLs responderam 200 `image/jpeg`, com o mesmo tamanho em bytes dos arquivos de
  `data/imagens/`. Base pública (sem segredo): `https://vjohloojdffnoflctghb.supabase.co/storage/v1/object/public/equipamentos`. Para repetir: `curl -I https://vjohloojdffnoflctghb.supabase.co/storage/v1/object/public/equipamentos/TI-0001.jpg`
  até `TI-0012.jpg` (e comparar o `content-length` com `data/imagens/`).
- **DADOS-08:** a spec passa pelo subagente `verificador-specs` antes de ser dada
  como pronta.
- **DADOS-09:** com `SEED_TESTE_EMAIL` e `SEED_TESTE_PASSWORD`, o seed cria uma conta de
  colaborador com hash `scrypt` (nunca a senha em texto), sem tocar na do professor;
  repetir não duplica nem troca a senha; e-mail inválido, senha vazia ou o e-mail do
  professor abortam antes de qualquer gravação.

## Casos de erro e limites

- `SEED_PROFESSOR_PASSWORD` ausente ou vazia: o seed aborta antes de gravar qualquer
  dado e diz qual variável falta, sem mostrar valores.
- Categoria ou situação fora do conjunto permitido, patrimônio repetido na lista, ou
  imagem ausente em `data/imagens/`: o seed aborta antes de gravar.
- Falha no meio da gravação: o seed roda em transação; nada fica pela metade.
- O seed não apaga nada. Remoções ou resets seguem `rules/restrictions.md`.

## Pendências que dependem de decisão

1. **Login real.** O enunciado diz que o sistema "já tem login", mas aqui o login é
   só interface (Spec 002; o README confirma). Entrar "com a senha padrão" e a Spec
   de solicitar empréstimo ("o colaborador logado") exigem autenticação e sessão
   conforme o ADR-001. Decidido: uma spec própria, a [Spec 005](005-autenticacao.md),
   antes da de solicitar empréstimo. Esta spec só cria o usuário e o hash.
2. **Bucket do Supabase.** O usuário cria o bucket público `equipamentos` e envia as
   imagens (ver `references/envio-producao.md`); o agente não faz isso.
3. **Banco de produção.** O ADR-001 deixa a hospedagem como decisão futura. Nada aqui
   muda isso: o acesso continua por Prisma e `DATABASE_URL`.

## Contratos e documentação afetados

`prisma/schema.prisma`, nova migration, `package.json` (script `db:seed`),
`.env.example` (`SEED_PROFESSOR_PASSWORD`, `EQUIPAMENTOS_IMAGENS_BASE_URL`, sem
valores reais), `README.md` (estado e comando do seed) e `ENTREGA.md`.

## Plano e verificação

1. Aprovar esta spec e resolver a pendência 1.
2. Escrever os testes de integração do seed com Vitest, em PostgreSQL local
   descartável: 12 equipamentos, 1 usuário, idempotência, hash diferente da senha,
   recusa de host remoto, aborto sem a senha.
3. Implementar schema, migration e seed.
4. Executar `npm run lint`, `npm test`, `npm run build` e `git diff --check`, mais a
   aplicação das migrations em banco local vazio (`rules/checks.md`).
5. Chamar o `verificador-specs` e corrigir o que ele reprovar.
6. O usuário roda o seed no banco do deploy com `--producao` e envia as imagens.

Commit, push e deploy não fazem parte desta etapa sem autorização correspondente.
