// Confere o contrato da skill sobre o que está em data/imagens. Sai com código 1 se algo falhar.
// Uso: node .claude/skills/imagens-equipamentos/scripts/validar.mjs
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  ALTURA, ARQUIVO_CREDITOS, ARQUIVO_EQUIPAMENTOS, ARQUIVO_SELECAO, FONTE, LARGURA, SAIDA,
  lerJson, origemPermitida, sha256,
} from "./lib.mjs";

const falhas = [];
const falhar = (mensagem) => falhas.push(mensagem);

const equipamentos = await lerJson(ARQUIVO_EQUIPAMENTOS, []);
const creditos = await lerJson(ARQUIVO_CREDITOS, []);
const selecao = await lerJson(ARQUIVO_SELECAO, {});

const camposObrigatorios = [
  "patrimonio", "arquivo", "fonte", "pixabayId", "autor", "perfilAutorURL",
  "paginaURL", "licenca", "licencaURL", "sha256",
];

const patrimonios = new Set(equipamentos.map((e) => e.patrimonio));
const ids = new Map();
const hashes = new Map();

for (const equipamento of equipamentos) {
  const { patrimonio } = equipamento;
  const credito = creditos.find((c) => c.patrimonio === patrimonio);
  if (!credito) {
    falhar(`${patrimonio}: sem registro em creditos.json`);
    continue;
  }
  for (const campo of camposObrigatorios) {
    if (!credito[campo]) falhar(`${patrimonio}: crédito sem "${campo}"`);
  }
  if (credito.fonte !== FONTE) falhar(`${patrimonio}: fonte deve ser ${FONTE}`);
  for (const campo of ["perfilAutorURL", "paginaURL"]) {
    if (credito[campo] && !origemPermitida(credito[campo])) falhar(`${patrimonio}: ${campo} fora do Pixabay`);
  }
  if (selecao[patrimonio]?.revisao !== "aprovada") falhar(`${patrimonio}: foto sem revisão humana aprovada`);
  if (selecao[patrimonio]?.id !== credito.pixabayId) falhar(`${patrimonio}: crédito não corresponde à foto aprovada`);

  const caminho = path.join(SAIDA, `${patrimonio}.jpg`);
  let buffer;
  try {
    buffer = await readFile(caminho);
  } catch {
    falhar(`${patrimonio}: arquivo ${patrimonio}.jpg não existe`);
    continue;
  }
  const meta = await sharp(buffer).metadata();
  if (meta.width !== LARGURA || meta.height !== ALTURA || meta.format !== "jpeg") {
    falhar(`${patrimonio}: esperado ${LARGURA}x${ALTURA} jpeg, encontrado ${meta.width}x${meta.height} ${meta.format}`);
  }
  const hash = sha256(buffer);
  if (hash !== credito.sha256) falhar(`${patrimonio}: arquivo difere do hash registrado`);
  if (ids.has(credito.pixabayId)) falhar(`${patrimonio}: foto ${credito.pixabayId} repetida em ${ids.get(credito.pixabayId)}`);
  if (hashes.has(hash)) falhar(`${patrimonio}: conteúdo repetido em ${hashes.get(hash)}`);
  ids.set(credito.pixabayId, patrimonio);
  hashes.set(hash, patrimonio);
}

for (const credito of creditos) {
  if (!patrimonios.has(credito.patrimonio)) falhar(`crédito órfão: ${credito.patrimonio}`);
}

const nomesNaSaida = await readdir(SAIDA).catch(() => []); // pasta ainda não existe: tudo falta
for (const nome of nomesNaSaida.filter((n) => n.endsWith(".jpg"))) {
  if (!patrimonios.has(nome.replace(/\.jpg$/, ""))) falhar(`arquivo sem equipamento: ${nome}`);
}

// Nenhum segredo nos arquivos versionados da skill.
const chave = process.env.PIXABAY_API_KEY;
if (chave && !chave.startsWith("replace-with")) {
  for (const nome of nomesNaSaida.filter((n) => n.endsWith(".json"))) {
    if ((await readFile(path.join(SAIDA, nome), "utf8")).includes(chave)) falhar(`chave encontrada em ${nome}`);
  }
}

if (falhas.length) {
  falhas.forEach((f) => console.error(`FALHA: ${f}`));
  console.error(`\n${falhas.length} falha(s).`);
  process.exit(1);
}
console.log(`OK: ${equipamentos.length} imagens ${LARGURA}x${ALTURA}, sem repetição, com créditos e revisão aprovada.`);
