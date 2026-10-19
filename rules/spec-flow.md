---
description: Fluxo obrigatório entre requisito, especificação, implementação e validação
globs: []
alwaysApply: true
---

# Fluxo de especificação

> leitor: agente

## Funcionalidades

1. Leia `docs/PRD.md` e os arquivos relevantes em `docs/adr/`.
   Use a autoridade dos documentos definida em `AGENTS.md`.
2. Transforme o pedido em uma spec curta em `docs/specs/`, com objetivo,
   escopo, critérios de aceitação e casos de erro.
3. Mostre a spec e o plano com etapas verificáveis e aguarde aprovação antes
   de escrever código de funcionalidade.
4. Implemente somente o escopo aprovado, preservando os padrões existentes.
5. Atualize os testes conforme `rules/tests.md` e verifique conforme
   `rules/checks.md`.
6. Entregue conforme `rules/handoff.md`.

## Aprovação e execução

- Aprovação explícita do plano autoriza suas etapas dentro do escopo descrito;
  não exige nova confirmação a cada pequena alteração.
- Se o usuário autorizar somente uma etapa ou pedir acompanhamento etapa a
  etapa, respeite esse limite e pare no ponto combinado.
- Pergunte antes de resolver ambiguidade de negócio, mudar arquitetura ou
  ampliar o escopo. Ações destrutivas ou externas seguem `rules/restrictions.md`.
- Informe progresso e obstáculos sem transformar resultado parcial em conclusão.

## Manutenção

Correções documentais, de regras ou de configuração sem mudança de comportamento
de produto podem seguir um plano aprovado sem criar uma spec de funcionalidade.
Uma correção de comportamento deve seguir ou atualizar a spec correspondente.
