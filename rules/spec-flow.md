---
description: Fluxo obrigatório entre requisito, especificação, implementação e validação
globs: []
alwaysApply: true
---

# Fluxo de especificação

> leitor: agente

Toda funcionalidade deve seguir este fluxo:

1. Leia `docs/PRD.md` e os arquivos relevantes em `docs/adr/`.
   Para decisões de stack, consulte especialmente `docs/adr/001-stack.md`.
2. Transforme o pedido em uma spec curta em `docs/specs/`, com objetivo,
   escopo, critérios de aceitação e casos de erro.
3. Mostre o plano e aguarde aprovação antes de escrever código de
   funcionalidade.
4. Implemente somente o escopo aprovado, preservando os padrões existentes.
5. Atualize testes para os critérios de aceitação e execute os checks do
   projeto.
6. Faça o handoff com arquivos, decisões, verificações e limitações.

## Regras de decisão

- Se o PRD estiver ambíguo, registre a pergunta; não invente comportamento.
- Se houver conflito com um ADR ou spec, pare e informe o conflito.
- Preserve a arquitetura do ADR-001: Next.js full-stack, tRPC, Prisma Client,
  Prisma Migrate, PostgreSQL, Vitest e sessão persistida no servidor.
- Verifique o papel (`colaborador` ou `operacoes`) nas rotas protegidas e não
  exponha autorização apenas no cliente.
- Mudanças de banco exigem atualização do schema e uma nova migration.
- Não inclua reservas futuras, notificações por e-mail ou importação da
  planilha sem solicitação explícita.
