---
name: solid-emprestimos
description: Implementar, refatorar ou revisar código TypeScript do sistema de empréstimos com foco em regras de negócio, responsabilidades claras e testes úteis.
---

# Engenharia de código para o sistema de empréstimos

Use esta skill em alterações de código do sistema de empréstimos. Preserve o
escopo do pedido e os padrões já presentes no repositório.

## Contexto antes da mudança

- Siga a autoridade dos documentos e os ponteiros de `AGENTS.md`: PRD para
  requisitos e regras de negócio, spec aprovada para comportamento da
  funcionalidade e ADRs aceitos para decisões técnicas. Propostas não são
  decisões vigentes; conflitos precisam de confirmação, não de escolha implícita.
- Aprovações, segurança, banco e checks pertencem às regras referenciadas em
  `AGENTS.md`; esta skill não os redefine. Examine o código próximo à mudança
  antes de criar uma nova abstração.

## Implementação

1. Descreva o comportamento observável e os casos de borda relevantes. Para
   uma regra de negócio nova ou corrigida, crie ou ajuste um teste Vitest que
   demonstre o comportamento; quando útil, veja-o falhar antes de implementar.
2. Faça a menor alteração que atenda ao requisito e preserve as fronteiras
   de responsabilidade e segurança definidas nas regras do projeto.
3. Mantenha componentes React focados na interface. Extraia funções ou módulos
   quando houver responsabilidades que mudem por motivos distintos ou quando
   isso tornar o comportamento mais fácil de entender e testar.
4. Aplique SOLID conforme o problema real: interfaces, classes, serviços e
   objetos de valor precisam representar uma fronteira, invariância ou variação
   concreta. Tipos TypeScript e funções simples bastam quando cumprem esse papel.
5. Refatore após o comportamento funcionar: nomes devem refletir o domínio;
   elimine duplicação que já cause manutenção repetida; evite abstrações para
   possibilidades ainda não exigidas. Não use limites fixos de linhas,
   parâmetros, atributos ou níveis de indentação como critério isolado.

Ao implementar empréstimos ou devoluções, considere requisições concorrentes
ao verificar disponibilidade e limites. Preserve a consistência dos dados com
operações atômicas quando esse risco existir.

## Revisão e conclusão

- Teste o comportamento e os limites afetados pelo pedido. Prefira testes de
  resultado a testes que apenas espelhem a estrutura do código. Testes que
  acessam o banco exigem PostgreSQL disponível.
- Em revisão, relate problemas concretos com impacto e localização. Não trate
  uma preferência de estilo como defeito sem consequência demonstrável.
- Siga `rules/checks.md` para verificação e `rules/handoff.md` para a entrega.
  Atualize a documentação quando mudar comportamento relevante.
