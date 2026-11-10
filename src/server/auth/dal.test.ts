import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "../db";
import { hashSenha } from "./senha.mjs";
import { criarSessao, revogarSessao } from "./sessao";

// Fora de uma requisição do Next não existe contexto de React/Next: simulamos só o que a DAL usa.
const cookieAtual: { valor: string | undefined } = { valor: undefined };

vi.mock("react", async (importOriginal) => ({ ...(await importOriginal<typeof import("react")>()), cache: <T,>(funcao: T) => funcao }));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: (nome: string) => (nome === "sessao" && cookieAtual.valor ? { value: cookieAtual.valor } : undefined) }),
}));
vi.mock("next/navigation", () => ({
  redirect: (destino: string) => {
    throw new Error(`REDIRECT:${destino}`);
  },
}));

const { exigirOperacoes, exigirUsuario, obterUsuarioAtual } = await import("./dal");

const SEGREDO = "segredo-de-teste-com-mais-de-32-caracteres-aaaaaaaa";
const EMAIL_COLAB = "dal-colab@example.invalid";
const EMAIL_OPS = "dal-ops@example.invalid";
const agora = () => new Date();

async function tokenDe(email: string) {
  const usuario = await db.usuario.findUniqueOrThrow({ where: { email } });
  return (await criarSessao(db, usuario.id, { segredo: SEGREDO, agora })).token;
}

describe("DAL das paginas (exigirUsuario e exigirOperacoes)", () => {
  beforeAll(async () => {
    await db.usuario.deleteMany({ where: { email: { in: [EMAIL_COLAB, EMAIL_OPS] } } });
    const senhaHash = await hashSenha("senha-de-teste-123");
    await db.usuario.createMany({
      data: [
        { email: EMAIL_COLAB, nome: "Colaborador DAL", papel: "colaborador", senhaHash },
        { email: EMAIL_OPS, nome: "Operacoes DAL", papel: "operacoes", senhaHash },
      ],
    });
  });

  beforeEach(() => {
    vi.stubEnv("SESSION_SECRET", SEGREDO);
    cookieAtual.valor = undefined;
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await db.sessao.deleteMany({ where: { usuario: { email: { in: [EMAIL_COLAB, EMAIL_OPS] } } } });
  });

  afterAll(async () => {
    await db.usuario.deleteMany({ where: { email: { in: [EMAIL_COLAB, EMAIL_OPS] } } });
    await db.$disconnect();
  });

  it("AUTH-05: sem cookie, exigirUsuario manda para /login e obterUsuarioAtual devolve null", async () => {
    expect(await obterUsuarioAtual()).toBeNull();
    await expect(exigirUsuario()).rejects.toThrow("REDIRECT:/login");
  });

  it("AUTH-05: cookie invalido ou sessao revogada tambem mandam para /login", async () => {
    cookieAtual.valor = "token-que-nao-existe";
    await expect(exigirUsuario()).rejects.toThrow("REDIRECT:/login");

    const token = await tokenDe(EMAIL_COLAB);
    await revogarSessao(db, token, { segredo: SEGREDO, agora });
    cookieAtual.valor = token;
    await expect(exigirUsuario()).rejects.toThrow("REDIRECT:/login");
  });

  it("AUTH-05: colaborador com sessao valida passa em exigirUsuario, mas exigirOperacoes o manda para /catalogo", async () => {
    cookieAtual.valor = await tokenDe(EMAIL_COLAB);

    await expect(exigirUsuario()).resolves.toEqual(expect.objectContaining({ email: EMAIL_COLAB, papel: "colaborador" }));
    await expect(exigirOperacoes()).rejects.toThrow("REDIRECT:/catalogo");
  });

  it("AUTH-05: usuario de Operações passa em exigirOperacoes", async () => {
    cookieAtual.valor = await tokenDe(EMAIL_OPS);

    await expect(exigirOperacoes()).resolves.toEqual(expect.objectContaining({ email: EMAIL_OPS, papel: "operacoes" }));
  });

  it("AUTH-06: o usuario devolvido pela DAL nunca traz o hash da senha", async () => {
    cookieAtual.valor = await tokenDe(EMAIL_COLAB);

    const usuario = await exigirUsuario();

    expect(Object.keys(usuario).sort()).toEqual(["email", "id", "nome", "papel"]);
  });
});
