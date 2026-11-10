import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { exigirUsuario } from "../../../../server/auth/dal";
import { AppHeader, Breadcrumb, ItemCounter } from "../../../_components/nocturne/app-header";
import { buscarEquipamento, equipamentos } from "../../../_components/nocturne/sample-data";
import shell from "../../../_components/nocturne/shell.module.css";
import { EquipmentIcon, StatusPill } from "../../../_components/nocturne/ui";
import ui from "../../../_components/nocturne/ui.module.css";
import styles from "../../screens.module.css";
import { RequestPanel } from "./request-panel";

type Props = { params: Promise<{ patrimonio: string }> };

export function generateStaticParams() {
  return equipamentos.map((item) => ({ patrimonio: item.patrimonio }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { patrimonio } = await params;
  const item = buscarEquipamento(patrimonio);
  return { title: item ? `${item.nome} | EmpresTI` : "Equipamento | EmpresTI" };
}

export default async function EquipmentDetailPage({ params }: Props) {
  await exigirUsuario();
  const { patrimonio } = await params;
  const item = buscarEquipamento(patrimonio);
  if (!item) notFound();

  return (
    <>
      <AppHeader
        left={<Breadcrumb trail={[{ label: "Catálogo", href: "/catalogo" }, { label: item.categoria, href: "/catalogo" }, { label: item.nome }]} />}
        right={<ItemCounter />}
      />
      <div className={shell.content}>
        <div className={styles.detail}>
          <div className={styles.stack}>
            <div className={styles.hero}>
              <EquipmentIcon categoria={item.categoria} size={64} />
            </div>
            <div className={styles.itemTitle}>
              <h1>{item.nome}</h1>
              <StatusPill estado={item.estado} />
            </div>
            <p className={styles.desc}>{item.descricao}</p>
            <hr className={ui.rule} />
            <dl className={styles.specs}>
              <div><dt className={styles.specLabel}>Categoria</dt><dd className={styles.specValue}>{item.categoria}</dd></div>
              <div><dt className={styles.specLabel}>Patrimônio</dt><dd className={styles.specValue}>{item.patrimonio}</dd></div>
              <div><dt className={styles.specLabel}>Local</dt><dd className={styles.specValue}>{item.local}</dd></div>
              <div><dt className={styles.specLabel}>Última devolução</dt><dd className={styles.specValue}>{item.ultimaDevolucao}</dd></div>
            </dl>
            <section aria-labelledby="history-title">
              <h2 className={styles.h3} id="history-title">Histórico</h2>
              <div className={styles.history}>
                {item.historico.map((linha, index) => (
                  <div className={styles.historyRow} key={`${linha.data}-${index}`}>
                    <span>{linha.data}</span><span>{linha.evento}</span><span>{linha.resultado}</span>
                  </div>
                ))}
              </div>
            </section>
            <p className={shell.preview}>Dados de exemplo. O histórico real ainda não está conectado ao banco.</p>
          </div>

          <div className={styles.stack}>
            <RequestPanel nome={item.nome} disponivel={item.estado === "disponivel"} />
          </div>
        </div>
      </div>
    </>
  );
}
