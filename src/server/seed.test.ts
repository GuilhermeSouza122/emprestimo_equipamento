import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

import { afterAll, beforeEach, describe, expect, it } from "vitest";

import {
  PROFESSOR,
  executarSeed,
  lerEquipamentos,
  validarDestino,
  validarEquipamentos,
} from "../../prisma/seed-lib.mjs";
import { db } from "./db";

const raiz = process.cwd();
const imagemExiste = (arquivo: string) => existsSync(path.join(raiz, "data", "imagens", arquivo));

describe("seed: dados da pratica (data/equipamentos.json)", () => {
  const lista = validarEquipamentos(lerEquipamentos(path.join(raiz, "data", "equipamentos.json")), imagemExiste);

  it("DADOS-02: tem os 12 equipamentos, 4 notebooks, 3 monitores, 3 cabos e 2 cameras", () => {
    expect(lista).toHaveLength(12);
    const por = (categoria: string) => lista.filter((e) => e.categoria === categoria).length;
    expect([por("notebook"), por("monitor"), por("cabo"), por("camera")]).toEqual([4, 3, 3, 2]);
  });

  it("DADOS-02: TI-0004, TI-0007 e TI-0010 em manutencao e os outros 9 disponiveis", () => {
    const manutencao = lista.filter((e) => e.situacao === "manutencao").map((e) => e.patrimonio);
    expect(manutencao).toEqual(["TI-0004", "TI-0007", "TI-0010"]);
    expect(lista.filter((e) => e.situacao === "disponivel")).toHaveLength(9);
  });

  it("DADOS-07: cada equipamento aponta para o arquivo do patrimonio, que existe", () => {
    for (const equipamento of lista) {
      expect(equipamento.imagemArquivo).toBe(`${equipamento.patrimonio}.jpg`);
      expect(imagemExiste(equipamento.imagemArquivo)).toBe(true);
    }
  });
});

describe("seed: destino do banco", () => {
  it("DADOS-05: aceita banco local e devolve so host, porta e nome (sem credenciais)", () => {
    const descricao = validarDestino("postgresql://usuario:segredo@localhost:55432/meu_banco?schema=public");
    expect(descricao).toContain("localhost");
    expect(descricao).toContain("meu_banco");
    expect(descricao).not.toContain("segredo");
    expect(descricao).not.toContain("usuario");
    expect(() => validarDestino("postgresql://u:p@127.0.0.1:5432/x")).not.toThrow();
    expect(() => validarDestino("postgresql://u:p@db:5432/x")).not.toThrow();
  });

  it("DADOS-05: recusa banco remoto sem --producao e aceita com ele", () => {
    const remoto = "postgresql://u:senha-secreta@db.exemplo.supabase.co:5432/postgres";
    expect(() => validarDestino(remoto)).toThrow(/--producao/);
    let mensagem = "";
    try {
      validarDestino(remoto);
    } catch (erro) {
      mensagem = (erro as Error).message;
    }
    expect(mensagem).not.toContain("senha-secreta");
    expect(() => validarDestino(remoto, { producao: true })).not.toThrow();
  });

  it("DADOS-05: o comando recusa banco remoto sem --producao, sem conectar e sem vazar a senha", () => {
    const resultado = spawnSync(process.execPath, ["prisma/seed.mjs"], {
      cwd: raiz,
      encoding: "utf8",
      env: {
        ...process.env,
        DATABASE_URL: "postgresql://usuario-x:senha-secreta-cli@db.exemplo.invalid:5432/x",
        SEED_PROFESSOR_PASSWORD: "senha-falsa-do-teste",
      },
    });
    const saida = `${resultado.stdout}${resultado.stderr}`;

    expect(resultado.status).toBe(1);
    expect(saida).toContain("--producao");
    expect(saida).not.toContain("senha-secreta-cli");
    expect(saida).not.toContain("usuario-x");
    expect(saida).not.toContain("senha-falsa-do-teste");
  });

  it("recusa DATABASE_URL ausente ou invalida", () => {
    expect(() => validarDestino(undefined)).toThrow();
    expect(() => validarDestino("isto nao e uma url")).toThrow();
  });
});

