# AGENTS.md

## Visão geral do projeto

Este projeto é um sistema interno para controlar empréstimos de equipamentos,
como notebooks, monitores, cabos e câmeras.

Os usuários do sistema são:

- Colaborador: consulta equipamentos, solicita empréstimos e registra devoluções.
- Operações: cadastra equipamentos e acompanha todos os empréstimos.

## Tecnologias

- TypeScript
- Node.js
- Next.js
- React
- PostgreSQL
- Prisma ORM
- Vitest
- Docker Compose

## Estrutura do projeto

- `src/app/`: páginas, layouts e rotas da aplicação Next.js.
- `src/app/_components/`: componentes React.
- `src/server/`: serviços e código executado no servidor.
- `prisma/schema.prisma`: definição dos modelos do banco.
- `prisma/migrations/`: migrations do banco de dados.
- `docs/PRD.md`: requisitos do sistema.
- `docs/adr/`: decisões de arquitetura.
- `.env.example`: exemplo das variáveis de ambiente.
- `compose.yaml`: configuração da aplicação e do PostgreSQL em Docker.

## Configuração do ambiente

Antes de executar localmente:

1. Instale as dependências com `npm install`.
2. Copie `.env.example` para `.env`.
3. Inicie o PostgreSQL e a aplicação com `docker compose up --build`.

A aplicação estará disponível em `http://localhost:3000`.

## Comandos disponíveis

- `npm run dev`: inicia o ambiente de desenvolvimento.
- `npm run build`: gera a versão de produção.
- `npm run lint`: verifica o código com ESLint.
- `npm test`: aplica as migrations e executa os testes.
- `npm run test:watch`: executa os testes em modo de observação.
- `npm run db:generate`: gera o Prisma Client.
- `npm run db:migrate`: cria e aplica migrations no desenvolvimento.
- `npm run db:deploy`: aplica migrations existentes.

## Regras de negócio

Ao implementar funcionalidades, respeite estas regras:

- Cada pessoa pode ter no máximo três equipamentos emprestados.
- O prazo padrão de devolução é de 14 dias.
- Pessoas com itens atrasados não podem solicitar novos empréstimos.
- Equipamentos em manutenção não podem aparecer como disponíveis.
- Cada pessoa deve visualizar somente os próprios empréstimos.
- Usuários de Operações podem visualizar todos os empréstimos em aberto.

## Padrões de desenvolvimento

- Use TypeScript.
- Siga a estrutura existente do Next.js App Router.
- Mantenha componentes pequenos e com responsabilidade clara.
- Coloque o código de acesso ao banco no lado do servidor.
- Use o Prisma Client para acessar o PostgreSQL.
- Preserve os nomes e padrões já utilizados no projeto.
- Não adicione dependências sem necessidade.
- Atualize a documentação ao alterar comportamentos importantes.

## Banco de dados

- Toda mudança no banco deve ser refletida em `prisma/schema.prisma`.
- Crie uma migration para cada alteração de estrutura.
- Não altere migrations que já tenham sido aplicadas.
- Não inclua credenciais reais no repositório.
- Use `DATABASE_URL` para configurar a conexão.

## Testes e verificações

Antes de considerar uma alteração concluída, execute:

1. `npm run lint`
2. `npm test`
3. `npm run build`

Ao implementar uma regra de negócio, adicione ou atualize os testes
correspondentes. Os testes que acessam o banco precisam do PostgreSQL em
execução.

## Segurança

- Nunca adicione arquivos `.env` ao Git.
- Nunca inclua senhas, tokens ou dados pessoais no código.
- Valide os dados recebidos pelo servidor.
- Verifique autenticação e autorização nas rotas protegidas.
- Não confie somente nas validações feitas pela interface.

## Limites da primeira versão

Não implemente sem solicitação explícita:

- Reservas para datas futuras.
- Notificações por e-mail.
- Importação da planilha antiga.
- Separação do frontend e backend em aplicações diferentes.
- Troca do PostgreSQL por outro banco.

## Orientações para agentes

Ao trabalhar neste projeto:

1. Leia `docs/PRD.md` antes de implementar funcionalidades.
2. Consulte `docs/adr/` antes de tomar decisões de arquitetura.
3. Examine o código existente antes de criar novos padrões.
4. Faça alterações pequenas e relacionadas ao pedido.
5. Não remova código ou arquivos sem uma justificativa clara.
6. Não modifique arquivos fora do escopo da tarefa.
7. Informe quais arquivos foram alterados.
8. Explique como a alteração foi verificada.
9. Avise sobre limitações ou verificações que não puderam ser executadas.
