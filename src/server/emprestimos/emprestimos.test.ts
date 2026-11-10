import { TRPCError } from "@trpc/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { criarSessao } from "../auth/sessao";
import { db } from "../db";
import { appRouter } from "../trpc/routers";
import type { Contexto } from "../trpc/trpc";
import { listarEquipamentos } from "../equipamentos/catalogo";
import { adicionarDiasUteis } from "./calendario";
import {
  LIMITE_EMPRESTIMOS,
  MENSAGENS_RECUSA,
  RecusaEmprestimo,
  contarEmprestimosAbertos,
  listarEmprestimosAbertos,
  solicitarEmprestimo,
} from "./servico";

const SEGREDO = "segredo-de-teste-com-mais-de-32-caracteres-aaaaaaaa";
const EMAIL_A = "emp-a@example.invalid";
const EMAIL_B = "emp-b@example.invalid";
const AGORA = new Date("2026-11-10T15:00:00Z"); // terca, 12:00 em Sao Paulo
const relogio = () => AGORA;

let idA = 0;
let idB = 0;

const equip = (n: number) => `EMPT-${String(n).padStart(4, "0")}`;

async function criarEquipamento(n: number, situacao: "disponivel" | "manutencao" | "emprestado" = "disponivel") {
  return db.equipamento.create({
    data: { patrimonio: equip(n), nome: `Equipamento de teste ${n}`, categoria: "notebook", situacao, imagemArquivo: `${equip(n)}.jpg` },
  });
}

async function codigoDaRecusa(promessa: Promise<unknown>) {
  try {
    await promessa;
  } catch (erro) {
    if (erro instanceof RecusaEmprestimo) return erro.codigo;
    throw erro;
  }
  return null;
}

async function limpar() {
  await db.emprestimo.deleteMany({ where: { usuario: { email: { in: [EMAIL_A, EMAIL_B] } } } });
  await db.sessao.deleteMany({ where: { usuario: { email: { in: [EMAIL_A, EMAIL_B] } } } });
  await db.equipamento.deleteMany({ where: { patrimonio: { startsWith: "EMPT-" } } });
}

