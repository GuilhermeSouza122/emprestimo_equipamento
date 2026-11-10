import { afterEach, describe, expect, it, vi } from "vitest";

import { criarContexto } from "./contexto";

const SEGREDO_VALIDO = "segredo-de-teste-com-mais-de-32-caracteres-aaaaaaaa";
const requisicao = (cookie?: string) => new Request("http://localhost:3000/api/trpc", { headers: cookie ? { cookie } : {} });

describe("criarContexto (SESSION_SECRET e cookie)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("sem SESSION_SECRET falha e registra o motivo no log", () => {
    vi.stubEnv("SESSION_SECRET", "");
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() => criarContexto(requisicao(), new Headers())).toThrow(/SESSION_SECRET/);

    expect(log).toHaveBeenCalledTimes(1);
    expect(String(log.mock.calls[0][1])).toContain("SESSION_SECRET ausente");
  });

  it("em producao com segredo fraco falha, registra o motivo e nunca o valor", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SESSION_SECRET", "valor-secreto-curto");
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() => criarContexto(requisicao("sessao=abc"), new Headers())).toThrow(/SESSION_SECRET/);

    expect(String(log.mock.calls[0][1])).toContain("fraca");
    expect(JSON.stringify(log.mock.calls)).not.toContain("valor-secreto-curto");
  });

  it("com segredo valido monta o contexto e le o token so do cookie sessao", () => {
    vi.stubEnv("SESSION_SECRET", SEGREDO_VALIDO);

    const contexto = criarContexto(requisicao("outro=1; sessao=token-de-teste; mais=2"), new Headers());

    expect(contexto.token).toBe("token-de-teste");
    expect(contexto.producao).toBe(false);
    expect(criarContexto(requisicao("outro=1"), new Headers()).token).toBeUndefined();
  });
});
