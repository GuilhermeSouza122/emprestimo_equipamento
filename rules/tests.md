---
description: Como definir, executar e relatar testes neste projeto
globs: []
alwaysApply: true
---

# Testes

> leitor: agente

## Base arquitetural

- Use a stack de testes do ADR-001 aceito e os procedimentos existentes; não
  adicione ferramentas previstas apenas em rascunhos.
- `/health` é um endpoint HTTP operacional existente, não um contrato REST
  paralelo para funcionalidades de produto. Teste seu status e corpo de resposta.

## Antes de implementar

- Localize os testes existentes relacionados à funcionalidade.
- Para cada regra de negócio nova ou alterada, crie ou atualize um teste.
- Prefira testes unitários para regras isoladas e testes de integração para
  procedimentos tRPC e fluxos que dependem do Prisma ou PostgreSQL.

## Regras obrigatórias

- Não remova testes para fazer a suíte passar.
- Destino do banco e cuidados com dados de teste seguem `rules/checks.md`.
- Cubra sucesso, validação e falha esperada no escopo afetado; em fluxos
  protegidos, também cubra autenticação, autorização e isolamento entre usuários.
- Derive cenários e limites de `docs/PRD.md` e da spec aprovada, sem manter uma
  segunda lista normativa de regras de negócio neste arquivo.
- Para autenticação, derive os casos do modelo de sessão e papéis do ADR-001.

## Verificação

Os comandos obrigatórios e as exceções documentais estão em `rules/checks.md`.
O relato de resultados e limitações segue `rules/handoff.md`.
