import { describe, expect, it } from "vitest";

import { hashSenha, verificarSenha } from "./senha.mjs";

describe("senha (scrypt)", () => {
  it("nao guarda a senha em texto e usa o formato scrypt", async () => {
    const hash = await hashSenha("uma-senha-de-teste");

    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(hash).not.toContain("uma-senha-de-teste");
  });

  it("confere a senha certa e recusa a errada", async () => {
    const hash = await hashSenha("uma-senha-de-teste");

    await expect(verificarSenha("uma-senha-de-teste", hash)).resolves.toBe(true);
    await expect(verificarSenha("outra-senha", hash)).resolves.toBe(false);
  });

  it("gera salt diferente a cada chamada", async () => {
    const primeiro = await hashSenha("mesma-senha");
    const segundo = await hashSenha("mesma-senha");

    expect(primeiro).not.toBe(segundo);
  });

  it("recusa hash malformado sem lancar erro", async () => {
    await expect(verificarSenha("x", "isto-nao-e-um-hash")).resolves.toBe(false);
    await expect(verificarSenha("x", "")).resolves.toBe(false);
  });
});
