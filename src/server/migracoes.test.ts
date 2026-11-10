import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";

import { PrismaClient } from "@prisma/client";
import { afterAll, describe, expect, it } from "vitest";

import { db } from "./db";

// DADOS-01 / EMP-13: as migrations aplicam do zero em um banco vazio. O teste cria um banco
// descartável NO MESMO SERVIDOR LOCAL do DATABASE_URL, aplica tudo com `prisma migrate deploy`
// e remove o banco no fim. Recusa servidor que não seja local.
const HOSTS_LOCAIS = new Set(["localhost", "127.0.0.1", "[::1]", "db"]);
const nomeDoBanco = `migracao_teste_${randomBytes(4).toString("hex")}`;

function urlDoBanco(nome: string): string {
  const url = new URL(process.env.DATABASE_URL ?? "");
  if (!HOSTS_LOCAIS.has(url.hostname)) throw new Error("O teste de migrations só roda em servidor local.");
  url.pathname = `/${nome}`;
  return url.toString();
}

describe("migrations do zero em banco vazio (PostgreSQL local)", () => {
  afterAll(async () => {
    await db.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${nomeDoBanco}" WITH (FORCE)`);
    await db.$disconnect();
  });

  it("aplica todas as migrations e cria as tabelas e os indices unicos esperados", async () => {
    const destino = urlDoBanco(nomeDoBanco);
    await db.$executeRawUnsafe(`CREATE DATABASE "${nomeDoBanco}"`);

    const resultado = spawnSync(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy"], {
      cwd: process.cwd(),
      encoding: "utf8",
      env: { ...process.env, DATABASE_URL: destino },
    });
    expect(resultado.status, `${resultado.stdout}\n${resultado.stderr}`).toBe(0);

    const novo = new PrismaClient({ datasourceUrl: destino });
    try {
      const tabelas = (await novo.$queryRaw<{ tablename: string }[]>`select tablename from pg_tables where schemaname = 'public'`).map(
        (linha) => linha.tablename,
      );
      for (const esperada of ["system_status", "usuarios", "equipamentos", "sessoes", "emprestimos"]) {
        expect(tabelas, esperada).toContain(esperada);
      }

      const indices = (await novo.$queryRaw<{ indexname: string }[]>`select indexname from pg_indexes where schemaname = 'public'`).map(
        (linha) => linha.indexname,
      );
      for (const unico of ["usuarios_email_key", "equipamentos_patrimonio_key", "sessoes_token_hash_key"]) {
        expect(indices, unico).toContain(unico);
      }

      // Banco recém-criado: nenhum dado de domínio.
      expect(await novo.usuario.count()).toBe(0);
      expect(await novo.equipamento.count()).toBe(0);
      expect(await novo.emprestimo.count()).toBe(0);
    } finally {
      await novo.$disconnect();
    }
  }, 120_000);
});
