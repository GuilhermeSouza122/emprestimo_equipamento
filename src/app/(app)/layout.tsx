import type { Metadata } from "next";

import { obterUsuarioAtual } from "../../server/auth/dal";
import { db } from "../../server/db";
import { contarEmprestimosAbertos } from "../../server/emprestimos/servico";
import { NocturneRoot } from "../_components/nocturne/root";
import { Sidebar } from "../_components/nocturne/sidebar";
import shell from "../_components/nocturne/shell.module.css";

export const metadata: Metadata = {
  title: "EmpresTI | Empréstimo de equipamentos",
  description: "Catálogo, empréstimos e operações de equipamentos internos.",
};

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Só para mostrar o usuário na barra lateral. A proteção de verdade está em cada página
  // (exigirUsuario/exigirOperacoes), porque layouts não rodam de novo a cada navegação.
  const usuario = await obterUsuarioAtual();
  const emprestimosAbertos = usuario ? await contarEmprestimosAbertos(db, usuario.id) : 0;

  return (
    <NocturneRoot>
      <div className={shell.app}>
        <Sidebar usuario={usuario} emprestimosAbertos={emprestimosAbertos} />
        <div className={shell.main}>{children}</div>
      </div>
    </NocturneRoot>
  );
}
