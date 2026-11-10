import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  // Arquivos de declaracao de tipos (.d.mts) sao TypeScript; o parser JS do ESLint nao os le.
  globalIgnores([".next/**", "coverage/**", "next-env.d.ts", "**/*.d.mts"]),
]);
