# Spec 007 — Devolver empréstimo

**Status:** proposta de 2026-11-10, aguardando aprovação. Nenhum código de
funcionalidade deve ser escrito antes dela.

## Objetivo e vínculo

Fechar o ciclo do empréstimo: o colaborador devolve um item que está com ele, o item volta a
ficar disponível e o limite de 3 itens se libera. Segue o [PRD](../PRD.md) (item 4 da primeira
versão: "Devolver um item que está comigo"), o [ADR-001](../adr/001-stack.md) (tRPC, Prisma) e a
[Spec 006](006-solicitar-emprestimo.md), de onde herda o modelo `Emprestimo` e o procedimento
protegido.

**Decisão de escopo do usuário (2026-11-10):** a devolução ficou "fora de escopo" no briefing de
solicitar empréstimo e na Spec 006. O usuário pediu para não deixar assim: sem devolução, cada
item emprestado fica indisponível para sempre e o estoque de teste acaba. Esta spec amplia o
escopo da prática e está registrada como tal no `ENTREGA.md`. O PRD já previa a funcionalidade.

## Escopo

- **Procedimento tRPC protegido** `emprestimos.devolver`: recebe o patrimônio e devolve o
  empréstimo **em aberto do próprio usuário** para aquele equipamento.
- **Efeito**, numa transação: grava `devolvido em` no empréstimo e muda o equipamento de
  `emprestado` para `disponivel`. Empréstimo **em atraso também pode ser devolvido** (é assim que
  o bloqueio por atraso se libera).
- **Autorização:** só o dono do empréstimo devolve. Quem não tem aquele item emprestado recebe
  uma recusa, sem saber quem está com ele.
- **Concorrência:** dois pedidos simultâneos de devolução do mesmo item resultam em **uma**
  devolução; o segundo é recusado. A devolução é uma atualização condicional (só atualiza se o
  empréstimo ainda estiver em aberto e for do usuário), sem biblioteca nova.
- **Tela:** em `/meus-emprestimos`, cada empréstimo ganha o botão **Devolver**, com confirmação em
  dois passos (o 1º clique muda o botão para "Confirmar devolução"; o 2º conclui). Depois de
  devolver, a lista, o contador do cabeçalho e o selo da barra lateral se atualizam, e o item
  volta a aparecer como disponível no catálogo.

## Fora de escopo

Registrar devolução de outra pessoa (tela de Operações, que continua com dados de exemplo), inspeção
ou estado do item na devolução, multa ou histórico de empréstimos devolvidos, renovação, e-mail.

## Decisões desta spec (a aprovar)

| Tema | Decisão | Por quê |
|---|---|---|
| Quem devolve | Só o dono do empréstimo, qualquer papel | PRD: "devolver um item que está comigo". Operações registrar devolução de terceiros é outra tela |
| Identificação | Pelo patrimônio do equipamento | A tela já trabalha com patrimônio; um item só tem um empréstimo em aberto por vez |
| Item devolvido | Volta direto a `disponivel` | Não há etapa de conferência no PRD; manutenção continua sendo decisão de Operações |
| Atraso | Pode devolver; ao devolver, deixa de contar | Devolver é a saída do atraso |
| Confirmação na tela | Dois passos no próprio botão, sem diálogo | Evita devolução por clique acidental com pouco código |
| Histórico | Não mostra empréstimos já devolvidos | Fica para outra spec; a lista continua só com os em aberto |

**Mensagem de recusa** (código `NAO_EMPRESTADO`): "Você não tem empréstimo em aberto deste
equipamento." Vale para item de outra pessoa, item disponível, já devolvido ou inexistente (a
inexistência continua sendo `NOT_FOUND`), sem revelar quem está com ele.

## Critérios de aceitação

- **DEV-01:** devolver grava `devolvido em` no empréstimo e muda o equipamento para `disponivel`,
  na mesma transação; o empréstimo deixa de aparecer em "Meus empréstimos" e de contar no limite.
- **DEV-02:** depois de devolver, o mesmo usuário pode solicitar de novo o item e outros (o limite
  de 3 se libera).
- **DEV-03:** empréstimo em atraso pode ser devolvido, e depois da devolução o usuário volta a
  poder solicitar (o atraso deixa de bloqueá-lo).
- **DEV-04:** quem não tem aquele item em aberto é recusado (`NAO_EMPRESTADO`): item de outro
  usuário, item disponível, em manutenção ou já devolvido. Nada muda no banco e a mensagem não
  cita ninguém.
- **DEV-05:** dois pedidos simultâneos de devolução do mesmo item resultam em exatamente uma
  devolução; o outro é recusado.
- **DEV-06:** o procedimento exige sessão (anônimo recebe `UNAUTHORIZED`), valida o patrimônio
  (`BAD_REQUEST`) e devolve `NOT_FOUND` para patrimônio inexistente.
- **DEV-07:** na tela, "Devolver" pede confirmação, mostra a recusa com `role="alert"`, e atualiza
  lista, contador e selo; o item volta como "Disponível" no catálogo.
- **DEV-08:** a Spec 006 continua valendo: nenhum teste dela é removido, e os 77 existentes passam.
- **DEV-09:** a spec passa pelo subagente `verificador-specs` antes de ser dada como pronta.

## Casos de erro e limites

- Banco indisponível: mensagem genérica de erro temporário, sem detalhes; nada fica pela metade.
- A situação `emprestado` sem empréstimo em aberto (dado inconsistente) não é corrigida por esta
  spec: o item só volta a `disponivel` quando há um empréstimo em aberto do usuário a devolver.
- Transação com limite de 20 s, como a de solicitar, por causa da latência do banco remoto.

## Contratos e documentação afetados

`src/server/emprestimos/servico.ts` (nova função e novo código de recusa), roteador
`emprestimos`, `src/app/(app)/meus-emprestimos/page.tsx` e um componente cliente para o botão,
`README.md`, Spec 006 (a linha "sem devolução" passa a apontar para esta spec) e `ENTREGA.md`
(decisão de ampliar o escopo e o estoque de teste, que agora se recompõe sozinho).
Não há migration: `Emprestimo.devolvidoEm` já existe.

## Plano e verificação

1. Aprovar esta spec.
2. Testes primeiro, em PostgreSQL local: devolução, item volta a disponível, limite e atraso
   liberados, recusas, isolamento entre usuários, concorrência (`Promise.all`), autorização.
3. Implementar serviço, procedimento e tela.
4. `npm run lint`, `npm test`, `npm run build` (sem outro `next` rodando), `git diff --check` e
   conferência no navegador local com a conta de teste.
5. Chamar o `verificador-specs` (sessão nova, sem `next dev` aberto).
6. Só então: commits de entrega, merge na `main`, migrations não necessárias, Redeploy de
   Production, conferência final e a tag `entrega-pratica`.

Commit, push e deploy não fazem parte desta etapa sem autorização correspondente.
