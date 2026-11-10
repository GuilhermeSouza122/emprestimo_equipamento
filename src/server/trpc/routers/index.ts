import { router } from "../trpc";
import { authRouter } from "./auth";
import { emprestimosRouter } from "./emprestimos";
import { equipamentosRouter } from "./equipamentos";
import { operacoesRouter } from "./operacoes";

export const appRouter = router({
  auth: authRouter,
  equipamentos: equipamentosRouter,
  emprestimos: emprestimosRouter,
  operacoes: operacoesRouter,
});

export type AppRouter = typeof appRouter;
