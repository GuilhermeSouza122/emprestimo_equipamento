import type { Metadata } from "next";

import { CatalogView } from "./catalog-view";

export const metadata: Metadata = { title: "Catálogo | EmpresTI" };

export default function CatalogPage() {
  return <CatalogView />;
}
