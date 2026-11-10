import { createHmac, randomBytes } from "node:crypto";

import type { PrismaClient } from "@prisma/client";

export const NOME_COOKIE = "sessao";
export const DURACAO_SESSAO_MS = 8 * 60 * 60 * 1000; // Spec 005: 8 horas, sem renovação
const TAMANHO_MAXIMO_TOKEN = 200;

export type Relogio = () => Date;
export type UsuarioPublico = {
  id: number;
  nome: string;
  email: string;
  papel: "colaborador" | "operacoes";
};

type Dependencias = { segredo: string; agora: Relogio };

/** Lê SESSION_SECRET. Nunca inclui o valor na mensagem de erro. */
export function lerSegredo(env: Record<string, string | undefined> = process.env): string {
  const segredo = env.SESSION_SECRET;
  if (!segredo) throw new Error("SESSION_SECRET ausente: defina a variável de ambiente.");
  if (env.NODE_ENV === "production" && segredo.length < 32) {
    throw new Error("SESSION_SECRET fraca: use pelo menos 32 caracteres em produção.");
  }
  return segredo;
}

/** O banco guarda só o HMAC do token: vazar a tabela não permite forjar o cookie. */
export function hashDoToken(token: string, segredo: string): string {
  return createHmac("sha256", segredo).update(token).digest("hex");
}

export function cookieDeSessao(token: string, producao: boolean): string {
  const partes = [`${NOME_COOKIE}=${token}`, "HttpOnly", "SameSite=Lax", "Path=/", `Max-Age=${DURACAO_SESSAO_MS / 1000}`];
  if (producao) partes.push("Secure");
  return partes.join("; ");
}

export function cookieLimpo(producao: boolean): string {
  const partes = [`${NOME_COOKIE}=`, "HttpOnly", "SameSite=Lax", "Path=/", "Max-Age=0"];
  if (producao) partes.push("Secure");
  return partes.join("; ");
}

export async function criarSessao(prisma: PrismaClient, usuarioId: number, { segredo, agora }: Dependencias) {
  const token = randomBytes(32).toString("base64url");
  const expiraEm = new Date(agora().getTime() + DURACAO_SESSAO_MS);
  await prisma.sessao.create({ data: { tokenHash: hashDoToken(token, segredo), usuarioId, expiraEm } });
  return { token, expiraEm };
}

/** Devolve o usuário da sessão ou null (token ausente, malformado, desconhecido, expirado ou revogado). */
export async function usuarioDaSessao(
  prisma: PrismaClient,
  token: string | undefined,
  { segredo, agora }: Dependencias,
): Promise<UsuarioPublico | null> {
  if (typeof token !== "string" || token.length === 0 || token.length > TAMANHO_MAXIMO_TOKEN) return null;
  const sessao = await prisma.sessao.findUnique({
    where: { tokenHash: hashDoToken(token, segredo) },
    select: { expiraEm: true, revogadaEm: true, usuario: { select: { id: true, nome: true, email: true, papel: true } } },
  });
  if (!sessao || sessao.revogadaEm !== null || sessao.expiraEm.getTime() <= agora().getTime()) return null;
  return sessao.usuario;
}

export async function revogarSessao(prisma: PrismaClient, token: string, { segredo, agora }: Dependencias) {
  await prisma.sessao.updateMany({
    where: { tokenHash: hashDoToken(token, segredo), revogadaEm: null },
    data: { revogadaEm: agora() },
  });
}
