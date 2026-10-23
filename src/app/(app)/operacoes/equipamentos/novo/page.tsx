import type { Metadata } from "next";

import { AppHeader, Breadcrumb } from "../../../../_components/nocturne/app-header";
import shell from "../../../../_components/nocturne/shell.module.css";
import { NewEquipmentForm } from "./new-equipment-form";

export const metadata: Metadata = { title: "Cadastrar equipamento | EmpresTI" };

export default function NewEquipmentPage() {
  return (
    <>
      <AppHeader
        left={<Breadcrumb trail={[{ label: "Operações", href: "/operacoes/emprestimos" }, { label: "Cadastrar equipamento" }]} />}
      />
      <div className={shell.content}>
        <NewEquipmentForm />
        <p className={shell.preview}>Dados de exemplo. Nada é gravado nesta versão.</p>
      </div>
    </>
  );
}
