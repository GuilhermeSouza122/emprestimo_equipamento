import type { Metadata } from "next";
import Link from "next/link";

import { exigirUsuario } from "../../../server/auth/dal";
import { AppHeader, Breadcrumb } from "../../_components/nocturne/app-header";
import { Icon } from "../../_components/nocturne/icons";
import type { Categoria } from "../../_components/nocturne/sample-data";
import shell from "../../_components/nocturne/shell.module.css";
import { DeadlineBar, EquipmentIcon, LimitSegments } from "../../_components/nocturne/ui";
import ui from "../../_components/nocturne/ui.module.css";
import styles from "../screens.module.css";

export const metadata: Metadata = { title: "Meus empréstimos | EmpresTI" };

const comigo: { nome: string; categoria: Categoria; patrimonio: string; retirada: string; devolucao: string; decorridos: number }[] = [
  { nome: 'LG UltraFine 24"', categoria: "Monitores", patrimonio: "PAT-0910", retirada: "28/ago", devolucao: "11/set", decorridos: 7 },
  { nome: "Dock USB-C Anker", categoria: "Cabos e docks", patrimonio: "PAT-0455", retirada: "01/set", devolucao: "15/set", decorridos: 3 },
];

const historico = [
  { nome: "Projetor Epson X49", patrimonio: "PAT-0102", retirada: "12/ago", devolucao: "19/ago", situacao: "No prazo", ok: true },
  { nome: "Adaptador HDMI Belkin", patrimonio: "PAT-0338", retirada: "02/ago", devolucao: "16/ago", situacao: "No prazo", ok: true },
  { nome: "Sony A7 III", patrimonio: "PAT-0233", retirada: "15/jul", devolucao: "02/ago", situacao: "Atraso de 2 dias", ok: false },
];

export default async function MyLoansPage() {
  await exigirUsuario();
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
            <p className={shell.pageSub}>2 de 3 itens · nenhum em atraso</p>
          </div>
          <div className={styles.limitBox}><LimitSegments used={2} /></div>
        </div>

        <ul className={styles.loanList} role="list">
          {comigo.map((item) => (
            <li className={styles.loanRow} key={item.patrimonio}>
              <EquipmentIcon categoria={item.categoria} large />
              <div>
                <p className={styles.loanName}>{item.nome}</p>
                <p className={styles.loanMeta}>{item.categoria} · {item.patrimonio} · retirado em {item.retirada}</p>
              </div>
              <div className={styles.deadline}>
                <span>Devolver até {item.devolucao} · dia {item.decorridos} de 14</span>
                <DeadlineBar elapsed={item.decorridos} />
              </div>
              <button type="button" className={`${ui.btn} ${ui.btnRow} ${ui.h36}`}>Devolver</button>
            </li>
          ))}
        </ul>

        <hr className={ui.rule} />

        <section aria-labelledby="history-title" className={styles.sectionCol}>
          <h2 id="history-title" className={styles.panelTitle}>Histórico</h2>
          <div className={styles.tableWrap}>
            <div className={styles.table}>
              <div className={`${styles.tr} ${styles.th} ${styles.history4}`}>
                <span>Item</span><span>Retirada</span><span>Devolução</span><span>Situação</span>
              </div>
              {historico.map((linha) => (
                <div className={`${styles.tr} ${styles.history4}`} key={linha.patrimonio}>
                  <span><span className={styles.cellName}>{linha.nome}</span> <span className={styles.cellSub}>{linha.patrimonio}</span></span>
                  <span className={styles.dimText}>{linha.retirada}</span>
                  <span className={styles.dimText}>{linha.devolucao}</span>
                  <span className={linha.ok ? styles.okText : styles.warnText}>{linha.situacao}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <p className={shell.preview}>Dados de exemplo. Os empréstimos reais ainda não estão conectados ao banco.</p>
      </div>
    </>
  );
}
