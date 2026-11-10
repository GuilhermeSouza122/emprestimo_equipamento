// Seed da Spec 004: 12 equipamentos e a conta do professor. Uso: npm run db:seed
// Por padrão só grava em banco local. Gravar no deploy exige --producao e é ação do usuário.
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "@prisma/client";

import { PROFESSOR, executarSeed, lerEquipamentos, validarDestino } from "./seed-lib.mjs";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Variáveis já definidas no ambiente têm prioridade sobre o .env.
try {
  process.loadEnvFile?.(path.join(raiz, ".env"));
} catch {
  // sem .env: segue só com o ambiente
}

let prisma;
try {
  const producao = process.argv.includes("--producao");
  const destino = validarDestino(process.env.DATABASE_URL, { producao });
  console.log(`Destino: ${destino}${producao ? " (--producao informado)" : ""}`);

  prisma = new PrismaClient();
  const resultado = await executarSeed(prisma, {
    equipamentos: lerEquipamentos(path.join(raiz, "data", "equipamentos.json")),
    senha: process.env.SEED_PROFESSOR_PASSWORD,
    existeImagem: (arquivo) => existsSync(path.join(raiz, "data", "imagens", arquivo)),
  });

  console.log(`Equipamentos: ${resultado.equipamentos} (${resultado.equipamentosCriados} novos).`);
  console.log(`Usuário ${PROFESSOR.email}: ${resultado.usuarioCriado ? "criado" : "já existia, mantido"}.`);
} catch (erro) {
  // Erros do Prisma podem citar host, usuário ou trechos da URL: mostre só o tipo e o código.
  const doPrisma = typeof erro?.name === "string" && erro.name.startsWith("PrismaClient");
  const mensagem = doPrisma ? `falha do banco (${erro.name}${erro.code ? ` ${erro.code}` : ""})` : erro.message;
  console.error(`Seed abortado: ${mensagem}`);
  process.exitCode = 1;
} finally {
  await prisma?.$disconnect();
}
