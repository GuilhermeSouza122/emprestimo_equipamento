import type { PrismaClient } from "@prisma/client";

import { hashSenha, verificarSenha } from "./senha.mjs";
import type { UsuarioPublico } from "./sessao";

let hashFalso: Promise<string> | undefined;
const obterHashFalso = () => (hashFalso ??= hashSenha("senha-que-nunca-sera-valida"));

/**
 * Confere e-mail e senha. Para e-mail inexistente também executa um scrypt contra
 * um hash falso, de custo igual ao real, para o tempo de resposta não revelar
 * quais e-mails existem. Devolve null em qualquer falha.
 */
export async function autenticar(prisma: PrismaClient, email: string, senha: string): Promise<UsuarioPublico | null> {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  const confere = await verificarSenha(senha, usuario?.senhaHash ?? (await obterHashFalso()));
  if (!usuario || !confere) return null;
  return { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel };
}
