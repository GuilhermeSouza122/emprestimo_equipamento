import type { Metadata } from "next";

import { LoansView } from "./loans-view";

export const metadata: Metadata = { title: "Empréstimos em aberto | EmpresTI" };

export default function OpenLoansPage() {
  return <LoansView />;
}
