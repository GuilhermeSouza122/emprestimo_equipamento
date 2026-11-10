import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { exigirUsuario } from "../../../../server/auth/dal";
import { db } from "../../../../server/db";
import { adicionarDiasUteis, dataEmSaoPaulo } from "../../../../server/emprestimos/calendario";
import { PRAZO_DIAS_UTEIS, resumoDoUsuario } from "../../../../server/emprestimos/servico";
import { buscarEquipamento } from "../../../../server/equipamentos/catalogo";
import { formatarDataBr } from "../../../_lib/datas";
import { AppHeader, Breadcrumb, ItemCounter } from "../../../_components/nocturne/app-header";
import { EquipmentImage } from "../../../_components/nocturne/equipment-image";
import shell from "../../../_components/nocturne/shell.module.css";
import { EquipmentIcon, StatusPill } from "../../../_components/nocturne/ui";
import ui from "../../../_components/nocturne/ui.module.css";
import styles from "../../screens.module.css";
import { RequestPanel } from "./request-panel";

type Props = { params: Promise<{ patrimonio: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { patrimonio } = await params;
  const item = await buscarEquipamento(db, patrimonio);
  return { title: item ? `${item.nome} | EmpresTI` : "Equipamento | EmpresTI" };
}

export default async function EquipmentDetailPage({ params }: Props) {
  const usuario = await exigirUsuario();
  const { patrimonio } = await params;
  const agora = () => new Date();
  const [item, resumo] = await Promise.all([
    buscarEquipamento(db, patrimonio, process.env.EQUIPAMENTOS_IMAGENS_BASE_URL),
    resumoDoUsuario(db, usuario.id, agora),
  ]);
  if (!item) notFound();

  // Devolução prevista calculada pelo servidor, com o mesmo calendário da solicitação.
  const devolucaoPrevista = formatarDataBr(adicionarDiasUteis(dataEmSaoPaulo(agora()), PRAZO_DIAS_UTEIS));

  return (
    <>
      <AppHeader
        left={<Breadcrumb trail={[{ label: "Catálogo", href: "/catalogo" }, { label: item.categoria, href: "/catalogo" }, { label: item.nome }]} />}
        right={<ItemCounter used={resumo.emUso} />}
      />
      <div className={shell.content}>
        <div className={styles.detail}>
          <div className={styles.stack}>
            <div className={styles.hero}>
              <EquipmentImage src={item.imagemUrl} alt={`Foto de ${item.nome}`} fallback={<EquipmentIcon categoria={item.categoria} size={64} />} />
            </div>
            <div className={styles.itemTitle}>
              <h1>{item.nome}</h1>
              <StatusPill estado={item.estado} />
            </div>
            <hr className={ui.rule} />
            <dl className={styles.specs}>
              <div><dt className={styles.specLabel}>Categoria</dt><dd className={styles.specValue}>{item.categoria}</dd></div>
              <div><dt className={styles.specLabel}>Patrimônio</dt><dd className={styles.specValue}>{item.patrimonio}</dd></div>
            </dl>
          </div>

          <div className={styles.stack}>
            <RequestPanel
              patrimonio={item.patrimonio}
              nome={item.nome}
              estado={item.estado}
              devolucaoPrevista={devolucaoPrevista}
              emUso={resumo.emUso}
              emAtraso={resumo.emAtraso}
            />
          </div>
        </div>
      </div>
    </>
  );
}
