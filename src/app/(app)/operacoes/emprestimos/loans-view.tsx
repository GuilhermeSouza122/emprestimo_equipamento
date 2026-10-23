"use client";

import { useState } from "react";
import Link from "next/link";

import { AppHeader, HeaderSearch } from "../../../_components/nocturne/app-header";
import { Icon } from "../../../_components/nocturne/icons";
import shell from "../../../_components/nocturne/shell.module.css";
import ui from "../../../_components/nocturne/ui.module.css";
import styles from "../../screens.module.css";

type Loan = {
  pessoa: string;
  area: string;
  item: string;
  patrimonio: string;
  notebook: boolean;
  retirada: string;
  devolucao: string;
  /** Dias de atraso (positivo) ou dias restantes (negativo). */
  atraso: number;
};

const loans: Loan[] = [
  { pessoa: "Camila Duarte", area: "Marketing", item: 'MacBook Air 13" M2', patrimonio: "PAT-1204", notebook: true, retirada: "17/ago", devolucao: "31/ago", atraso: 4 },
  { pessoa: "Helena Prado", area: "Comercial", item: "Adaptador HDMI Belkin", patrimonio: "PAT-0338", notebook: false, retirada: "19/ago", devolucao: "02/set", atraso: 2 },
  { pessoa: "Tiago Menezes", area: "Suporte", item: "Projetor Epson X49", patrimonio: "PAT-0102", notebook: false, retirada: "20/ago", devolucao: "03/set", atraso: 1 },
  { pessoa: "Marina Alves", area: "Design", item: 'LG UltraFine 24"', patrimonio: "PAT-0910", notebook: false, retirada: "28/ago", devolucao: "11/set", atraso: -7 },
  { pessoa: "Rafael Lima", area: "Engenharia", item: "ThinkPad T14", patrimonio: "PAT-1188", notebook: true, retirada: "29/ago", devolucao: "12/set", atraso: -8 },
  { pessoa: "Marina Alves", area: "Design", item: "Dock USB-C Anker", patrimonio: "PAT-0455", notebook: false, retirada: "01/set", devolucao: "15/set", atraso: -11 },
  { pessoa: "Bruno Kato", area: "Engenharia", item: "Sony A7 III", patrimonio: "PAT-0233", notebook: false, retirada: "03/set", devolucao: "17/set", atraso: -13 },
];

const filtros = ["Todos", "Em atraso", "Vencem esta semana", "Notebooks"] as const;
type Filtro = (typeof filtros)[number];

function passa(filtro: Filtro, loan: Loan) {
  if (filtro === "Em atraso") return loan.atraso > 0;
  if (filtro === "Vencem esta semana") return loan.atraso <= 0 && loan.atraso >= -7;
  if (filtro === "Notebooks") return loan.notebook;
  return true;
}

function situacao(loan: Loan) {
  if (loan.atraso > 0) return { texto: `Atraso de ${loan.atraso} ${loan.atraso === 1 ? "dia" : "dias"}`, classe: styles.lateText };
  return { texto: `Vence em ${-loan.atraso} dias`, classe: styles.dimText };
}

export function LoansView() {
  const [filtro, setFiltro] = useState<Filtro>("Todos");
  const [query, setQuery] = useState("");
  const text = query.trim().toLowerCase();
  const visible = loans.filter(
    (loan) => passa(filtro, loan) && (!text || `${loan.pessoa} ${loan.item} ${loan.patrimonio}`.toLowerCase().includes(text)),
  );

  return (
    <>
      <AppHeader
        left={<HeaderSearch label="Buscar empréstimo" placeholder="Buscar por pessoa, item ou patrimônio" value={query} onChange={setQuery} />}
        right={
          <Link className={`${ui.btn} ${ui.btnPrimary} ${ui.h34}`} href="/operacoes/equipamentos/novo">
            <Icon name="plus" size={15} /> Cadastrar equipamento
          </Link>
        }
      />
      <div className={shell.content}>
        <div className={shell.pageTitle}>
          <h1>Empréstimos em aberto</h1>
          <p className={shell.pageSub}>21 itens fora · atualizado agora</p>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}><p className={styles.statLabel}>Em aberto</p><p className={styles.statValue}>21</p></div>
          <div className={styles.stat}><p className={styles.statLabel}>Vencem em 3 dias</p><p className={styles.statValue}>4</p></div>
          <div className={`${styles.stat} ${styles.statLate}`}><p className={styles.statLabel}>Em atraso</p><p className={styles.statValue}>3</p></div>
          <div className={styles.stat}><p className={styles.statLabel}>Em manutenção</p><p className={styles.statValue}>2</p></div>
        </div>

        <div className={ui.chips} role="group" aria-label="Filtro">
          {filtros.map((nome) => (
            <button key={nome} type="button" className={`${ui.chip} ${filtro === nome ? ui.chipActive : ""}`} aria-pressed={filtro === nome} onClick={() => setFiltro(nome)}>{nome}</button>
          ))}
        </div>

        <div className={styles.tableWrap}>
          <div className={styles.table}>
            <div className={`${styles.tr} ${styles.th} ${styles.ops7}`}>
              <span>Colaborador</span><span>Item</span><span>Retirada</span><span>Devolver até</span><span>Situação</span><span />
            </div>
            {visible.length === 0 ? (
              <p className={styles.empty}>Nenhum empréstimo encontrado com esses filtros.</p>
            ) : visible.map((loan) => {
              const status = situacao(loan);
              const late = loan.atraso > 0;
              return (
                <div className={`${styles.tr} ${styles.ops7} ${late ? styles.trLate : ""}`} key={`${loan.patrimonio}-${loan.pessoa}`}>
                  <span><span className={styles.cellName}>{loan.pessoa}</span><br /><span className={styles.cellSub}>{loan.area}</span></span>
                  <span><span className={styles.cellName}>{loan.item}</span><br /><span className={styles.cellSub}>{loan.patrimonio}</span></span>
                  <span className={styles.dimText}>{loan.retirada}</span>
                  <span className={styles.dimText}>{loan.devolucao}</span>
                  <span className={status.classe}>{status.texto}</span>
                  <button type="button" className={`${ui.btn} ${late ? ui.btnRowAlert : ui.btnRow} ${ui.h30}`}>Devolver</button>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.pager}>
          <span>{visible.length} de 21 empréstimos</span>
          <div className={styles.pagerBtns}>
            <button type="button" className={`${ui.btn} ${ui.btnSecondary} ${ui.h30}`} disabled>Anterior</button>
            <button type="button" className={`${ui.btn} ${ui.btnSecondary} ${ui.h30}`} disabled>Próximo</button>
          </div>
        </div>
        <p className={shell.preview}>Dados de exemplo. A devolução registrada por Operações ainda não está conectada ao banco.</p>
      </div>
    </>
  );
}
