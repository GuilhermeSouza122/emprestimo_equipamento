import { operacoesProcedure, router } from "../trpc";

export const operacoesRouter = router({
  /** Ponto de verificação de acesso: os procedimentos de Operações usarão `operacoesProcedure`. */
  acesso: operacoesProcedure.query(({ ctx }) => ({ papel: ctx.usuario.papel })),
});
