"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import styles from "./ui.module.css";

/**
 * Foto do equipamento (800x600, proporção 4:3). Sem URL ou se a imagem não carregar
 * (por exemplo, antes do envio ao Supabase), mostra o ícone da categoria.
 */
export function EquipmentImage({ src, alt, fallback }: { src: string | null; alt: string; fallback: ReactNode }) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Se a imagem falhou antes da hidratação, o evento onError já passou: confere aqui.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);

  if (!src || failed) return <div className={styles.photoFallback}>{fallback}</div>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={imgRef} className={styles.photo} src={src} alt={alt} width={800} height={600} loading="lazy" onError={() => setFailed(true)} />
  );
}
