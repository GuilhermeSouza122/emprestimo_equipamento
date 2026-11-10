import { router } from "../trpc";
import { authRouter } from "./auth";
import { operacoesRouter } from "./operacoes";

export const appRouter = router({
  auth: authRouter,
  operacoes: operacoesRouter,
});

export type AppRouter = typeof appRouter;
