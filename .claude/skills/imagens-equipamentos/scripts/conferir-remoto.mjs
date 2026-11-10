// Confere, SÓ POR LEITURA, que as 12 imagens publicadas no bucket público abrem sem login e têm
// exatamente o mesmo conteúdo (sha256) dos arquivos de data/imagens/. Não envia nada a lugar nenhum.
// Uso: node .claude/skills/imagens-equipamentos/scripts/conferir-remoto.mjs <URL-base-publica>
//   ou com EQUIPAMENTOS_IMAGENS_BASE_URL definida no ambiente.
import { readFile } from "node:fs/promises";
import path from "node:path";

import { ARQUIVO_CREDITOS, ARQUIVO_EQUIPAMENTOS, SAIDA, lerJson, sha256 } from "./lib.mjs";

const base = (process.argv[2] ?? process.env.EQUIPAMENTOS_IMAGENS_BASE_URL ?? "").trim().replace(/\/+$/, "");
if (!base.startsWith("https://")) {
  console.error("Informe a URL base pública (https://...) como argumento ou em EQUIPAMENTOS_IMAGENS_BASE_URL.");
  process.exit(1);
}

const equipamentos = await lerJson(ARQUIVO_EQUIPAMENTOS, []);
const creditos = await lerJson(ARQUIVO_CREDITOS, []);
let falhas = 0;

for (const { patrimonio } of equipamentos) {
  const arquivo = `${patrimonio}.jpg`;
  try {
    const local = await readFile(path.join(SAIDA, arquivo));
    const resposta = await fetch(`${base}/${encodeURIComponent(arquivo)}`, { signal: AbortSignal.timeout(30_000) });
    const tipo = resposta.headers.get("content-type") ?? "";
    if (!resposta.ok || !tipo.startsWith("image/")) throw new Error(`HTTP ${resposta.status} ${tipo}`);
    const remoto = Buffer.from(await resposta.arrayBuffer());
    const hashLocal = sha256(local);
    const hashRemoto = sha256(remoto);
    const registrado = creditos.find((c) => c.patrimonio === patrimonio)?.sha256;
    const igual = hashLocal === hashRemoto && hashLocal === registrado;
    if (!igual) falhas += 1;
    console.log(`${arquivo}  http=${resposta.status}  ${remoto.length}B  sha256 ${igual ? "igual ao local e ao creditos.json" : "DIFERENTE"}`);
  } catch (erro) {
    falhas += 1;
    console.log(`${arquivo}  FALHOU: ${erro.message}`);
  }
}

console.log(falhas === 0 ? `\nOK: ${equipamentos.length} de ${equipamentos.length} imagens públicas idênticas às locais.` : `\n${falhas} falha(s).`);
process.exit(falhas === 0 ? 0 : 1);
