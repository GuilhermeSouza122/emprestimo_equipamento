import { initTRPC, TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";

import { usuarioDaSessao } from "../auth/sessao";
import type { Relogio } from "../auth/sessao";

export type Contexto = {
  prisma: PrismaClient;
  token: string | undefined;
  /** Cabeçalhos da resposta HTTP; é por aqui que o login define o cookie. */
  resHeaders: Headers;
  segredo: string;
  agora: Relogio;
  producao: boolean;
};

const t = initTRPC.context<Contexto>().create({
  // Nunca devolver o stack ao cliente, nem em desenvolvimento.
  errorFormatter: ({ shape }) => ({ ...shape, data: { ...shape.data, stack: undefined } }),
});

export const router = t.router;
export const publicProcedure = t.procedure;

/** Exige sessão válida, verificada no servidor a cada chamada. */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const usuario = await usuarioDaSessao(ctx.prisma, ctx.token, { segredo: ctx.segredo, agora: ctx.agora });
  if (!usuario) throw new TRPCError({ code: "UNAUTHORIZED", message: "Faça login para continuar." });
  return next({ ctx: { ...ctx, usuario } });
});

/** Exige papel `operacoes`; o servidor recusa colaborador mesmo em chamada direta. */
export const operacoesProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.usuario.papel !== "operacoes") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a Operações." });
  }
  return next();
});
