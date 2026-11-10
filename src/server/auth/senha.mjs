// Hash de senha com scrypt do Node (sem dependência nova). Usado pelo seed (JavaScript)
// e, depois, pelo login. Tipos em senha.d.mts, porque o tsconfig tem allowJs: false.
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const derivar = promisify(scrypt);
const CUSTO = { N: 16384, r: 8, p: 1 };
const TAMANHO_CHAVE = 64;

export async function hashSenha(senha) {
  const salt = randomBytes(16);
  const chave = await derivar(senha, salt, TAMANHO_CHAVE, CUSTO);
  return ["scrypt", CUSTO.N, CUSTO.r, CUSTO.p, salt.toString("base64"), chave.toString("base64")].join("$");
}

export async function verificarSenha(senha, armazenado) {
  const partes = String(armazenado).split("$");
  if (partes.length !== 6 || partes[0] !== "scrypt") return false;
  const [, n, r, p, salt, chave] = partes;
  const parametros = { N: Number(n), r: Number(r), p: Number(p) };
  if (!Object.values(parametros).every(Number.isInteger)) return false;
  try {
    const esperado = Buffer.from(chave, "base64");
    if (esperado.length === 0) return false;
    const obtido = await derivar(senha, Buffer.from(salt, "base64"), esperado.length, parametros);
    return timingSafeEqual(esperado, obtido);
  } catch {
    return false;
  }
}
