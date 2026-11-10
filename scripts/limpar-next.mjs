// Roda antes de `npm run build` (script `prebuild`). Remove a pasta .next de builds anteriores.
// Em pastas sincronizadas (OneDrive) ou com antivírus, o Windows pode segurar um arquivo por
// instantes e o Next falha com "EPERM: operation not permitted, rmdir .next/...". Tentar de novo
// com pausa resolve quase sempre. Se não resolver, só avisa e deixa o Next tentar.
import { rmSync } from "node:fs";

try {
  rmSync(".next", { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
} catch (erro) {
  console.warn(
    `Aviso: não foi possível limpar .next (${erro.code ?? "erro"}). Feche o "next dev" e pause a sincronização do OneDrive nesta pasta, depois rode de novo.`,
  );
}
