import { NOME_COOKIE, lerSegredo } from "../auth/sessao";
import { db } from "../db";
import type { Contexto } from "./trpc";

function lerCookie(cabecalho: string | null, nome: string): string | undefined {
  if (!cabecalho) return undefined;
  for (const parte of cabecalho.split(";")) {
    const [chave, ...resto] = parte.trim().split("=");
    if (chave === nome) return resto.join("=") || undefined;
  }
  return undefined;
}

/** Monta o contexto de uma requisição HTTP. Falha (e a requisição vira erro 500) se SESSION_SECRET faltar. */
export function criarContexto(req: Request, resHeaders: Headers): Contexto {
  return {
    prisma: db,
    token: lerCookie(req.headers.get("cookie"), NOME_COOKIE),
    resHeaders,
    segredo: lerSegredo(),
    agora: () => new Date(),
    producao: process.env.NODE_ENV === "production",
  };
}
