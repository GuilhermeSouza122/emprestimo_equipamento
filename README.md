# Empréstimo de equipamentos

Sistema interno descrito em [PRD](docs/PRD.md). A stack aprovada está no
[ADR-001](docs/adr/001-stack.md) e a apresentação inicial no
[ADR-002](docs/adr/002-desing_system.md).

## Estado implementado

- Homepage informativa e responsiva conforme [Spec 001](docs/specs/001-homepage.md).
- Endpoint operacional `GET /health`, consultado pela homepage, e integração
  com PostgreSQL via Prisma.
- Migration inicial e teste de integração do endpoint de saúde com Vitest.
- Aplicação e banco configurados para Docker Compose.

Login, sessões, procedimentos tRPC, catálogo e fluxos reais de empréstimo,
devolução e Operações ainda não estão implementados. Aprovação da stack não
significa que esses fluxos já funcionam.

## Preparar o ambiente

Requisitos: Node.js 20.19 ou superior compatível com a versão instalada do Next,
npm e PostgreSQL; para execução em containers, Docker com Compose em funcionamento.

Antes de qualquer comando de execução, copie `.env.example` para `.env` e
ajuste somente seu ambiente local. Não versione credenciais reais.

### Aplicação e banco em containers

```bash
docker compose up --build
```

O Dockerfile copia o schema antes de instalar dependências; o `postinstall`
gera o Prisma Client. Na inicialização do container, Prisma aplica migrations
existentes antes de iniciar a aplicação. Este é o fluxo local, não uma decisão
sobre deploy em produção.

A aplicação usa `http://localhost:3000` e `/health` nessa mesma origem. Por padrão,
PostgreSQL fica em `localhost:55432` para evitar conflitos com outros bancos.
`APP_PORT` e `POSTGRES_PORT` podem sobrescrever as portas; dentro do Compose, a
aplicação conecta ao serviço `db` na porta 5432.

### Aplicação no Node.js e banco local ou no Compose

```bash
npm install
docker compose up -d db
npm run db:deploy
npm run dev
```

Se já houver PostgreSQL local configurado em `DATABASE_URL`, não é necessário
subir o serviço `db`. `npm install` gera o Prisma Client automaticamente.

## Comandos disponíveis

| Comando | Efeito |
|---|---|
| `npm run dev` | Inicia Next.js em desenvolvimento |
| `npm run build` | Gera a versão de produção |
| `npm start` | Serve uma versão já construída |
| `npm run lint` | Executa ESLint |
| `npm test` | Aplica migrations existentes e executa Vitest uma vez |
| `npm run test:watch` | Executa Vitest em observação; não aplica migrations |
| `npm run db:generate` | Gera Prisma Client a partir do schema |
| `npm run db:migrate` | Cria/aplica migrations de desenvolvimento; pode solicitar reset em caso de divergência |
| `npm run db:deploy` | Aplica migrations existentes, sem gerar novas |

Não confirme um reset solicitado pelo Prisma sem autorização sobre o banco alvo.

## Testes e verificações

Para `npm test`, PostgreSQL deve estar disponível e `DATABASE_URL` deve apontar
para um banco local, nunca remoto ou de produção. O teste atual lê o registro
de saúde, mas o comando aplica migrations; confira o destino antes de executar.
Testes futuros com fixtures de escrita precisam de banco local dedicado.

Os checks obrigatórios por tipo de alteração estão em [rules/checks.md](rules/checks.md).
Docker parado impede verificar a construção e execução dos containers, mas
`docker compose config --quiet` ainda pode validar a configuração.

## Build na Vercel

O [vercel.json](vercel.json) identifica a aplicação como Next.js, executa
`npm run build` e deixa a saída sob o padrão do framework (`outputDirectory:
null`), em vez de exigir uma pasta estática `public`.

Em Project Settings → Build and Deployment, confira:

- Framework Preset: Next.js.
- Root Directory: raiz do repositório (`.`), onde está este `package.json`.
- Build Command: `npm run build`.
- Output Directory: desative o Override; não configure `public`.

Esses ajustes exigem um novo deploy para ter efeito. O commit usado precisa
conter `vercel.json`; repetir um deploy de um commit antigo não inclui o arquivo.
O diretório da sua máquina chamado `projeto-emprestimo-equipamentos` não é uma
subpasta deste repositório no GitHub.

Não crie uma pasta `public` vazia para contornar `STATIC_BUILD_NO_OUT_DIR`:
o projeto precisa do processamento Next.js, inclusive para a rota `/health`.
Para essa rota conectar ao banco na Vercel, `DATABASE_URL` deve apontar para um
PostgreSQL acessível pelo ambiente hospedado, não para o Docker local. Configure
o valor diretamente no painel, sem adicioná-lo ao Git. Este build não aplica
migrations automaticamente nem provisiona um banco remoto.

## Instruções do projeto

[AGENTS.md](AGENTS.md) é o ponto de entrada para as regras e define a autoridade
dos documentos. `stacks_H.md` e os HTMLs das aulas são material de referência,
não a stack vigente nem comandos a executar automaticamente.
