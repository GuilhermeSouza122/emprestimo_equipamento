// Lógica do seed (Spec 004). Separada de seed.mjs para poder ser testada com Vitest.
// Em JavaScript porque o projeto não tem executor de TypeScript; tipos em seed-lib.d.mts.
import { readFileSync } from "node:fs";

import { hashSenha } from "../src/server/auth/senha.mjs";

export const CATEGORIAS = ["notebook", "monitor", "cabo", "camera"];
export const SITUACOES = ["disponivel", "manutencao", "emprestado"];
export const PROFESSOR = {
  email: "marcelo.grilo@institutojef.org.br",
  nome: "Marcelo Grilo",
  papel: "colaborador",
};

// "db" é o nome do serviço PostgreSQL no Docker Compose.
const HOSTS_LOCAIS = new Set(["localhost", "127.0.0.1", "[::1]", "::1", "db"]);

export function lerEquipamentos(caminho) {
  const lista = JSON.parse(readFileSync(caminho, "utf8"));
  if (!Array.isArray(lista)) throw new Error("A lista de equipamentos precisa ser um array JSON.");
  return lista;
}

const preenchido = (valor) => typeof valor === "string" && valor.trim() !== "";

export function validarEquipamentos(lista, existeImagem) {
  const erros = [];
  const vistos = new Set();
  const normalizados = [];

  lista.forEach((item, indice) => {
    const rotulo = `item ${indice + 1}${preenchido(item?.patrimonio) ? ` (${item.patrimonio})` : ""}`;
    if (!preenchido(item?.patrimonio)) erros.push(`${rotulo}: patrimônio ausente`);
    if (!preenchido(item?.nome)) erros.push(`${rotulo}: nome ausente`);
    if (!CATEGORIAS.includes(item?.categoria)) erros.push(`${rotulo}: categoria inválida`);
    if (!SITUACOES.includes(item?.situacao)) erros.push(`${rotulo}: situação inválida`);
    if (!preenchido(item?.patrimonio)) return;

    const patrimonio = item.patrimonio.trim();
    if (vistos.has(patrimonio)) erros.push(`${rotulo}: patrimônio repetido`);
    vistos.add(patrimonio);

    const imagemArquivo = `${patrimonio}.jpg`;
    if (!existeImagem(imagemArquivo)) erros.push(`${rotulo}: imagem ${imagemArquivo} não encontrada`);

    normalizados.push({
      patrimonio,
      nome: typeof item.nome === "string" ? item.nome.trim() : "",
      categoria: item.categoria,
      situacao: item.situacao,
      imagemArquivo,
    });
  });

  if (erros.length > 0) throw new Error(erros.join("; "));
  return normalizados;
}

// Devolve só host, porta e nome do banco: nunca usuário nem senha.
export function validarDestino(databaseUrl, { producao = false } = {}) {
  if (!databaseUrl) throw new Error("DATABASE_URL ausente.");
  let alvo;
  try {
    alvo = new URL(databaseUrl);
  } catch {
    throw new Error("DATABASE_URL inválida.");
  }
  const descricao = `${alvo.hostname}:${alvo.port || "5432"}/${alvo.pathname.replace(/^\//, "")}`;
  if (!HOSTS_LOCAIS.has(alvo.hostname) && !producao) {
    throw new Error(`O banco ${descricao} não é local. Para gravar nele, passe --producao conscientemente.`);
  }
  return descricao;
}

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Conta de teste opcional (Spec 004), para testar sem usar a conta do professor, que precisa
// chegar à correção com zero empréstimos. E-mail e senha vêm do ambiente, nunca do código.
function validarContaTeste(contaTeste, emailDoProfessor) {
  const email = String(contaTeste.email ?? "").trim().toLowerCase();
  if (!EMAIL_VALIDO.test(email)) throw new Error("SEED_TESTE_EMAIL inválido.");
  if (email === emailDoProfessor) throw new Error("A conta de teste não pode ser a do professor.");
  if (typeof contaTeste.senha !== "string" || contaTeste.senha.trim() === "") {
    throw new Error("SEED_TESTE_PASSWORD ausente ou vazia.");
  }
  return { email, nome: contaTeste.nome?.trim() || "Conta de Teste", papel: "colaborador", senha: contaTeste.senha };
}

export async function executarSeed(prisma, { equipamentos, senha, existeImagem, usuario = PROFESSOR, contaTeste }) {
  // Tudo é validado antes da primeira gravação.
  if (typeof senha !== "string" || senha.trim() === "") {
    throw new Error("SEED_PROFESSOR_PASSWORD ausente ou vazia: defina a variável de ambiente.");
  }
  const lista = validarEquipamentos(equipamentos, existeImagem);

  // Usuário existente não é alterado (nem o hash), para o seed ser idempotente.
  const existente = await prisma.usuario.findUnique({ where: { email: usuario.email } });
  const senhaHash = existente ? null : await hashSenha(senha);

  // A conta de teste também é validada antes de qualquer gravação e, se já existe, não é alterada.
  const teste = contaTeste ? validarContaTeste(contaTeste, usuario.email) : null;
  const testeExistente = teste ? await prisma.usuario.findUnique({ where: { email: teste.email } }) : null;
  const testeHash = teste && !testeExistente ? await hashSenha(teste.senha) : null;

  return prisma.$transaction(async (tx) => {
    let criados = 0;
    for (const equipamento of lista) {
      const atual = await tx.equipamento.findUnique({ where: { patrimonio: equipamento.patrimonio } });
      if (atual) {
        // A situação só é definida na criação: não desfaz um empréstimo em andamento.
        await tx.equipamento.update({
          where: { patrimonio: equipamento.patrimonio },
          data: { nome: equipamento.nome, categoria: equipamento.categoria, imagemArquivo: equipamento.imagemArquivo },
        });
      } else {
        await tx.equipamento.create({ data: equipamento });
        criados += 1;
      }
    }
    if (senhaHash) await tx.usuario.create({ data: { ...usuario, senhaHash } });
    if (teste && testeHash) {
      await tx.usuario.create({ data: { email: teste.email, nome: teste.nome, papel: teste.papel, senhaHash: testeHash } });
    }
    return {
      equipamentos: lista.length,
      equipamentosCriados: criados,
      usuarioCriado: Boolean(senhaHash),
      contaTesteCriada: Boolean(testeHash),
    };
  });
}
