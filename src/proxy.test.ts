import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { config, proxy } from "./proxy";

const pedido = (caminho: string, cookie?: string) =>
  new NextRequest(`http://localhost:3000${caminho}`, { headers: cookie ? { cookie } : {} });

describe("proxy (checagem otimista de sessao)", () => {
  it("AUTH-05: sem cookie de sessao, rotas protegidas redirecionam para /login", () => {
    for (const caminho of ["/catalogo", "/catalogo/TI-0001", "/meus-emprestimos", "/operacoes/emprestimos", "/operacoes/equipamentos/novo"]) {
      const resposta = proxy(pedido(caminho));
      expect(resposta.status).toBe(307);
      expect(new URL(resposta.headers.get("location")!).pathname).toBe("/login");
    }
  });

  it("com cookie de sessao deixa a requisicao seguir (a validade real e conferida no servidor)", () => {
    const resposta = proxy(pedido("/catalogo", "sessao=qualquer-valor"));
    expect(resposta.headers.get("location")).toBeNull();
    expect(resposta.status).toBe(200);
  });

  it("cookie vazio conta como ausente", () => {
    expect(proxy(pedido("/catalogo", "sessao=")).status).toBe(307);
  });

  it("o matcher cobre as rotas protegidas e nao cobre /, /login nem /health", () => {
    expect(config.matcher).toEqual(["/catalogo/:path*", "/meus-emprestimos", "/operacoes/:path*"]);
  });
});
