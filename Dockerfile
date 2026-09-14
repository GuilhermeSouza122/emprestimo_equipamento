FROM node:20.19-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN DATABASE_URL="postgresql://postgres:postgres@localhost:5432/emprestimo_equipamento?schema=public" npx prisma generate

COPY . .
RUN DATABASE_URL="postgresql://postgres:postgres@localhost:5432/emprestimo_equipamento?schema=public" npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
