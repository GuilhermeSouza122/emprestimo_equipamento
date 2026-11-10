import { TRPCError } from "@trpc/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { db } from "../db";
import type { Contexto } from "../trpc/trpc";
import { appRouter } from "../trpc/routers";
import { hashSenha } from "./senha.mjs";
import { DURACAO_SESSAO_MS, hashDoToken, lerSegredo } from "./sessao";

const SEGREDO = "segredo-de-teste-com-mais-de-32-caracteres-aaaaaaaa";
const SENHA = "senha-valida-de-teste-123";
const EMAIL_COLAB = "auth-colab@example.invalid";
const EMAIL_OPS = "auth-ops@example.invalid";
const MENSAGEM_FALHA = "E-mail ou senha incorretos";

function montar(opcoes: { token?: string; agora?: () => Date; producao?: boolean } = {}) {
  const resHeaders = new Headers();
  const ctx: Contexto = {
    prisma: db,
    token: opcoes.token,
    resHeaders,
    segredo: SEGREDO,
    agora: opcoes.agora ?? (() => new Date()),
    producao: opcoes.producao ?? false,
  };
  return { ctx, resHeaders, caller: appRouter.createCaller(ctx) };
}

function tokenDoCookie(resHeaders: Headers): string | undefined {
  const cookie = resHeaders.get("set-cookie") ?? "";
  return /(?:^|, |; )sessao=([^;]*)/.exec(cookie)?.[1] || undefined;
}

async function codigoDoErro(promessa: Promise<unknown>) {
  try {
    await promessa;
  } catch (erro) {
    if (erro instanceof TRPCError) return { code: erro.code, message: erro.message };
    throw erro;
  }
  return null;
}

const contarSessoes = () => db.sessao.count({ where: { usuario: { email: { in: [EMAIL_COLAB, EMAIL_OPS] } } } });

