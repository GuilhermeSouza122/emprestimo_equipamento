# Emprestimo de equipamentos

Fatia zero do sistema interno descrito em `docs/PRD.md`. Este estado prova a
comunicacao entre uma pagina Next.js, o endpoint `GET /health` e o PostgreSQL,
sem implementar funcionalidades de produto.

## Subir aplicacao e banco

```bash
docker compose up --build
```

Acesse `http://localhost:3000`. O endpoint de saude fica em
`http://localhost:3000/health`. O PostgreSQL deste projeto e exposto em
`localhost:55432` para nao conflitar com as instancias que ja usam as portas
`5432` e `5433` nesta maquina.

## Rodar os testes

Com o banco do Compose em execucao:

```bash
npm install
npm test
```

## Comandos locais

```bash
npm run dev
npm run build
npm run lint
npm test
npm run db:migrate
```

Copie `.env.example` para `.env` antes da execucao local. O `.env` real e
ignorado pelo Git.
