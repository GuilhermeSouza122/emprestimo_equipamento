// Busca candidatos no Pixabay para cada equipamento. Só lê da API; não baixa imagens.
// Uso: node --env-file=.env.local .claude/skills/imagens-equipamentos/scripts/buscar.mjs
import { createHash } from "node:crypto";
import { stat, readFile } from "node:fs/promises";
import path from "node:path";
import {
  ALTURA, ARQUIVO_CANDIDATOS, ARQUIVO_EQUIPAMENTOS, ARQUIVO_REPROVADAS, ARQUIVO_SELECAO,
  CACHE, LARGURA, dormir, exigirChave, gravarJson, lerJson, motivoPorTags,
} from "./lib.mjs";

const chave = exigirChave();
const TTL_CACHE_MS = 24 * 60 * 60 * 1000; // a documentação do Pixabay pede cache de 24 h

// Opções: --paginas N (padrão 1) lê mais páginas de resultados; --so TI-0006,TI-0007 limita
// a busca a alguns patrimônios e preserva os candidatos dos demais.
const argumentos = process.argv.slice(2);
const valorDe = (nome) => {
  const indice = argumentos.indexOf(nome);
  return indice >= 0 ? argumentos[indice + 1] : undefined;
};
const PAGINAS = Math.max(1, Math.min(5, Number(valorDe("--paginas") ?? 1)));
const SO = valorDe("--so")?.split(",").map((s) => s.trim());
const POR_EQUIPAMENTO = 10 * PAGINAS;

const todos = await lerJson(ARQUIVO_EQUIPAMENTOS, []);
const equipamentos = SO ? todos.filter((e) => SO.includes(e.patrimonio)) : todos;
const reprovadas = await lerJson(ARQUIVO_REPROVADAS, []);
const idsReprovados = new Set(reprovadas.map((r) => r.id));

async function consultar(busca, pagina = 1) {
  const parametros = new URLSearchParams({
    q: busca,
    image_type: "photo",
    orientation: "horizontal",
    safesearch: "true",
    per_page: "30",
    min_width: String(LARGURA),
    min_height: String(ALTURA),
    lang: "en",
  });
  if (pagina > 1) parametros.set("page", String(pagina)); // página 1 mantém o cache já existente
  // A chave não entra no nome nem no conteúdo do cache.
  const arquivo = path.join(CACHE, `${createHash("sha1").update(parametros.toString()).digest("hex")}.json`);
  try {
    const info = await stat(arquivo);
    if (Date.now() - info.mtimeMs < TTL_CACHE_MS) return JSON.parse(await readFile(arquivo, "utf8"));
  } catch {
    // sem cache válido: consulta a API
  }

  parametros.set("key", chave);
  for (let tentativa = 0; tentativa < 2; tentativa += 1) {
    let resposta;
    try {
      resposta = await fetch(`https://pixabay.com/api/?${parametros}`, { signal: AbortSignal.timeout(30_000) });
    } catch {
      throw new Error("falha de rede ao consultar o Pixabay");
    }
    if (resposta.status === 429 && tentativa === 0) {
      const segundos = Number(resposta.headers.get("x-ratelimit-reset")) || 60;
      console.log(`Limite de requisições atingido; aguardando ${segundos}s.`);
      await dormir(segundos * 1000);
      continue;
    }
    if (!resposta.ok) throw new Error(`Pixabay respondeu com status ${resposta.status}`);
    const dados = await resposta.json();
    await gravarJson(arquivo, dados);
    return dados;
  }
  throw new Error("limite de requisições do Pixabay persistiu");
}

const candidatos = await lerJson(ARQUIVO_CANDIDATOS, {});
for (const equipamento of equipamentos) {
  let descartadasPorTag = 0;
  const lista = [];
  const vistos = new Set();
  for (let pagina = 1; pagina <= PAGINAS && lista.length < POR_EQUIPAMENTO; pagina += 1) {
    const dados = await consultar(equipamento.busca, pagina);
    for (const hit of dados.hits ?? []) {
      if (vistos.has(hit.id) || idsReprovados.has(hit.id)) continue;
      vistos.add(hit.id);
      if (hit.imageWidth < LARGURA || hit.imageHeight < ALTURA) continue; // nunca ampliar
      if (motivoPorTags(hit.tags)) {
        descartadasPorTag += 1;
        continue;
      }
      lista.push({
        id: hit.id,
        pageURL: hit.pageURL,
        previewURL: hit.previewURL,
        largeImageURL: hit.largeImageURL,
        tags: hit.tags,
        user: hit.user,
        user_id: hit.user_id,
        imageWidth: hit.imageWidth,
        imageHeight: hit.imageHeight,
      });
      if (lista.length === POR_EQUIPAMENTO) break;
    }
    await dormir(700); // bem abaixo de 100 requisições por 60 s
    if ((dados.hits ?? []).length < 30) break; // acabaram os resultados
  }
  candidatos[equipamento.patrimonio] = lista;
  console.log(
    `${equipamento.patrimonio}  ${String(lista.length).padStart(2)} candidatos` +
      ` (${descartadasPorTag} descartados por tag)  busca: "${equipamento.busca}"`,
  );
}
await gravarJson(ARQUIVO_CANDIDATOS, candidatos);

// Propõe um candidato por equipamento, sem repetir foto. A proposta fica "pendente":
// só a revisão visual humana a transforma em "aprovada".
const selecao = await lerJson(ARQUIVO_SELECAO, {});
const usados = new Set(Object.values(selecao).map((s) => s.id));
for (const equipamento of equipamentos) {
  if (selecao[equipamento.patrimonio]) continue;
  const proposta = candidatos[equipamento.patrimonio].find((c) => !usados.has(c.id));
  if (!proposta) {
    console.log(`${equipamento.patrimonio}: sem candidato disponível; ajuste a busca em data/equipamentos.json`);
    continue;
  }
  usados.add(proposta.id);
  selecao[equipamento.patrimonio] = { id: proposta.id, revisao: "pendente" };
}
await gravarJson(ARQUIVO_SELECAO, selecao);

console.log("\nPara revisar, abra a página de cada candidato proposto:");
for (const [patrimonio, entrada] of Object.entries(selecao)) {
  if (entrada.revisao === "aprovada") continue;
  const candidato = candidatos[patrimonio]?.find((c) => c.id === entrada.id);
  console.log(`${patrimonio}  ${entrada.revisao}  ${candidato?.pageURL ?? "(id fora dos candidatos atuais)"}`);
}
console.log(`\nDecisões em ${path.relative(process.cwd(), ARQUIVO_SELECAO)} (revisao: aprovada | pendente).`);
