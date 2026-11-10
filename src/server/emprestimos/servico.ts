import type { PrismaClient } from "@prisma/client";

import type { Relogio } from "../auth/sessao";
import { ROTULO_CATEGORIA } from "../equipamentos/catalogo";
import type { CategoriaRotulo } from "../equipamentos/catalogo";
import { adicionarDiasUteis, dataEmSaoPaulo } from "./calendario";

export const LIMITE_EMPRESTIMOS = 3; // PRD: no máximo 3 itens ao mesmo tempo
export const PRAZO_DIAS_UTEIS = 14; // PRD: 14 dias úteis

export type CodigoRecusa = "NAO_ENCONTRADO" | "MANUTENCAO" | "INDISPONIVEL" | "ATRASO" | "LIMITE";

// Textos fixos: nunca incluem dados de outros usuários (EMP-12).
export const MENSAGENS_RECUSA: Record<CodigoRecusa, string> = {
  NAO_ENCONTRADO: "Equipamento não encontrado.",
  MANUTENCAO: "Este equipamento está em manutenção e não pode ser solicitado.",
  INDISPONIVEL: "Este equipamento não está disponível no momento.",
  ATRASO: "Você tem um empréstimo em atraso. Devolva-o para solicitar outro.",
  LIMITE: `Você já está com ${LIMITE_EMPRESTIMOS} itens. Devolva um para solicitar outro.`,
};

export class RecusaEmprestimo extends Error {
  constructor(public readonly codigo: CodigoRecusa) {
    super(MENSAGENS_RECUSA[codigo]);
    this.name = "RecusaEmprestimo";
  }
}

const isoDaData = (data: Date) => data.toISOString().slice(0, 10);
const dataDoIso = (iso: string) => new Date(`${iso}T00:00:00Z`);

export type EmprestimoCriado = { patrimonio: string; nome: string; devolucaoPrevista: string };

/**
 * Cria o empréstimo na hora (sem aprovação nem fila). Tudo numa transação:
 * - trava a linha do usuário (FOR UPDATE), então pedidos simultâneos do mesmo usuário
 *   são atendidos um de cada vez e o limite vale mesmo assim;
 * - muda o equipamento para `emprestado` só se ainda estiver `disponivel` (atualização
 *   condicional), então dois pedidos ao mesmo item criam um único empréstimo.
 * Ordem das verificações: item existe, situação do item, atraso, limite.
 */
export async function solicitarEmprestimo(
  prisma: PrismaClient,
  usuarioId: number,
  patrimonio: string,
  agora: Relogio,
): Promise<EmprestimoCriado> {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM usuarios WHERE id = ${usuarioId} FOR UPDATE`;

    const equipamento = await tx.equipamento.findUnique({ where: { patrimonio } });
    if (!equipamento) throw new RecusaEmprestimo("NAO_ENCONTRADO");
    if (equipamento.situacao === "manutencao") throw new RecusaEmprestimo("MANUTENCAO");
    if (equipamento.situacao !== "disponivel") throw new RecusaEmprestimo("INDISPONIVEL");

    const hoje = dataEmSaoPaulo(agora());
    const abertos = await tx.emprestimo.findMany({ where: { usuarioId, devolvidoEm: null }, select: { devolucaoPrevistaEm: true } });
    if (abertos.some((emprestimo) => isoDaData(emprestimo.devolucaoPrevistaEm) < hoje)) throw new RecusaEmprestimo("ATRASO");
    if (abertos.length >= LIMITE_EMPRESTIMOS) throw new RecusaEmprestimo("LIMITE");

    const reservado = await tx.equipamento.updateMany({
      where: { id: equipamento.id, situacao: "disponivel" },
      data: { situacao: "emprestado" },
    });
    if (reservado.count !== 1) throw new RecusaEmprestimo("INDISPONIVEL");

    const devolucaoPrevista = adicionarDiasUteis(hoje, PRAZO_DIAS_UTEIS);
    await tx.emprestimo.create({
      data: { usuarioId, equipamentoId: equipamento.id, solicitadoEm: agora(), devolucaoPrevistaEm: dataDoIso(devolucaoPrevista) },
    });
    return { patrimonio: equipamento.patrimonio, nome: equipamento.nome, devolucaoPrevista };
  });
}

export type EmprestimoAberto = {
  patrimonio: string;
  nome: string;
  categoria: CategoriaRotulo;
  solicitadoEm: string;
  devolucaoPrevista: string;
  emAtraso: boolean;
};

/** Só os empréstimos em aberto do usuário informado. */
export async function listarEmprestimosAbertos(prisma: PrismaClient, usuarioId: number, agora: Relogio): Promise<EmprestimoAberto[]> {
  const hoje = dataEmSaoPaulo(agora());
  const linhas = await prisma.emprestimo.findMany({
    where: { usuarioId, devolvidoEm: null },
    include: { equipamento: true },
    orderBy: [{ devolucaoPrevistaEm: "asc" }, { id: "asc" }],
  });
  return linhas.map((linha) => {
    const devolucaoPrevista = isoDaData(linha.devolucaoPrevistaEm);
    return {
      patrimonio: linha.equipamento.patrimonio,
      nome: linha.equipamento.nome,
      categoria: ROTULO_CATEGORIA[linha.equipamento.categoria],
      solicitadoEm: dataEmSaoPaulo(linha.solicitadoEm),
      devolucaoPrevista,
      emAtraso: devolucaoPrevista < hoje,
    };
  });
}

export async function contarEmprestimosAbertos(prisma: PrismaClient, usuarioId: number): Promise<number> {
  return prisma.emprestimo.count({ where: { usuarioId, devolvidoEm: null } });
}

/** Quantos itens o usuário tem em aberto e se algum está em atraso (cabeçalho e painel de solicitação). */
export async function resumoDoUsuario(prisma: PrismaClient, usuarioId: number, agora: Relogio) {
  const abertos = await listarEmprestimosAbertos(prisma, usuarioId, agora);
  return { emUso: abertos.length, emAtraso: abertos.some((emprestimo) => emprestimo.emAtraso) };
}
