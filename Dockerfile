FROM node:20.19-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
# O postinstall gera o Prisma Client e precisa do schema antes de npm ci.
RUN npm ci

COPY . .
RUN DATABASE_URL="postgresql://postgres:postgres@localhost:5432/emprestimo_equipamento?schema=public" npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
