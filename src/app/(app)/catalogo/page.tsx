import type { Metadata } from "next";

import { exigirUsuario } from "../../../server/auth/dal";
import { CatalogView } from "./catalog-view";

export const metadata: Metadata = { title: "Catálogo | EmpresTI" };

export default async function CatalogPage() {
  await exigirUsuario();
  return <CatalogView />;
}
