---
description: O que o agente não pode fazer neste projeto
globs: []
alwaysApply: true
---

# O que não fazer

> leitor: agente

## Autoridade e escopo

- Siga a autoridade dos documentos definida em `AGENTS.md`.
- Não decida arquitetura ou regras de negócio ambíguas sem aprovação.
- Pode redigir um ADR quando solicitado ou previsto no plano aprovado. Somente
  marque uma decisão como aceita após confirmação explícita do usuário/time.
- Não altere decisões de ADRs aceitos silenciosamente. Mudanças substantivas
  exigem uma nova decisão aprovada; correções editoriais preservam a decisão.
- Não adicione dependências sem necessidade, justificativa e aprovação.
- Não amplie o pedido nem altere arquivos sem relação com o escopo aprovado.
- Não gere scaffold sem mostrar antes o que será criado.
- Planejamento e limites de execução são definidos em `rules/spec-flow.md`.

## Banco de dados

- Use `DATABASE_URL` para a conexão e mantenha o acesso via Prisma no servidor,
  conforme o ADR-001. Não crie um segundo dono do schema.
- Mudanças de estrutura exigem atualizar `prisma/schema.prisma` e criar uma
  migration em `prisma/migrations/`. Não edite migrations já aplicadas.
- Não apague dados, volumes ou execute resets sem autorização explícita sobre
  o alvo. Aprovar uma migration ou um plano não autoriza apagar o banco.

## Segurança

- Não versione arquivos de ambiente reais, senhas, tokens ou dados pessoais.
  `.env.example` é permitido somente com valores de exemplo, sem segredos reais.
- Não exponha valores reais de `DATABASE_URL`, `SESSION_SECRET` ou credenciais
  no cliente, nos logs ou na documentação; nomes das variáveis podem ser citados.
- Valide entradas e verifique autenticação e autorização no servidor em fluxos
  protegidos. Validação ou ocultação de controles na interface não basta.
- Não use credenciais administrativas fora do servidor.

## Operações externas

- Commit, push, abertura de PR, deploy e alterações em serviços ou bancos
  remotos exigem autorização correspondente; um plano local não as autoriza.
- Não faça push direto na branch de produção; use branch e revisão por PR.
- Não altere nem remova mudanças preexistentes do usuário para limpar o Git.
