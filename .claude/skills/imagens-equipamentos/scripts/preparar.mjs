// Baixa as fotos APROVADAS, converte para 800x600 e grava os créditos.
// Só grava em data/imagens. Não envia nada para o Supabase (ver references/envio-producao.md).
// Uso: node --env-file=.env.local .claude/skills/imagens-equipamentos/scripts/preparar.mjs [--forcar]
import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  ALTURA, ARQUIVO_CANDIDATOS, ARQUIVO_CREDITOS, ARQUIVO_EQUIPAMENTOS, ARQUIVO_SELECAO,
  FONTE, LARGURA, LICENCA, SAIDA, baixar, dormir, gravarJson, lerJson, sha256,
} from "./lib.mjs";

const forcar = process.argv.includes("--forcar");
const equipamentos = await lerJson(ARQUIVO_EQUIPAMENTOS, []);
const selecao = await lerJson(ARQUIVO_SELECAO, {});
const candidatos = await lerJson(ARQUIVO_CANDIDATOS, {});
const creditos = await lerJson(ARQUIVO_CREDITOS, []);

const erros = [];
const pendentes = [];

// A mesma foto não pode servir a dois equipamentos.
const porId = new Map();
for (const [patrimonio, entrada] of Object.entries(selecao)) {
  if (entrada.revisao !== "aprovada") continue;
  if (porId.has(entrada.id)) {
    erros.push(`foto ${entrada.id} escolhida para ${porId.get(entrada.id)} e ${patrimonio}`);
  }
  porId.set(entrada.id, patrimonio);
}
if (erros.length) {
  erros.forEach((e) => console.error(`ERRO: ${e}`));
  process.exit(1);
}

for (const equipamento of equipamentos) {
  const { patrimonio } = equipamento;
  const entrada = selecao[patrimonio];
  if (!entrada || entrada.revisao !== "aprovada") {
    pendentes.push(patrimonio);
    continue;
  }
  const arquivo = `${patrimonio}.jpg`;
  const destino = path.join(SAIDA, arquivo);
  const existente = creditos.find((c) => c.patrimonio === patrimonio);
  if (!forcar && existente?.pixabayId === entrada.id && existsSync(destino)) {
    console.log(`${patrimonio}: já preparado (foto ${entrada.id}); nada a fazer`);
    continue;
  }

  // A foto aprovada pode vir da lista de outro equipamento (a mesma busca serve a todos).
  const candidato = Object.values(candidatos).flat().find((c) => c.id === entrada.id);
  if (!candidato) {
    erros.push(`${patrimonio}: foto ${entrada.id} não está nos candidatos atuais; rode buscar.mjs de novo`);
    continue;
  }

  try {
    await dormir(400); // downloads em rajada podem falhar; vá devagar
    const original = await baixar(candidato.largeImageURL);
    const meta = await sharp(original).metadata();
    if ((meta.width ?? 0) < LARGURA || (meta.height ?? 0) < ALTURA) {
      throw new Error(`original ${meta.width}x${meta.height} é menor que ${LARGURA}x${ALTURA} (sem ampliar)`);
    }
    const final = await sharp(original)
      .rotate()
      .resize(LARGURA, ALTURA, { fit: "cover", position: "centre" })
      .jpeg({ quality: 82 })
      .toBuffer();

    const hash = sha256(final);
    const repetida = creditos.find((c) => c.sha256 === hash && c.patrimonio !== patrimonio);
    if (repetida) throw new Error(`conteúdo idêntico ao de ${repetida.patrimonio}`);

    await writeFile(destino, final);
    const registro = {
      patrimonio,
      arquivo,
      fonte: FONTE,
      pixabayId: candidato.id,
      autor: candidato.user,
      perfilAutorURL: `https://pixabay.com/users/${candidato.user}-${candidato.user_id}/`,
      paginaURL: candidato.pageURL,
      licenca: LICENCA.nome,
      licencaURL: LICENCA.url,
      largura: LARGURA,
      altura: ALTURA,
      sha256: hash,
    };
    const indice = creditos.findIndex((c) => c.patrimonio === patrimonio);
    if (indice >= 0) creditos[indice] = registro;
    else creditos.push(registro);
    console.log(`${patrimonio}: ${arquivo} gravado (foto ${candidato.id}, autor ${candidato.user})`);
  } catch (erro) {
    erros.push(`${patrimonio}: ${erro.message}`);
  }
}

creditos.sort((a, b) => a.patrimonio.localeCompare(b.patrimonio));
await gravarJson(ARQUIVO_CREDITOS, creditos);

if (pendentes.length) console.log(`\nSem aprovação (não preparados): ${pendentes.join(", ")}`);
if (erros.length) {
  erros.forEach((e) => console.error(`ERRO: ${e}`));
  process.exit(1);
}
