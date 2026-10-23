# Spec 001 — Homepage

Visual redesenhado em 2026-10-23 conforme o layout Nocturne/EmpresTI ([ADR-002](../adr/002-desing_system.md)):
modo escuro, marca EmpresTI e CSS Modules. Conteúdo, regras e critérios abaixo mantidos.

## Objetivo

Apresentar o sistema de empréstimo de equipamentos a colaboradores e Operações
enquanto autenticação, catálogo e empréstimo ainda não foram implementados.

## Escopo

- Explicar o propósito do produto e o fluxo de consulta, solicitação e devolução.
- Mostrar as quatro regras definidas no PRD.
- Mostrar o estado real da conexão com PostgreSQL pelo componente existente.
- Oferecer navegação interna, acesso à interface `/login` e layout responsivo.

## Critérios de aceitação

- **CA-01:** `/` mostra nome, propósito e passos do empréstimo.
- **CA-02:** a página apresenta limite de três itens, prazo de 14 dias,
  bloqueio por atraso e indisponibilidade de itens em manutenção.
- **CA-03:** a área de estado reflete `/health`, inclusive em caso de falha,
  sem exibir equipamentos ou números fictícios.
- **CA-04:** links levam a seções existentes ou à interface `/login`, e a página
  funciona em celular. O acesso à tela não representa autenticação implementada.

## Fora de escopo

Autenticação real, catálogo real, solicitação, devolução e tela operacional.
A interface de login está detalhada na [Spec 002](002-tela-login.md).
