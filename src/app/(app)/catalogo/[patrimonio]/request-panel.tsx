"use client";

import { useEffect, useRef, useState } from "react";

import { Icon } from "../../../_components/nocturne/icons";
import { LimitSegments } from "../../../_components/nocturne/ui";
import ui from "../../../_components/nocturne/ui.module.css";
import styles from "../../screens.module.css";

export function RequestPanel({ nome, disponivel }: { nome: string; disponivel: boolean }) {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const trigger = triggerRef.current;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <section className={styles.panel} aria-labelledby="request-title">
        <h2 className={styles.panelTitle} id="request-title">Solicitar empréstimo</h2>
        <div className={styles.kv}><span>Retirada</span><span>04/set · Balcão de Operações</span></div>
        <div className={styles.kv}><span>Prazo padrão</span><span>14 dias úteis</span></div>
        <div className={styles.kv}><span>Devolver até</span><span className={styles.kvStrong}>18/set</span></div>
        <button
          ref={triggerRef}
          type="button"
          className={`${ui.btn} ${ui.btnPrimary} ${ui.h44}`}
          disabled={!disponivel}
          onClick={() => { setConfirmed(false); setOpen(true); }}
        >
          Solicitar <Icon name="arrow-right" size={16} />
        </button>
        <p className={styles.panelNote}>
          {disponivel
            ? "A retirada é feita no balcão de Operações, com crachá."
            : "Este item não está disponível para solicitação agora."}
        </p>
      </section>

      <section className={styles.panel} aria-labelledby="mine-title">
        <h2 className={styles.panelTitle} id="mine-title">Seus itens</h2>
        <div className={styles.kv}><span>Em uso</span><span className={styles.kvStrong}>2 de 3</span></div>
        <LimitSegments used={2} />
        <p className={styles.panelNote}>Nenhum item em atraso. Você pode solicitar mais 1.</p>
      </section>

      {open ? (
        <div className={styles.backdrop} onClick={() => setOpen(false)}>
          <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="dialog-title" onClick={(event) => event.stopPropagation()}>
            <h2 id="dialog-title">Confirmar solicitação</h2>
            <p className={styles.dialogBody}>{nome} · devolução até 18/set, 14 dias úteis a partir de hoje.</p>
            <div className={styles.consequence}>Você chegará a 3 de 3 itens. Para solicitar outro, devolva um antes.</div>
            {confirmed ? (
              <p className={styles.feedback} role="status">Prévia: nenhuma solicitação foi registrada. O fluxo real ainda não está conectado.</p>
            ) : null}
            <div className={styles.dialogActions}>
              <button type="button" className={`${ui.btn} ${ui.btnSecondary} ${ui.h38}`} onClick={() => setOpen(false)}>Cancelar</button>
              {confirmed ? null : (
                <button ref={confirmRef} type="button" className={`${ui.btn} ${ui.btnConfirm} ${ui.h38}`} onClick={() => setConfirmed(true)}>Confirmar</button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