describe("seed: gravacao no banco (PostgreSQL local)", () => {
  const usuarioTeste = { email: "seed-teste@example.invalid", nome: "Usuario de Teste", papel: "colaborador" as const };
  const contaExtra = { email: "seed-conta-extra@example.invalid", senha: "senha-da-conta-extra" };
  const lista = [
    { patrimonio: "TST-0001", nome: "Notebook de teste", categoria: "notebook", situacao: "disponivel", busca: "ignorada" },
    { patrimonio: "TST-0002", nome: "Monitor de teste", categoria: "monitor", situacao: "manutencao" },
  ];
  const opcoes = (extra: Record<string, unknown> = {}) => ({
    equipamentos: lista,
    senha: "senha-de-teste-123",
    existeImagem: () => true,
    usuario: usuarioTeste,
    ...extra,
  });

  const limpar = async () => {
    await db.equipamento.deleteMany({ where: { patrimonio: { startsWith: "TST-" } } });
    await db.usuario.deleteMany({ where: { email: { in: [usuarioTeste.email, contaExtra.email] } } });
  };

  beforeEach(limpar);
  afterAll(async () => {
    await limpar();
    await db.$disconnect();
  });

  it("DADOS-02/03: cria os equipamentos e um colaborador com hash scrypt, nunca a senha", async () => {
    const resultado = await executarSeed(db, opcoes());

    expect(resultado).toEqual({ equipamentos: 2, equipamentosCriados: 2, usuarioCriado: true, contaTesteCriada: false });
    const equipamentos = await db.equipamento.findMany({ where: { patrimonio: { startsWith: "TST-" } }, orderBy: { patrimonio: "asc" } });
    expect(equipamentos.map((e) => [e.patrimonio, e.categoria, e.situacao, e.imagemArquivo])).toEqual([
      ["TST-0001", "notebook", "disponivel", "TST-0001.jpg"],
      ["TST-0002", "monitor", "manutencao", "TST-0002.jpg"],
    ]);
    const usuario = await db.usuario.findUniqueOrThrow({ where: { email: usuarioTeste.email } });
    expect(usuario.papel).toBe("colaborador");
    expect(usuario.senhaHash.startsWith("scrypt$")).toBe(true);
    expect(usuario.senhaHash).not.toContain("senha-de-teste-123");
  });

  it("DADOS-03: o seed nao cria nenhum emprestimo (a tabela existe desde a Spec 006)", async () => {
    await executarSeed(db, opcoes({ contaTeste: contaExtra }));

    expect(await db.emprestimo.count({ where: { usuario: { email: { in: [usuarioTeste.email, contaExtra.email] } } } })).toBe(0);
    expect(await db.emprestimo.count({ where: { equipamento: { patrimonio: { startsWith: "TST-" } } } })).toBe(0);
  });

  it("DADOS-04: repetir o seed nao duplica nada nem troca o hash do usuario", async () => {
    await executarSeed(db, opcoes());
    const antes = await db.usuario.findUniqueOrThrow({ where: { email: usuarioTeste.email } });

    const segundo = await executarSeed(db, opcoes());
    await executarSeed(db, opcoes());

    expect(segundo).toEqual({ equipamentos: 2, equipamentosCriados: 0, usuarioCriado: false, contaTesteCriada: false });
    expect(await db.equipamento.count({ where: { patrimonio: { startsWith: "TST-" } } })).toBe(2);
    expect(await db.usuario.count({ where: { email: usuarioTeste.email } })).toBe(1);
    const depois = await db.usuario.findUniqueOrThrow({ where: { email: usuarioTeste.email } });
    expect(depois.senhaHash).toBe(antes.senhaHash);
  });

  it("DADOS-04: nao altera a situacao de equipamento ja cadastrado, mas atualiza o nome", async () => {
    await executarSeed(db, opcoes());
    await db.equipamento.update({ where: { patrimonio: "TST-0001" }, data: { situacao: "emprestado" } });

    await executarSeed(db, opcoes({ equipamentos: [{ ...lista[0], nome: "Nome corrigido" }, lista[1]] }));

    const equipamento = await db.equipamento.findUniqueOrThrow({ where: { patrimonio: "TST-0001" } });
    expect(equipamento.situacao).toBe("emprestado");
    expect(equipamento.nome).toBe("Nome corrigido");
  });

  it("senha ausente ou vazia aborta antes de gravar qualquer dado", async () => {
    for (const senha of [undefined, "", "   "]) {
      await expect(executarSeed(db, opcoes({ senha }))).rejects.toThrow(/SEED_PROFESSOR_PASSWORD/);
    }
    expect(await db.equipamento.count({ where: { patrimonio: { startsWith: "TST-" } } })).toBe(0);
    expect(await db.usuario.count({ where: { email: usuarioTeste.email } })).toBe(0);
  });

  it("dados invalidos abortam antes de gravar, mesmo o primeiro item valido", async () => {
    const casos: Array<[string, unknown[]]> = [
      ["categoria", [lista[0], { ...lista[1], categoria: "tablet" }]],
      ["situacao", [lista[0], { ...lista[1], situacao: "perdido" }]],
      ["patrimonio repetido", [lista[0], { ...lista[1], patrimonio: "TST-0001" }]],
      ["nome vazio", [lista[0], { ...lista[1], nome: "" }]],
    ];
    for (const [, equipamentos] of casos) {
      await expect(executarSeed(db, opcoes({ equipamentos }))).rejects.toThrow();
    }
    await expect(executarSeed(db, opcoes({ existeImagem: () => false }))).rejects.toThrow(/imagem/i);
    expect(await db.equipamento.count({ where: { patrimonio: { startsWith: "TST-" } } })).toBe(0);
    expect(await db.usuario.count({ where: { email: usuarioTeste.email } })).toBe(0);
  });

  it("DADOS-09: a conta de teste opcional e criada como colaborador, com hash e sem tocar no professor", async () => {
    const resultado = await executarSeed(db, opcoes({ contaTeste: { ...contaExtra, email: ` ${contaExtra.email.toUpperCase()} ` } }));

    expect(resultado.contaTesteCriada).toBe(true);
    const conta = await db.usuario.findUniqueOrThrow({ where: { email: contaExtra.email } });
    expect(conta.papel).toBe("colaborador");
    expect(conta.senhaHash.startsWith("scrypt$")).toBe(true);
    expect(conta.senhaHash).not.toContain(contaExtra.senha);
    expect(await db.usuario.count({ where: { email: usuarioTeste.email } })).toBe(1);
  });

  it("DADOS-09: repetir o seed nao duplica nem troca a senha da conta de teste", async () => {
    await executarSeed(db, opcoes({ contaTeste: contaExtra }));
    const antes = await db.usuario.findUniqueOrThrow({ where: { email: contaExtra.email } });

    const segundo = await executarSeed(db, opcoes({ contaTeste: { ...contaExtra, senha: "outra-senha-qualquer" } }));

    expect(segundo.contaTesteCriada).toBe(false);
    expect(await db.usuario.count({ where: { email: contaExtra.email } })).toBe(1);
    expect((await db.usuario.findUniqueOrThrow({ where: { email: contaExtra.email } })).senhaHash).toBe(antes.senhaHash);
  });

  it("DADOS-09: conta de teste invalida aborta antes de gravar qualquer dado", async () => {
    const invalidas = [
      { email: "nao-e-email", senha: "x" },
      { email: contaExtra.email, senha: "" },
      { email: usuarioTeste.email, senha: "x" }, // e o mesmo e-mail do usuario principal do teste
    ];
    for (const contaTeste of invalidas.slice(0, 2)) {
      await expect(executarSeed(db, opcoes({ contaTeste }))).rejects.toThrow();
    }
    await expect(
      executarSeed(db, opcoes({ usuario: { ...usuarioTeste }, contaTeste: invalidas[2] })),
    ).rejects.toThrow(/professor/);
    expect(await db.equipamento.count({ where: { patrimonio: { startsWith: "TST-" } } })).toBe(0);
    expect(await db.usuario.count({ where: { email: { in: [usuarioTeste.email, contaExtra.email] } } })).toBe(0);
  });

  it("o usuario padrao do seed e o professor, colaborador", () => {
    expect(PROFESSOR).toEqual({ email: "marcelo.grilo@institutojef.org.br", nome: "Marcelo Grilo", papel: "colaborador" });
  });
});
