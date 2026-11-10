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
6. Antes de declarar a spec pronta, acione o subagente `verificador-specs` (veja
   "Verificação independente" abaixo).
7. Entregue conforme `rules/handoff.md`.

## Verificação independente

Esta etapa é obrigatória e não depende de o usuário lembrar de pedir.

- Nenhuma spec é dada como pronta, concluída ou implementada sem uma rodada do
  subagente `verificador-specs` sobre ela, feita depois da última alteração de
  código, teste ou spec relacionada. Mudou algo depois da rodada: nova rodada.
- O verificador só lê e reporta. Quem corrige o que ele reprovar é o agente
  principal, nunca o verificador, nem quando a falha é só um teste quebrado.
- Acione-o com contexto limpo: informe apenas o caminho da spec, sem resumir a
  implementação nem dizer o que concluiu. Ele lê a spec, o PRD, os ADRs e o código
  por conta própria.
- Resultado REPROVADO: corrija e peça nova rodada. PENDENTE: registre cada item
  pendente com a causa e o comando necessário. Só o parecer APROVADA permite
  afirmar que a spec está pronta; sem ele, diga "implementada, verificação
  pendente" e mostre a tabela.
- Se o subagente não estiver disponível na sessão, diga isso ao usuário e não
  declare a spec pronta. Não substitua o verificador por uma checagem própria.
- Anexe a tabela da última rodada à entrega (`rules/handoff.md`).

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
