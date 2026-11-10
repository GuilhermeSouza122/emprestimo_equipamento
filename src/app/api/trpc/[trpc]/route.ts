import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { criarContexto } from "../../../../server/trpc/contexto";
import { appRouter } from "../../../../server/trpc/routers";

// API de produto do ADR-001. Sem cache: cada chamada confere a sessão no banco.
export const dynamic = "force-dynamic";

function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: ({ req, resHeaders }) => criarContexto(req, resHeaders),
  });
}

export { handler as GET, handler as POST };
