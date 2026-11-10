import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Checagem OTIMISTA (Next.js 16, "Proxy"): só vê se existe cookie de sessão e manda o
// anônimo para /login. Não valida a sessão nem o papel; isso é feito no servidor, em
// cada página (src/server/auth/dal.ts) e em cada procedimento tRPC.
export function proxy(request: NextRequest) {
  if (!request.cookies.get("sessao")?.value) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/catalogo/:path*", "/meus-emprestimos", "/operacoes/:path*"],
};
