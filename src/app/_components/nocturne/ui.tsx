import Link from "next/link";

import { Icon } from "./icons";
import type { IconName } from "./icons";
import { estadoRotulo } from "./sample-data";
import type { Categoria, Equipamento, Estado } from "./sample-data";
import styles from "./ui.module.css";

const categoriaIcone: Record<Categoria, IconName> = {
  Notebooks: "laptop",
  Monitores: "monitor",
  Câmeras: "video-camera",
  "Cabos e docks": "usb",
  Projetores: "projector-screen",
};

export function EquipmentIcon({ categoria, large = false, size }: { categoria: Categoria; large?: boolean; size?: number }) {
  return (
    <span className={`${styles.itemIcon} ${large ? styles.itemIconLg : ""}`} aria-hidden="true">
      <Icon name={categoriaIcone[categoria]} size={size ?? (large ? 21 : 20)} />
    </span>
  );
}

export function StatusPill({ estado }: { estado: Estado }) {
  return <span className={`${styles.pill} ${styles[estado]}`}>{estadoRotulo[estado]}</span>;
}

type CardItem = Pick<Equipamento, "patrimonio" | "nome" | "categoria" | "estado" | "com" | "devolucao" | "assistencia">;

export function EquipmentCard({ item, linked = true }: { item: CardItem; linked?: boolean }) {
  const body = (
    <>
      <div className={styles.cardTop}>
        <EquipmentIcon categoria={item.categoria} />
        <StatusPill estado={item.estado} />
      </div>
      <div>
        <h3 className={styles.cardName}>{item.nome}</h3>
        <p className={styles.cardMeta}>{item.categoria} · {item.patrimonio}</p>
      </div>
      {item.estado === "disponivel" ? (
        <p className={`${styles.cardFoot} ${styles.cardAction}`}>Solicitar <Icon name="arrow-right" size={13} /></p>
      ) : item.estado === "emprestado" ? (
        <p className={styles.cardFoot}>Com {item.com} · devolve {item.devolucao}</p>
      ) : (
        <p className={styles.cardFoot}>Em assistência{item.assistencia ? ` · ${item.assistencia}` : ""}</p>
      )}
    </>
  );

  if (item.estado === "disponivel" && linked) {
    return <Link className={`${styles.card} ${styles.cardLink}`} href={`/catalogo/${item.patrimonio}`}>{body}</Link>;
  }
  return <article className={styles.card}>{body}</article>;
}

export function LimitSegments({ used, total = 3 }: { used: number; total?: number }) {
  return (
    <div className={styles.segments} role="img" aria-label={`${used} de ${total} itens`}>
      {Array.from({ length: total }, (_, index) => (
        <span key={index} className={`${styles.segment} ${index < used ? styles.segmentOn : ""}`} />
      ))}
    </div>
  );
}

export function DeadlineBar({ elapsed, total = 14 }: { elapsed: number; total?: number }) {
  const days = Math.max(0, Math.min(total, elapsed));
  return (
    <div className={styles.track} role="img" aria-label={`${days} de ${total} dias decorridos`}>
      <div className={`${styles.fill} ${styles[`fill${days}` as keyof typeof styles]}`} />
    </div>
  );
}