describe("autenticacao (tRPC + sessao no PostgreSQL)", () => {
  beforeAll(async () => {
    await db.usuario.deleteMany({ where: { email: { in: [EMAIL_COLAB, EMAIL_OPS] } } });
    const senhaHash = await hashSenha(SENHA);
    await db.usuario.createMany({
      data: [
        { email: EMAIL_COLAB, nome: "Colaborador de Teste", papel: "colaborador", senhaHash },
        { email: EMAIL_OPS, nome: "Operacoes de Teste", papel: "operacoes", senhaHash },
      ],
    });
  });

  beforeEach(async () => {
    await db.sessao.deleteMany({ where: { usuario: { email: { in: [EMAIL_COLAB, EMAIL_OPS] } } } });
  });

  afterAll(async () => {
    await db.usuario.deleteMany({ where: { email: { in: [EMAIL_COLAB, EMAIL_OPS] } } });
    await db.$disconnect();
  });

  it("AUTH-01: credenciais validas criam sessao e definem o cookie HttpOnly, SameSite=Lax", async () => {
    const { caller, resHeaders } = montar();

    const usuario = await caller.auth.entrar({ email: EMAIL_COLAB, senha: SENHA });

    expect(usuario).toEqual(expect.objectContaining({ email: EMAIL_COLAB, nome: "Colaborador de Teste", papel: "colaborador" }));
    const cookie = resHeaders.get("set-cookie") ?? "";
    expect(cookie).toMatch(/^sessao=[^;]+/);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain(`Max-Age=${DURACAO_SESSAO_MS / 1000}`);
    expect(cookie).not.toContain("Secure");
    expect(await contarSessoes()).toBe(1);
  });

  it("AUTH-01: em producao o cookie tambem leva Secure", async () => {
    const { caller, resHeaders } = montar({ producao: true });
    await caller.auth.entrar({ email: EMAIL_COLAB, senha: SENHA });
    expect(resHeaders.get("set-cookie")).toContain("Secure");
  });

  it("AUTH-01: o e-mail nao diferencia maiusculas e a resposta nunca traz senha ou hash", async () => {
    const { caller } = montar();
    const usuario = await caller.auth.entrar({ email: ` ${EMAIL_COLAB.toUpperCase()} `, senha: SENHA });

    expect(Object.keys(usuario).sort()).toEqual(["email", "id", "nome", "papel"]);
    expect(JSON.stringify(usuario)).not.toContain(SENHA);
    expect(JSON.stringify(usuario)).not.toContain("scrypt");
  });

  it("AUTH-02: senha errada e e-mail inexistente dao a mesma resposta e nao criam sessao", async () => {
    const senhaErrada = montar();
    const emailInexistente = montar();

    const a = await codigoDoErro(senhaErrada.caller.auth.entrar({ email: EMAIL_COLAB, senha: "senha-errada" }));
    const b = await codigoDoErro(emailInexistente.caller.auth.entrar({ email: "ninguem@example.invalid", senha: SENHA }));

    expect(a).toEqual({ code: "UNAUTHORIZED", message: MENSAGEM_FALHA });
    expect(b).toEqual(a);
    expect(senhaErrada.resHeaders.get("set-cookie")).toBeNull();
    expect(emailInexistente.resHeaders.get("set-cookie")).toBeNull();
    expect(await contarSessoes()).toBe(0);
  });

  it("AUTH-03: o banco guarda so o HMAC do token, e dois logins geram tokens diferentes", async () => {
    const primeiro = montar();
    const segundo = montar();
    await primeiro.caller.auth.entrar({ email: EMAIL_COLAB, senha: SENHA });
    await segundo.caller.auth.entrar({ email: EMAIL_COLAB, senha: SENHA });
    const token1 = tokenDoCookie(primeiro.resHeaders)!;
    const token2 = tokenDoCookie(segundo.resHeaders)!;

    expect(token1).not.toBe(token2);
    expect(await db.sessao.count({ where: { tokenHash: token1 } })).toBe(0);
    expect(await db.sessao.count({ where: { tokenHash: hashDoToken(token1, SEGREDO) } })).toBe(1);
    expect(hashDoToken(token1, SEGREDO)).not.toBe(hashDoToken(token1, "outro-segredo-de-teste-com-32-caracteres-xx"));
  });

  it("AUTH-04: sessao valida identifica o usuario; expirada e recusada", async () => {
    const inicio = new Date("2026-11-10T12:00:00Z");
    const login = montar({ agora: () => inicio });
    await login.caller.auth.entrar({ email: EMAIL_COLAB, senha: SENHA });
    const token = tokenDoCookie(login.resHeaders)!;

    const dentro = montar({ token, agora: () => new Date(inicio.getTime() + DURACAO_SESSAO_MS - 1000) });
    const fora = montar({ token, agora: () => new Date(inicio.getTime() + DURACAO_SESSAO_MS + 1000) });

    expect((await dentro.caller.auth.eu())?.email).toBe(EMAIL_COLAB);
    expect(await fora.caller.auth.eu()).toBeNull();
  });

  it("AUTH-04: sair revoga a sessao no banco e limpa o cookie", async () => {
    const login = montar();
    await login.caller.auth.entrar({ email: EMAIL_COLAB, senha: SENHA });
    const token = tokenDoCookie(login.resHeaders)!;

    const saida = montar({ token });
    await saida.caller.auth.sair();

    expect(saida.resHeaders.get("set-cookie")).toMatch(/sessao=;.*Max-Age=0/);
    const linha = await db.sessao.findUniqueOrThrow({ where: { tokenHash: hashDoToken(token, SEGREDO) } });
    expect(linha.revogadaEm).not.toBeNull();
    expect(await montar({ token }).caller.auth.eu()).toBeNull();
  });

  it("AUTH-04: token ausente, malformado ou de sessao inexistente e tratado como anonimo", async () => {
    for (const token of [undefined, "", "lixo", "a".repeat(500)]) {
      expect(await montar({ token }).caller.auth.eu()).toBeNull();
    }
  });

  it("AUTH-05: o procedimento de Operacoes recusa anonimo e colaborador no servidor", async () => {
    const anonimo = await codigoDoErro(montar().caller.operacoes.acesso());
    expect(anonimo?.code).toBe("UNAUTHORIZED");

    const colab = montar();
    await colab.caller.auth.entrar({ email: EMAIL_COLAB, senha: SENHA });
    const comoColab = montar({ token: tokenDoCookie(colab.resHeaders) });
    expect((await codigoDoErro(comoColab.caller.operacoes.acesso()))?.code).toBe("FORBIDDEN");

    const ops = montar();
    await ops.caller.auth.entrar({ email: EMAIL_OPS, senha: SENHA });
    const comoOps = montar({ token: tokenDoCookie(ops.resHeaders) });
    await expect(comoOps.caller.operacoes.acesso()).resolves.toEqual({ papel: "operacoes" });
  });

  it("AUTH-06: auth.eu devolve so id, nome, e-mail e papel", async () => {
    const login = montar();
    await login.caller.auth.entrar({ email: EMAIL_OPS, senha: SENHA });
    const usuario = await montar({ token: tokenDoCookie(login.resHeaders) }).caller.auth.eu();

    expect(Object.keys(usuario!).sort()).toEqual(["email", "id", "nome", "papel"]);
  });

  it("AUTH-07: entradas invalidas sao recusadas antes de tocar no banco", async () => {
    const invalidas = [
      { email: "", senha: SENHA },
      { email: "nao-e-um-email", senha: SENHA },
      { email: `${"a".repeat(300)}@example.invalid`, senha: SENHA },
      { email: EMAIL_COLAB, senha: "" },
      { email: EMAIL_COLAB, senha: "x".repeat(300) },
      { email: 42, senha: SENHA },
      { email: EMAIL_COLAB },
    ];
    for (const entrada of invalidas) {
      const { caller } = montar();
      const erro = await codigoDoErro(caller.auth.entrar(entrada as never));
      expect(erro?.code).toBe("BAD_REQUEST");
    }
    expect(await contarSessoes()).toBe(0);
  });

  it("AUTH-08: fluxo completo entrar, eu, sair com usuario criado pelo teste", async () => {
    const login = montar();
    await login.caller.auth.entrar({ email: EMAIL_COLAB, senha: SENHA });
    const sessao = montar({ token: tokenDoCookie(login.resHeaders) });

    expect((await sessao.caller.auth.eu())?.email).toBe(EMAIL_COLAB);
    await sessao.caller.auth.sair();
    expect(await sessao.caller.auth.eu()).toBeNull();
  });

  it("banco indisponivel: falha com mensagem generica, sem detalhes e sem acesso", async () => {
    const { ctx } = montar();
    const quebrado = appRouter.createCaller({
      ...ctx,
      prisma: { usuario: { findUnique: () => Promise.reject(new Error("connection refused host=secreto")) } } as never,
    });

    const erro = await codigoDoErro(quebrado.auth.entrar({ email: EMAIL_COLAB, senha: SENHA }));

    expect(erro?.code).toBe("INTERNAL_SERVER_ERROR");
    expect(erro?.message).not.toContain("secreto");
    expect(erro?.message).not.toContain("connection");
  });
});

describe("lerSegredo (SESSION_SECRET)", () => {
  it("em producao exige um segredo presente e com pelo menos 32 caracteres", () => {
    expect(() => lerSegredo({ NODE_ENV: "production" })).toThrow(/SESSION_SECRET/);
    expect(() => lerSegredo({ NODE_ENV: "production", SESSION_SECRET: "curta" })).toThrow(/SESSION_SECRET/);
    expect(lerSegredo({ NODE_ENV: "production", SESSION_SECRET: SEGREDO })).toBe(SEGREDO);
  });

  it("fora de producao exige apenas que exista e nao revela o valor no erro", () => {
    expect(() => lerSegredo({ NODE_ENV: "development" })).toThrow(/SESSION_SECRET/);
    expect(lerSegredo({ NODE_ENV: "development", SESSION_SECRET: "curta-mas-ok" })).toBe("curta-mas-ok");
    try {
      lerSegredo({ NODE_ENV: "production", SESSION_SECRET: "valor-secreto-curto" });
    } catch (erro) {
      expect((erro as Error).message).not.toContain("valor-secreto-curto");
    }
  });
});
