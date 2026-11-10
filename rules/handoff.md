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
- Tabela da última rodada do `verificador-specs` para cada spec implementada, com o
  parecer. Sem parecer APROVADA, a spec consta como "implementada, verificação
  pendente" (`rules/spec-flow.md`).
- Limitações, falhas ou dependências externas que ainda bloqueiam algo.
- Próximo passo concreto, quando houver trabalho pendente.

## Segurança e escopo

- Respeite os limites de segurança de `rules/restrictions.md`.
- Distinga implementação aplicada de verificação completa, conforme
  `rules/checks.md`; registre separadamente checks aprovados, falhos e pendentes.
- Informe mudanças da tarefa e alterações preexistentes relevantes, sem exigir
  que o usuário limpe seu trabalho nem atribuir a si arquivos que já existiam.
