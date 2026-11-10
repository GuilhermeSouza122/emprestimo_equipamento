import type { Metadata } from "next";

import { exigirUsuario } from "../../../server/auth/dal";
import { db } from "../../../server/db";
import { resumoDoUsuario } from "../../../server/emprestimos/servico";
import { listarEquipamentos } from "../../../server/equipamentos/catalogo";
import { CatalogView } from "./catalog-view";

export const metadata: Metadata = { title: "Catálogo | EmpresTI" };

export default async function CatalogPage() {
  const usuario = await exigirUsuario();
  const [equipamentos, resumo] = await Promise.all([
    listarEquipamentos(db, process.env.EQUIPAMENTOS_IMAGENS_BASE_URL),
    resumoDoUsuario(db, usuario.id, () => new Date()),
  ]);
  return <CatalogView equipamentos={equipamentos} emUso={resumo.emUso} />;
}
