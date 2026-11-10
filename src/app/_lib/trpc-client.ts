import { createTRPCClient, httpLink } from "@trpc/client";

// Só o TIPO do roteador vem do servidor; nenhum código de servidor entra no bundle.
import type { AppRouter } from "../../server/trpc/routers";

export const trpc = createTRPCClient<AppRouter>({
  links: [httpLink({ url: "/api/trpc" })],
});
