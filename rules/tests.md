---
description: Como definir, executar e relatar testes neste projeto
globs: []
alwaysApply: true
---

# Testes

> leitor: agente

## Base arquitetural

- Siga o ADR-001: use Vitest, teste os procedimentos tRPC e mantenha o
  PostgreSQL como banco de integração.
- Não substitua o Prisma Client por SQL direto nem crie um contrato REST
  paralelo sem uma nova decisão arquitetural.

## Antes de implementar

- Localize os testes existentes relacionados à funcionalidade.
- Para cada regra de negócio nova ou alterada, crie ou atualize um teste.
- Prefira testes unitários para regras isoladas e testes de integração para
  procedimentos tRPC e fluxos que dependem do Prisma ou PostgreSQL.

## Regras obrigatórias

- Não remova testes para fazer a suíte passar.
- Não use credenciais reais nem banco remoto nos testes.
- Cubra cenários de sucesso, validação, autorização e falha esperada.
- Para empréstimos, valide limite de três itens, prazo de 14 dias, atraso,
  disponibilidade e isolamento entre usuários.
- Para autenticação, valide sessão no servidor, cookie HTTP-only e autorização
  por papel (`colaborador` ou `operacoes`) nas rotas protegidas.

## Verificação

Execute, quando aplicável:

1. `npm run lint`
2. `npm test`
3. `npm run build`

Na entrega, informe os comandos executados, o resultado e qualquer verificação
que não pôde ser executada.
