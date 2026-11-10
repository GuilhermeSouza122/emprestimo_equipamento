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
  let segredo: string;
  try {
    segredo = lerSegredo();
  } catch (erro) {
    // Registra o motivo (a mensagem nunca inclui o valor) e deixa a requisição falhar com 500,
    // sem criar nem validar sessão (Spec 005, casos de erro).
    console.error("auth: configuração inválida:", erro instanceof Error ? erro.message : "erro desconhecido");
    throw erro;
  }
  return {
    prisma: db,
    token: lerCookie(req.headers.get("cookie"), NOME_COOKIE),
    resHeaders,
    segredo,
    agora: () => new Date(),
    producao: process.env.NODE_ENV === "production",
  };
}
