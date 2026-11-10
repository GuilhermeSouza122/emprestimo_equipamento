import type { PrismaClient } from "@prisma/client";

export type CategoriaRotulo = "Notebooks" | "Monitores" | "Cabos" | "Câmeras";
export type SituacaoEquipamento = "disponivel" | "emprestado" | "manutencao";

/** O que o catálogo mostra. Nunca inclui quem está com o equipamento. */
export type EquipamentoCatalogo = {
  patrimonio: string;
  nome: string;
  categoria: CategoriaRotulo;
  estado: SituacaoEquipamento;
  imagemUrl: string | null;
};

export const ROTULO_CATEGORIA: Record<string, CategoriaRotulo> = {
  notebook: "Notebooks",
  monitor: "Monitores",
  cabo: "Cabos",
  camera: "Câmeras",
};

/** URL pública da imagem: `EQUIPAMENTOS_IMAGENS_BASE_URL` + "/" + arquivo. Sem base, não há imagem. */
export function urlDaImagem(base: string | undefined, arquivo: string): string | null {
  const limpa = base?.trim().replace(/\/+$/, "");
  return limpa ? `${limpa}/${encodeURIComponent(arquivo)}` : null;
}

type Linha = { patrimonio: string; nome: string; categoria: string; situacao: SituacaoEquipamento; imagemArquivo: string };

const paraCatalogo = (linha: Linha, base: string | undefined): EquipamentoCatalogo => ({
  patrimonio: linha.patrimonio,
  nome: linha.nome,
  categoria: ROTULO_CATEGORIA[linha.categoria],
  estado: linha.situacao,
  imagemUrl: urlDaImagem(base, linha.imagemArquivo),
});

export async function listarEquipamentos(prisma: PrismaClient, base?: string): Promise<EquipamentoCatalogo[]> {
  const linhas = await prisma.equipamento.findMany({ orderBy: { patrimonio: "asc" } });
  return linhas.map((linha) => paraCatalogo(linha, base));
}

export async function buscarEquipamento(prisma: PrismaClient, patrimonio: string, base?: string): Promise<EquipamentoCatalogo | null> {
  const linha = await prisma.equipamento.findUnique({ where: { patrimonio } });
  return linha ? paraCatalogo(linha, base) : null;
}
