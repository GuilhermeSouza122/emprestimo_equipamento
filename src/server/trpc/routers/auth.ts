import { TRPCError } from "@trpc/server";

import { autenticar } from "../../auth/login";
import { cookieDeSessao, cookieLimpo, criarSessao, revogarSessao, usuarioDaSessao } from "../../auth/sessao";
import { publicProcedure, router } from "../trpc";

// Mesma mensagem para e-mail inexistente e senha errada: não revela quais e-mails existem.
export const MENSAGEM_FALHA_LOGIN = "E-mail ou senha incorretos";
const MENSAGEM_INDISPONIVEL = "Serviço temporariamente indisponível. Tente novamente em instantes.";
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validação no servidor (AUTH-07), sem biblioteca de esquemas. Lança em entrada inválida. */
function lerEntradaLogin(valor: unknown): { email: string; senha: string } {
  if (typeof valor !== "object" || valor === null) throw new Error("Entrada inválida.");
  const { email, senha } = valor as Record<string, unknown>;
  if (typeof email !== "string" || typeof senha !== "string") throw new Error("Entrada inválida.");
  const emailNormalizado = email.trim().toLowerCase();
  if (emailNormalizado.length === 0 || emailNormalizado.length > 254 || !EMAIL_VALIDO.test(emailNormalizado)) {
    throw new Error("E-mail inválido.");
  }
  if (senha.length === 0 || senha.length > 200) throw new Error("Senha inválida.");
  return { email: emailNormalizado, senha };
}

export const authRouter = router({
  entrar: publicProcedure.input(lerEntradaLogin).mutation(async ({ ctx, input }) => {
    try {
      const usuario = await autenticar(ctx.prisma, input.email, input.senha);
      if (!usuario) throw new TRPCError({ code: "UNAUTHORIZED", message: MENSAGEM_FALHA_LOGIN });
      const { token } = await criarSessao(ctx.prisma, usuario.id, { segredo: ctx.segredo, agora: ctx.agora });
      ctx.resHeaders.append("Set-Cookie", cookieDeSessao(token, ctx.producao));
      return usuario;
    } catch (erro) {
      if (erro instanceof TRPCError) throw erro;
      // Registra só o tipo do erro: a mensagem do banco pode trazer host ou usuário.
      console.error("auth.entrar: falha interna", erro instanceof Error ? erro.name : "erro desconhecido");
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: MENSAGEM_INDISPONIVEL });
    }
  }),

  eu: publicProcedure.query(({ ctx }) =>
    usuarioDaSessao(ctx.prisma, ctx.token, { segredo: ctx.segredo, agora: ctx.agora }),
  ),

  sair: publicProcedure.mutation(async ({ ctx }) => {
    if (ctx.token) await revogarSessao(ctx.prisma, ctx.token, { segredo: ctx.segredo, agora: ctx.agora });
    ctx.resHeaders.append("Set-Cookie", cookieLimpo(ctx.producao));
    return { ok: true };
  }),
});
