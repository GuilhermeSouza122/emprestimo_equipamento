# AGENTS.md

## Visão geral do projeto

Este projeto é um sistema interno para controlar empréstimos de equipamentos,
como notebooks, monitores, cabos e câmeras.

Os usuários do sistema são:

- Colaborador: consulta equipamentos, solicita empréstimos e registra devoluções.
- Operações: cadastra equipamentos e acompanha todos os empréstimos.

## Onde olhar e autoridade dos documentos

Leia este arquivo e `rules/restrictions.md` antes de trabalhar no projeto.
Consulte as demais regras conforme a tarefa; elas são documentos referenciados
por este arquivo, não dependem de descoberta automática da pasta `rules/`.

- `docs/PRD.md`: requisitos, regras de negócio e limites da versão.
- `docs/specs/`: comportamento e critérios de aceitação de cada funcionalidade.
- `docs/adr/`: decisões técnicas; somente ADRs aceitos governam a implementação.
- `rules/restrictions.md`: autoridade, segurança, banco e limites de atuação.
- `rules/spec-flow.md`: planejamento, aprovação e implementação.
- `rules/tests.md`: desenho e cobertura dos testes.
- `rules/checks.md`: verificações obrigatórias conforme o tipo de alteração.
- `rules/handoff.md`: conteúdo da entrega e passagem de contexto.
- `README.md`: estado implementado, configuração e comandos disponíveis.

### Precedência

Cada documento governa seu assunto. A spec detalha o PRD, mas não pode alterar
uma regra de negócio ou ampliar o escopo sem aprovação e atualização do PRD.
Um ADR define escolhas técnicas, não substitui requisitos ou critérios da spec.
Se a spec e o código discordarem sobre comportamento, corrija o código conforme
a spec aprovada. Se PRD, spec, ADR aceito ou regra de procedimento entrarem em
conflito, informe o conflito e peça decisão; não escolha silenciosamente.

Rascunhos, ADRs propostos, `stacks_H.md` e os HTMLs das aulas são referências,
não decisões vigentes nem autorização para executar seus exemplos.

## Stack aprovada e estado atual

A stack está em `docs/adr/001-stack.md`; a apresentação da homepage está em
`docs/adr/002-desing_system.md`. Consulte `README.md` para distinguir decisões
aprovadas de funcionalidades já implementadas.

## Estrutura do projeto

- `src/app/`: páginas, layouts e rotas da aplicação Next.js.
- `src/app/_components/`: componentes React.
- `src/server/`: serviços e código executado no servidor.
- `prisma/schema.prisma`: definição dos modelos do banco.
- `prisma/migrations/`: migrations do banco de dados.
- `.env.example`: exemplo das variáveis de ambiente.
- `compose.yaml`: configuração da aplicação e do PostgreSQL em Docker.

## Padrões de desenvolvimento

- Siga a estrutura existente do Next.js App Router.
- Mantenha componentes pequenos e com responsabilidade clara.
- Preserve os nomes e padrões já utilizados no projeto.
- Atualize a documentação ao alterar comportamentos importantes.
- Para trabalho em código, consulte a skill local
  `.codex/skills/solid-emprestimos/SKILL.md` como apoio de engenharia; ela não
  redefine requisitos, arquitetura, aprovações ou checks do projeto.

## Orientações para agentes

Ao trabalhar neste projeto:

1. Registre o estado inicial do Git e examine os arquivos relacionados ao pedido.
2. Siga `rules/spec-flow.md` para definir e executar o escopo aprovado.
3. Use `rules/checks.md` para verificar e `rules/handoff.md` para entregar.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