describe("emprestimos: regras de solicitar (PostgreSQL local)", () => {
  beforeAll(async () => {
    await limpar();
    await db.usuario.deleteMany({ where: { email: { in: [EMAIL_A, EMAIL_B] } } });
    const [a, b] = await Promise.all(
      [EMAIL_A, EMAIL_B].map((email) => db.usuario.create({ data: { email, nome: email, papel: "colaborador", senhaHash: "x" } })),
    );
    idA = a.id;
    idB = b.id;
  });

  beforeEach(limpar);

  afterAll(async () => {
    await limpar();
    await db.usuario.deleteMany({ where: { email: { in: [EMAIL_A, EMAIL_B] } } });
    await db.$disconnect();
  });

  it("EMP-03/04: cria o emprestimo, tira o item do disponivel e calcula a devolucao em 14 dias uteis", async () => {
    await criarEquipamento(1);

    const resultado = await solicitarEmprestimo(db, idA, equip(1), relogio);

    expect(resultado.devolucaoPrevista).toBe("2026-12-01");
    expect(resultado.devolucaoPrevista).toBe(adicionarDiasUteis("2026-11-10", 14));
    expect((await db.equipamento.findUniqueOrThrow({ where: { patrimonio: equip(1) } })).situacao).toBe("emprestado");
    const linha = await db.emprestimo.findFirstOrThrow({ where: { usuarioId: idA } });
    expect(linha.devolvidoEm).toBeNull();
    expect(linha.devolucaoPrevistaEm.toISOString().slice(0, 10)).toBe("2026-12-01");
    expect(linha.solicitadoEm.toISOString()).toBe(AGORA.toISOString());
  });

  it("EMP-05: manutencao e emprestado sao recusados, e inexistente tambem; nada muda", async () => {
    await criarEquipamento(1, "manutencao");
    await criarEquipamento(2, "emprestado");

    expect(await codigoDaRecusa(solicitarEmprestimo(db, idA, equip(1), relogio))).toBe("MANUTENCAO");
    expect(await codigoDaRecusa(solicitarEmprestimo(db, idA, equip(2), relogio))).toBe("INDISPONIVEL");
    expect(await codigoDaRecusa(solicitarEmprestimo(db, idA, "EMPT-9999", relogio))).toBe("NAO_ENCONTRADO");

    expect(await db.emprestimo.count({ where: { usuarioId: idA } })).toBe(0);
    expect((await db.equipamento.findUniqueOrThrow({ where: { patrimonio: equip(1) } })).situacao).toBe("manutencao");
  });

  it("EMP-06: com 2 emprestimos em aberto aceita o 3o; com 3 recusa (LIMITE)", async () => {
    for (const n of [1, 2, 3, 4]) await criarEquipamento(n);

    await solicitarEmprestimo(db, idA, equip(1), relogio);
    await solicitarEmprestimo(db, idA, equip(2), relogio);
    await solicitarEmprestimo(db, idA, equip(3), relogio);
    expect(await contarEmprestimosAbertos(db, idA)).toBe(LIMITE_EMPRESTIMOS);

    expect(await codigoDaRecusa(solicitarEmprestimo(db, idA, equip(4), relogio))).toBe("LIMITE");
    expect((await db.equipamento.findUniqueOrThrow({ where: { patrimonio: equip(4) } })).situacao).toBe("disponivel");
  });

  it("EMP-06: emprestimo ja devolvido nao conta no limite", async () => {
    for (const n of [1, 2, 3, 4]) await criarEquipamento(n);
    for (const n of [1, 2, 3]) await solicitarEmprestimo(db, idA, equip(n), relogio);
    await db.emprestimo.updateMany({ where: { usuarioId: idA }, data: { devolvidoEm: AGORA } });

    await expect(solicitarEmprestimo(db, idA, equip(4), relogio)).resolves.toBeDefined();
  });

  it("EMP-07: atraso recusa (ATRASO); vence hoje ou no futuro nao e atraso", async () => {
    const [e1, e2, e3] = await Promise.all([criarEquipamento(1, "emprestado"), criarEquipamento(2, "emprestado"), criarEquipamento(3)]);
    await criarEquipamento(4);
    const data = (iso: string) => new Date(`${iso}T00:00:00Z`);

    // vence hoje (10/11): nao e atraso
    await db.emprestimo.create({ data: { usuarioId: idA, equipamentoId: e1.id, solicitadoEm: AGORA, devolucaoPrevistaEm: data("2026-11-10") } });
    await expect(solicitarEmprestimo(db, idA, equip(3), relogio)).resolves.toBeDefined();

    // venceu ontem (09/11): atraso para o usuario B
    await db.emprestimo.create({ data: { usuarioId: idB, equipamentoId: e2.id, solicitadoEm: AGORA, devolucaoPrevistaEm: data("2026-11-09") } });
    expect(await codigoDaRecusa(solicitarEmprestimo(db, idB, equip(4), relogio))).toBe("ATRASO");
    expect(e3.id).toBeGreaterThan(0);
  });

  it("EMP-07: o atraso e conferido pelo dia de Sao Paulo, nao pelo de UTC", async () => {
    const e1 = await criarEquipamento(1, "emprestado");
    await criarEquipamento(2);
    await db.emprestimo.create({
      data: { usuarioId: idA, equipamentoId: e1.id, solicitadoEm: AGORA, devolucaoPrevistaEm: new Date("2026-11-10T00:00:00Z") },
    });

    // 01:30 UTC de 11/11 ainda e 10/11 em SP: o emprestimo que vence em 10/11 nao esta atrasado
    await expect(solicitarEmprestimo(db, idA, equip(2), () => new Date("2026-11-11T01:30:00Z"))).resolves.toBeDefined();
  });

  it("a situacao do item e verificada antes do limite e do atraso", async () => {
    for (const n of [1, 2, 3]) await criarEquipamento(n);
    await criarEquipamento(4, "manutencao");
    for (const n of [1, 2, 3]) await solicitarEmprestimo(db, idA, equip(n), relogio);

    expect(await codigoDaRecusa(solicitarEmprestimo(db, idA, equip(4), relogio))).toBe("MANUTENCAO");
  });

  it("EMP-08: dois usuarios pedindo o mesmo item ao mesmo tempo criam um so emprestimo", async () => {
    await criarEquipamento(1);

    const resultados = await Promise.allSettled([
      solicitarEmprestimo(db, idA, equip(1), relogio),
      solicitarEmprestimo(db, idB, equip(1), relogio),
    ]);

    expect(resultados.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    const recusada = resultados.find((r) => r.status === "rejected") as PromiseRejectedResult;
    expect((recusada.reason as RecusaEmprestimo).codigo).toBe("INDISPONIVEL");
    expect(await db.emprestimo.count({ where: { equipamento: { patrimonio: equip(1) } } })).toBe(1);
  });

  it("EMP-08: o mesmo usuario com 2 em aberto pedindo 3 itens ao mesmo tempo fica so com mais 1", async () => {
    for (const n of [1, 2, 3, 4, 5]) await criarEquipamento(n);
    await solicitarEmprestimo(db, idA, equip(1), relogio);
    await solicitarEmprestimo(db, idA, equip(2), relogio);

    const resultados = await Promise.allSettled([3, 4, 5].map((n) => solicitarEmprestimo(db, idA, equip(n), relogio)));

    expect(resultados.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(resultados.filter((r) => r.status === "rejected").every((r) => (r.reason as RecusaEmprestimo).codigo === "LIMITE")).toBe(true);
    expect(await contarEmprestimosAbertos(db, idA)).toBe(3);
    expect(await db.equipamento.count({ where: { patrimonio: { startsWith: "EMPT-" }, situacao: "emprestado" } })).toBe(3);
  });

  it("EMP-09: cada usuario ve so os proprios emprestimos em aberto, com a devolucao prevista", async () => {
    for (const n of [1, 2, 3]) await criarEquipamento(n);
    await solicitarEmprestimo(db, idA, equip(1), relogio);
    await solicitarEmprestimo(db, idA, equip(2), relogio);
    await solicitarEmprestimo(db, idB, equip(3), relogio);

    const deA = await listarEmprestimosAbertos(db, idA, relogio);
    const deB = await listarEmprestimosAbertos(db, idB, relogio);

    expect(deA.map((e) => e.patrimonio).sort()).toEqual([equip(1), equip(2)]);
    expect(deB.map((e) => e.patrimonio)).toEqual([equip(3)]);
    expect(deA[0]).toEqual(expect.objectContaining({ devolucaoPrevista: "2026-12-01", emAtraso: false, categoria: "Notebooks" }));
    expect(Object.keys(deA[0]).sort()).toEqual(["categoria", "devolucaoPrevista", "emAtraso", "nome", "patrimonio", "solicitadoEm"]);
  });

  it("EMP-09: sem emprestimos a lista vem vazia", async () => {
    expect(await listarEmprestimosAbertos(db, idA, relogio)).toEqual([]);
    expect(await contarEmprestimosAbertos(db, idA)).toBe(0);
  });

  it("EMP-09: um emprestimo vencido aparece marcado como atraso", async () => {
    const e1 = await criarEquipamento(1, "emprestado");
    await db.emprestimo.create({
      data: { usuarioId: idA, equipamentoId: e1.id, solicitadoEm: AGORA, devolucaoPrevistaEm: new Date("2026-11-09T00:00:00Z") },
    });

    const [item] = await listarEmprestimosAbertos(db, idA, relogio);

    expect(item.emAtraso).toBe(true);
  });
});

describe("emprestimos: procedimentos tRPC (autorizacao e erros)", () => {
  async function contextoDe(usuarioId: number | null): Promise<Contexto> {
    const token = usuarioId === null ? undefined : (await criarSessao(db, usuarioId, { segredo: SEGREDO, agora: relogio })).token;
    return { prisma: db, token, resHeaders: new Headers(), segredo: SEGREDO, agora: relogio, producao: false };
  }

  beforeAll(async () => {
    await limpar();
    await db.usuario.deleteMany({ where: { email: { in: [EMAIL_A, EMAIL_B] } } });
    const [a, b] = await Promise.all(
      [EMAIL_A, EMAIL_B].map((email) => db.usuario.create({ data: { email, nome: email, papel: "colaborador", senhaHash: "x" } })),
    );
    idA = a.id;
    idB = b.id;
  });
  beforeEach(limpar);
  afterAll(async () => {
    await limpar();
    await db.usuario.deleteMany({ where: { email: { in: [EMAIL_A, EMAIL_B] } } });
    await db.$disconnect();
  });

  async function codigo(promessa: Promise<unknown>) {
    try {
      await promessa;
    } catch (erro) {
      if (erro instanceof TRPCError) return erro;
      throw erro;
    }
    return null;
  }

  it("EMP-11: anonimo recebe UNAUTHORIZED em listar, solicitar e meus", async () => {
    const caller = appRouter.createCaller(await contextoDe(null));
    expect((await codigo(caller.equipamentos.listar()))?.code).toBe("UNAUTHORIZED");
    expect((await codigo(caller.emprestimos.solicitar({ patrimonio: equip(1) })))?.code).toBe("UNAUTHORIZED");
    expect((await codigo(caller.emprestimos.meus()))?.code).toBe("UNAUTHORIZED");
  });

  it("EMP-11: patrimonio invalido e BAD_REQUEST e inexistente e NOT_FOUND", async () => {
    const caller = appRouter.createCaller(await contextoDe(idA));
    for (const patrimonio of ["", " ", "a b", "x".repeat(60), "<script>"]) {
      expect((await codigo(caller.emprestimos.solicitar({ patrimonio })))?.code).toBe("BAD_REQUEST");
    }
    expect((await codigo(caller.emprestimos.solicitar({ patrimonio: "EMPT-9999" })))?.code).toBe("NOT_FOUND");
    expect((await codigo(caller.emprestimos.solicitar({} as never)))?.code).toBe("BAD_REQUEST");
  });

  it("EMP-03/12: solicitar pelo roteador cria o emprestimo; a recusa traz a mensagem fixa e o motivo", async () => {
    await criarEquipamento(1);
    await criarEquipamento(2, "manutencao");
    const caller = appRouter.createCaller(await contextoDe(idA));

    const ok = await caller.emprestimos.solicitar({ patrimonio: equip(1) });
    expect(ok.devolucaoPrevista).toBe("2026-12-01");

    const recusa = await codigo(caller.emprestimos.solicitar({ patrimonio: equip(2) }));
    expect(recusa?.code).toBe("PRECONDITION_FAILED");
    expect(recusa?.message).toBe(MENSAGENS_RECUSA.MANUTENCAO);
    expect((recusa?.cause as RecusaEmprestimo).codigo).toBe("MANUTENCAO");
  });

  it("EMP-12: a recusa de item emprestado nao revela quem esta com ele", async () => {
    await criarEquipamento(1);
    await appRouter.createCaller(await contextoDe(idB)).emprestimos.solicitar({ patrimonio: equip(1) });

    const recusa = await codigo(appRouter.createCaller(await contextoDe(idA)).emprestimos.solicitar({ patrimonio: equip(1) }));

    expect(recusa?.message).toBe(MENSAGENS_RECUSA.INDISPONIVEL);
    expect(JSON.stringify(recusa?.message)).not.toContain("emp-b");
  });

  it("EMP-09: meus devolve so os do usuario logado", async () => {
    await criarEquipamento(1);
    await criarEquipamento(2);
    await appRouter.createCaller(await contextoDe(idA)).emprestimos.solicitar({ patrimonio: equip(1) });
    await appRouter.createCaller(await contextoDe(idB)).emprestimos.solicitar({ patrimonio: equip(2) });

    const meusA = await appRouter.createCaller(await contextoDe(idA)).emprestimos.meus();

    expect(meusA.map((e) => e.patrimonio)).toEqual([equip(1)]);
  });

  it("EMP-01/02: listar traz os equipamentos com a URL publica da imagem montada pela base", async () => {
    await criarEquipamento(1);

    const semBase = (await listarEquipamentos(db)).find((e) => e.patrimonio === equip(1));
    const comBase = (await listarEquipamentos(db, "https://exemplo.supabase.co/storage/v1/object/public/equipamentos/")).find(
      (e) => e.patrimonio === equip(1),
    );

    expect(semBase).toEqual({ patrimonio: equip(1), nome: "Equipamento de teste 1", categoria: "Notebooks", estado: "disponivel", imagemUrl: null });
    expect(comBase?.imagemUrl).toBe(`https://exemplo.supabase.co/storage/v1/object/public/equipamentos/${equip(1)}.jpg`);
    expect(Object.keys(semBase!).sort()).toEqual(["categoria", "estado", "imagemUrl", "nome", "patrimonio"]);
  });
});
