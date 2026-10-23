import type { Metadata } from "next";

import { NocturneRoot } from "../_components/nocturne/root";
import { Sidebar } from "../_components/nocturne/sidebar";
import shell from "../_components/nocturne/shell.module.css";

export const metadata: Metadata = {
  title: "EmpresTI | Empréstimo de equipamentos",
  description: "Catálogo, empréstimos e operações de equipamentos internos.",
};

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <NocturneRoot>
      <div className={shell.app}>
        <Sidebar />
        <div className={shell.main}>{children}</div>
      </div>
    </NocturneRoot>
  );
}
