---
description: O que o agente não pode fazer neste projeto
globs: []
alwaysApply: true
---

# O que não fazer

> leitor: agente

## Autoridade

- Não escreva ADR. Se encontrar uma decisão que precisa de um, descreva
  a decisão e as alternativas, e PARE. Quem decide é o time.
- Não contrarie o que está em `docs/adr/`. Se precisar contrariar, pare.
- Não responda por conta própria o que o PRD deixou ambíguo. Liste as
  perguntas e espere.
- Não escolha biblioteca que não esteja no ADR-001. Proponha e espere.

## Escopo

- Não altere arquivo fora do escopo da tarefa atual.
- Não gere scaffold automático de framework sem mostrar antes o que ele
  vai criar.
- Não escreva código de funcionalidade sem uma spec correspondente em
  `docs/specs/`.
- Não implemente reservas futuras, notificações por e-mail, importação da
  planilha antiga ou outra funcionalidade fora do `docs/PRD.md` sem pedido
  explícito.

## Arquitetura e dependências

- Não substitua TypeScript, Next.js, React, Prisma ou PostgreSQL sem uma
  decisão aprovada pelo time.
- Não separe frontend e backend em aplicações diferentes sem aprovação.
- Não crie uma nova estrutura ou padrão antes de verificar o código existente.
- Não adicione dependência sem necessidade, justificativa e aprovação.
- Não acesse o banco fora do servidor nem contorne o Prisma Client sem uma
  decisão aprovada.

## Banco de dados

- Não altere o banco sem atualizar `prisma/schema.prisma` e criar a migration
  correspondente.
- Não edite migration que já tenha sido aplicada.
- Não apague dados nem execute alteração destrutiva sem autorização explícita.
- Não exponha `DATABASE_URL` em código, logs ou documentação.

## Segurança

- Não versione `.env`, senha, token, chave ou qualquer credencial.
- Não exponha `SESSION_SECRET` nem chaves do Supabase no cliente ou nos logs.
- Não aceite dados do cliente sem validação no servidor.
- Não permita acesso a rota protegida sem verificar autenticação e autorização.
- Não use credenciais administrativas fora do servidor.

## Regras de negócio

- Não permita mais de três empréstimos ativos por pessoa.
- Não altere o prazo padrão de devolução de 14 dias sem decisão do time.
- Não permita novo empréstimo para quem tem item atrasado.
- Não mostre equipamento em manutenção como disponível.
- Não permita que colaborador consulte empréstimos de outras pessoas.
- Não permita acesso à visão geral de empréstimos fora do papel Operações.

## Ritmo

- Não escreva código antes de um plano aprovado. Escreva o plano,
  mostre e espere.
- "Pode implementar" NÃO autoriza o plano inteiro: execute UMA tarefa,
  rode os checks, mostre o resultado e pare.
- Não relate sucesso parcial. Se um check falhou, a tarefa não terminou.
- Não conclua uma alteração sem atualizar os testes afetados e executar os
  checks adequados: `npm run lint`, `npm test` e `npm run build`.
- Não esconda check não executado, falha, limitação ou arquivo alterado.

## Produção

- Não faça push na branch de produção. Trabalhe em branch e abra PR.
- Não rode deploy nem altere configuração da Vercel.
- Não toque no projeto Supabase remoto: nada de SQL, de alteração de
  schema ou de dado por lá. Tudo acontece no banco local.

## Precedência

- Se o código e uma spec discordarem sobre comportamento, a spec está
  certa até que alguém mude a spec.
- Se uma regra de procedimento contrariar um ADR ou uma spec, PARE e
  avise. Não escolha um dos dois por conta própria.
- "Pode ir" e "pode implementar" não revogam nada deste arquivo.
