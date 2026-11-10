import type { PrismaClient } from "@prisma/client";

export type EquipamentoSeed = {
  patrimonio: string;
  nome: string;
  categoria: string;
  situacao: string;
  imagemArquivo: string;
};

export type UsuarioSeed = {
  email: string;
  nome: string;
  papel: "colaborador" | "operacoes";
};

export type ResultadoSeed = {
  equipamentos: number;
  equipamentosCriados: number;
  usuarioCriado: boolean;
  contaTesteCriada: boolean;
};

export type ContaTesteSeed = { email: string; senha: string | undefined; nome?: string };

export const CATEGORIAS: readonly string[];
export const SITUACOES: readonly string[];
export const PROFESSOR: UsuarioSeed;

export function lerEquipamentos(caminho: string): Array<Record<string, unknown>>;

export function validarEquipamentos(
  lista: Array<Record<string, unknown>>,
  existeImagem: (arquivo: string) => boolean,
): EquipamentoSeed[];

export function validarDestino(databaseUrl: string | undefined, opcoes?: { producao?: boolean }): string;

export function executarSeed(
  prisma: PrismaClient,
  opcoes: {
    equipamentos: Array<Record<string, unknown>>;
    senha: string | undefined;
    existeImagem: (arquivo: string) => boolean;
    usuario?: UsuarioSeed;
    contaTeste?: ContaTesteSeed;
  },
): Promise<ResultadoSeed>;
