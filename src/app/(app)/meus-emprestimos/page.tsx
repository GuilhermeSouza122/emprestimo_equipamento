import type { Metadata } from "next";
import Link from "next/link";

import { exigirUsuario } from "../../../server/auth/dal";
import { db } from "../../../server/db";
import { listarEmprestimosAbertos } from "../../../server/emprestimos/servico";
import { formatarDataBr } from "../../_lib/datas";
import { AppHeader, Breadcrumb } from "../../_components/nocturne/app-header";
import { Icon } from "../../_components/nocturne/icons";
import shell from "../../_components/nocturne/shell.module.css";
import { EquipmentIcon, LimitSegments } from "../../_components/nocturne/ui";
import ui from "../../_components/nocturne/ui.module.css";
import styles from "../screens.module.css";

export const metadata: Metadata = { title: "Meus empréstimos | EmpresTI" };

const LIMITE = 3;

export default async function MyLoansPage() {
  const usuario = await exigirUsuario();
  const emprestimos = await listarEmprestimosAbertos(db, usuario.id, () => new Date());
  const emAtraso = emprestimos.some((item) => item.emAtraso);

  return (
    <>
      <AppHeader
        left={<Breadcrumb trail={[{ label: "Meus empréstimos" }]} />}
        right={
          <Link className={`${ui.btn} ${ui.btnPrimary} ${ui.h34}`} href="/catalogo">
            <Icon name="plus" size={15} /> Pegar emprestado
          </Link>
        }
      />
      <div className={shell.content}>
        <div className={styles.sectionHead}>
          <div>
            <h1>Comigo agora</h1>
            <p className={shell.pageSub}>{emprestimos.length} de {LIMITE} itens · {emAtraso ? "há item em atraso" : "nenhum em atraso"}</p>
          </div>
          <div className={styles.limitBox}><LimitSegments used={emprestimos.length} /></div>
        </div>

        {emprestimos.length === 0 ? (
          <p className={styles.empty}>Você não tem empréstimos em aberto. <Link href="/catalogo">Ver o catálogo</Link></p>
        ) : (
          <ul className={styles.loanList} role="list">
            {emprestimos.map((item) => (
              <li className={styles.loanRow} key={item.patrimonio}>
                <EquipmentIcon categoria={item.categoria} large />
                <div>
                  <p className={styles.loanName}>{item.nome}</p>
                  <p className={styles.loanMeta}>{item.categoria} · {item.patrimonio} · retirado em {formatarDataBr(item.solicitadoEm)}</p>
                </div>
                <div className={styles.deadline}>
                  <span className={item.emAtraso ? styles.warnText : undefined}>
                    Devolver até {formatarDataBr(item.devolucaoPrevista)}{item.emAtraso ? " · em atraso" : ""}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
