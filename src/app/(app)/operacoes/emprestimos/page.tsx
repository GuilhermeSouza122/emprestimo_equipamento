import type { Metadata } from "next";

import { exigirOperacoes } from "../../../../server/auth/dal";
import { LoansView } from "./loans-view";

export const metadata: Metadata = { title: "Empréstimos em aberto | EmpresTI" };

export default async function OpenLoansPage() {
  await exigirOperacoes();
  return <LoansView />;
}
