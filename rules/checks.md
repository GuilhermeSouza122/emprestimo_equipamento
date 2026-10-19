---
description: O que precisa passar antes de declarar uma tarefa pronta
globs: []
alwaysApply: true
---

# Verificação de fim de tarefa
> leitor: agente

Esta é a fonte dos checks obrigatórios; outros documentos devem apontar aqui.

## Conforme o tipo de alteração

| Alteração | Verificação obrigatória |
|---|---|
| Somente documentação ou regras | Revisar referências, consistência e `git diff --check` |
| Código, dependências ou configuração de execução | `npm run lint`, `npm test`, `npm run build` e `git diff --check` |
| Dockerfile ou Compose | Checks de execução acima, `docker compose config --quiet` e build da imagem |
| Schema ou migrations | Checks de execução e aplicação de todas as migrations em banco local vazio e descartável |

Em tarefa mista, execute a união dos checks aplicáveis. Mudanças em uma skill
também exigem validar seu frontmatter e referências.
Se dependências ou lockfile mudarem, execute `npm audit --audit-level=high`;
alertas altos/críticos exigem correção ou decisão explícita, não atualização forçada.

## Banco e infraestrutura

- O projeto usa Prisma Migrate, não Supabase CLI. `npm test` aplica migrations
  com Prisma e usa `DATABASE_URL`; confira o destino antes de executá-lo.
- Não teste em banco remoto ou de produção. Para fixtures que escrevem dados,
  use banco local dedicado e limpeza limitada aos dados do teste.
- Verificar migrations do zero exige um banco descartável separado; não resete
  o banco existente nem exclua volumes. Remoções seguem `rules/restrictions.md`.
- Se faltar banco, Docker ou outra dependência, registre o check como pendente,
  a causa e o comando necessário. Não trate check não executado como aprovado.

## Git e conclusão

1. Registre `git status --short` antes da tarefa.
2. Ao terminar, revise o diff e compare o status com esse estado inicial.
3. Preserve alterações e arquivos preexistentes; identifique apenas o que a
   tarefa acrescentou ou modificou, inclusive arquivos novos não cobertos pelo diff.
4. Relacione a entrega aos critérios da spec ou, em manutenção, ao plano aprovado.

Uma tarefa está verificada quando todos os checks aplicáveis passam. É permitido
relatar correções aplicadas com verificações pendentes, desde que isso fique
explícito e não seja apresentado como sucesso completo. Mostre falhas relevantes
sem segredos e investigue a causa antes de repetir a mesma tentativa.
