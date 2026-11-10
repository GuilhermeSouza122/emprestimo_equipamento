// Utilitários compartilhados da skill imagens-equipamentos (ADR-003).
// Este módulo nunca escreve fora de data/imagens e nunca fala com o Supabase.
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
export const ARQUIVO_EQUIPAMENTOS = path.join(RAIZ, "data", "equipamentos.json");
export const SAIDA = path.join(RAIZ, "data", "imagens");
export const CACHE = path.join(SAIDA, ".cache");
export const ARQUIVO_CANDIDATOS = path.join(SAIDA, "candidatos.json");
export const ARQUIVO_SELECAO = path.join(SAIDA, "selecao.json");
export const ARQUIVO_REPROVADAS = path.join(SAIDA, "reprovadas.json");
export const ARQUIVO_CREDITOS = path.join(SAIDA, "creditos.json");

export const LARGURA = 800;
export const ALTURA = 600;

export const FONTE = "Pixabay";
export const LICENCA = {
  nome: "Pixabay Content License",
  url: "https://pixabay.com/service/license-summary/",
};

// Única origem de imagens aceita: nenhum download fora do Pixabay.
const DOMINIO_PERMITIDO = "pixabay.com";

// Pré-filtro por tags. É só uma triagem: a revisão visual humana continua obrigatória.
const PALAVRAS_PESSOA = [
  "people", "person", "man", "men", "woman", "women", "girl", "boy", "child",
  "children", "kid", "kids", "baby", "student", "students", "businessman",
  "businesswoman", "worker", "team", "hand", "hands", "face", "portrait",
  "selfie", "couple", "family", "crowd", "user",
];
const PALAVRAS_MARCA_OU_TEXTO = [
  "logo", "brand", "apple", "macbook", "iphone", "samsung", "dell", "hp",
  "lenovo", "asus", "acer", "microsoft", "windows", "google", "sony", "canon",
  "nikon", "logitech", "gopro", "text", "typography", "sign", "screenshot",
  "website", "code", "coding", "programming", "software",
];

export function motivoPorTags(tags) {
  const palavras = String(tags).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const pessoa = palavras.find((p) => PALAVRAS_PESSOA.includes(p));
  if (pessoa) return `tag de pessoa: ${pessoa}`;
  const marca = palavras.find((p) => PALAVRAS_MARCA_OU_TEXTO.includes(p));
  if (marca) return `tag de marca/texto: ${marca}`;
  return null;
}

export async function lerJson(caminho, padrao) {
  try {
    return JSON.parse(await readFile(caminho, "utf8"));
  } catch (erro) {
    if (erro.code === "ENOENT") return padrao;
    throw erro;
  }
}

export async function gravarJson(caminho, dados) {
  await mkdir(path.dirname(caminho), { recursive: true });
  await writeFile(caminho, `${JSON.stringify(dados, null, 2)}\n`);
}

export const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");

export function exigirChave() {
  const chave = process.env.PIXABAY_API_KEY;
  if (!chave || chave.startsWith("replace-with")) {
    console.error(
      "PIXABAY_API_KEY ausente. Defina em .env.local e rode com: node --env-file=.env.local <script>",
    );
    process.exit(1);
  }
  return chave;
}

export function origemPermitida(url) {
  try {
    const alvo = new URL(url);
    return (
      alvo.protocol === "https:" &&
      (alvo.hostname === DOMINIO_PERMITIDO || alvo.hostname.endsWith(`.${DOMINIO_PERMITIDO}`))
    );
  } catch {
    return false;
  }
}

export async function baixar(url) {
  if (!origemPermitida(url)) throw new Error("origem fora do Pixabay: download recusado");
  const resposta = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!resposta.ok) throw new Error(`download falhou com status ${resposta.status}`);
  const tipo = resposta.headers.get("content-type") ?? "";
  if (!tipo.startsWith("image/")) throw new Error(`resposta não é imagem (${tipo})`);
  return Buffer.from(await resposta.arrayBuffer());
}

export const dormir = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
