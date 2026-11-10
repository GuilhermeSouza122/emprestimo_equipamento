import { TRPCError } from "@trpc/server";

import { RecusaEmprestimo, listarEmprestimosAbertos, solicitarEmprestimo } from "../../emprestimos/servico";
import { protectedProcedure, router } from "../trpc";

const MENSAGEM_INDISPONIVEL = "Serviço temporariamente indisponível. Tente novamente em instantes.";
const PATRIMONIO_VALIDO = /^[A-Za-z0-9-]{1,32}$/;

/** Validação no servidor (EMP-11): só o patrimônio, em formato simples. */
function lerPatrimonio(valor: unknown): { patrimonio: string } {
  if (typeof valor !== "object" || valor === null) throw new Error("Entrada inválida.");
  const { patrimonio } = valor as Record<string, unknown>;
  if (typeof patrimonio !== "string" || !PATRIMONIO_VALIDO.test(patrimonio)) throw new Error("Patrimônio inválido.");
  return { patrimonio };
}

export const emprestimosRouter = router({
  solicitar: protectedProcedure.input(lerPatrimonio).mutation(async ({ ctx, input }) => {
    try {
      return await solicitarEmprestimo(ctx.prisma, ctx.usuario.id, input.patrimonio, ctx.agora);
    } catch (erro) {
      if (erro instanceof RecusaEmprestimo) {
        throw new TRPCError({
          code: erro.codigo === "NAO_ENCONTRADO" ? "NOT_FOUND" : "PRECONDITION_FAILED",
          message: erro.message,
          cause: erro,
        });
      }
      // Registra só o tipo do erro: a mensagem do banco pode trazer host ou usuário.
      console.error("emprestimos.solicitar: falha interna", erro instanceof Error ? erro.name : "erro desconhecido");
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: MENSAGEM_INDISPONIVEL });
    }
  }),

  meus: protectedProcedure.query(({ ctx }) => listarEmprestimosAbertos(ctx.prisma, ctx.usuario.id, ctx.agora)),
});
