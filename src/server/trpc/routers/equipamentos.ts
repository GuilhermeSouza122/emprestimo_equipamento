import { listarEquipamentos } from "../../equipamentos/catalogo";
import { protectedProcedure, router } from "../trpc";

export const equipamentosRouter = router({
  listar: protectedProcedure.query(({ ctx }) => listarEquipamentos(ctx.prisma, process.env.EQUIPAMENTOS_IMAGENS_BASE_URL)),
});
