// Camada de acesso a dados de autenticação para páginas (Server Components).
// Cada página protegida chama exigirUsuario/exigirPapel: layouts não são reexecutados a
// cada navegação, então a verificação não pode ficar só neles (docs do Next.js).
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "../db";
import { NOME_COOKIE, lerSegredo, usuarioDaSessao } from "./sessao";
import type { UsuarioPublico } from "./sessao";

/** Usuário da sessão atual ou null. Memoizado durante uma renderização. */
export const obterUsuarioAtual = cache(async (): Promise<UsuarioPublico | null> => {
  const token = (await cookies()).get(NOME_COOKIE)?.value;
  return usuarioDaSessao(db, token, { segredo: lerSegredo(), agora: () => new Date() });
});

export async function exigirUsuario(): Promise<UsuarioPublico> {
  const usuario = await obterUsuarioAtual();
  if (!usuario) redirect("/login");
  return usuario;
}

/** Colaborador que tenta abrir uma tela de Operações é mandado de volta ao catálogo. */
export async function exigirOperacoes(): Promise<UsuarioPublico> {
  const usuario = await exigirUsuario();
  if (usuario.papel !== "operacoes") redirect("/catalogo");
  return usuario;
}
