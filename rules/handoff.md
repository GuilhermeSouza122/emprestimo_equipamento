---
description: Como preparar a passagem de contexto e a entrega de uma tarefa
globs: []
alwaysApply: true
---

# Handoff

> leitor: agente

Antes de encerrar uma tarefa, deixe um resumo reproduzível para a próxima
pessoa ou agente.

## Conteúdo mínimo

- Objetivo atendido e escopo que ficou de fora.
- Arquivos alterados, criados ou removidos.
- Decisões tomadas e referências consultadas (`docs/PRD.md`, ADRs e specs).
- Confirmação de compatibilidade com o ADR-001 quando a tarefa tocar em
  framework, API, autenticação, banco, migrations ou testes.
- Comandos de verificação executados e seus resultados.
- Limitações, falhas ou dependências externas que ainda bloqueiam algo.
- Próximo passo concreto, quando houver trabalho pendente.

## Segurança e escopo

- Nunca inclua segredos, tokens, valores de `.env` ou dados pessoais.
- Não declare a tarefa concluída se algum check obrigatório falhou ou não foi
  executado; explique a situação claramente.
- Confirme que `git status --short` contém apenas arquivos relacionados à
  tarefa.
