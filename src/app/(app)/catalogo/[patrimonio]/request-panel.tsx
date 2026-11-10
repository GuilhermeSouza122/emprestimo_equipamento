"use client";

import { TRPCClientError } from "@trpc/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Icon } from "../../../_components/nocturne/icons";
import { LimitSegments } from "../../../_components/nocturne/ui";
import ui from "../../../_components/nocturne/ui.module.css";
import { trpc } from "../../../_lib/trpc-client";
import { formatarDataBr } from "../../../_lib/datas";
import styles from "../../screens.module.css";

const LIMITE = 3;

type Props = {
  patrimonio: string;
  nome: string;
  estado: "disponivel" | "emprestado" | "manutencao";
  /** Devolução prevista se o pedido fosse feito agora, calculada pelo servidor (dd/mm/aaaa). */
  devolucaoPrevista: string;
  emUso: number;
  emAtraso: boolean;
};

const NOTA_INDISPONIVEL = {
  manutencao: "Este equipamento está em manutenção e não pode ser solicitado.",
  emprestado: "Este equipamento não está disponível no momento.",
} as const;

export function RequestPanel({ patrimonio, nome, estado, devolucaoPrevista, emUso, emAtraso }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [erro, setErro] = useState("");
  const [criado, setCriado] = useState<string | null>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const disponivel = estado === "disponivel";

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

  async function confirmar() {
    if (sending) return;
    setSending(true);
    setErro("");
    try {
      const resultado = await trpc.emprestimos.solicitar.mutate({ patrimonio });
      setCriado(formatarDataBr(resultado.devolucaoPrevista));
    } catch (error) {
      const recusa = error instanceof TRPCClientError && (error.data?.code === "PRECONDITION_FAILED" || error.data?.code === "NOT_FOUND");
      setErro(recusa ? error.message : "Não foi possível solicitar agora. Tente novamente em instantes.");
    } finally {
      setSending(false);
      router.refresh(); // atualiza situação do item, contador e painel com o que o servidor tem agora
    }
  }

  const notaItens = emAtraso
    ? "Você tem um empréstimo em atraso. Devolva-o para solicitar outro."
    : emUso >= LIMITE
      ? `Você atingiu o limite de ${LIMITE} itens. Devolva um para solicitar outro.`
      : `Você pode solicitar mais ${LIMITE - emUso}.`;

  return (
    <>
      <section className={styles.panel} aria-labelledby="request-title">
        <h2 className={styles.panelTitle} id="request-title">Solicitar empréstimo</h2>
        <div className={styles.kv}><span>Prazo padrão</span><span>14 dias úteis</span></div>
        <div className={styles.kv}><span>Devolver até</span><span className={styles.kvStrong}>{devolucaoPrevista}</span></div>
        <button
          ref={triggerRef}
          type="button"
          className={`${ui.btn} ${ui.btnPrimary} ${ui.h44}`}
          disabled={!disponivel}
          onClick={() => { setErro(""); setCriado(null); setOpen(true); }}
        >
          Solicitar <Icon name="arrow-right" size={16} />
        </button>
        <p className={styles.panelNote}>
          {disponivel ? "O empréstimo é criado na hora, sem aprovação." : NOTA_INDISPONIVEL[estado as "manutencao" | "emprestado"]}
        </p>
      </section>

      <section className={styles.panel} aria-labelledby="mine-title">
        <h2 className={styles.panelTitle} id="mine-title">Seus itens</h2>
        <div className={styles.kv}><span>Em uso</span><span className={styles.kvStrong}>{emUso} de {LIMITE}</span></div>
        <LimitSegments used={emUso} />
        <p className={styles.panelNote}>{notaItens}</p>
      </section>

      {open ? (
        <div className={styles.backdrop} onClick={() => setOpen(false)}>
          <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="dialog-title" onClick={(event) => event.stopPropagation()}>
            <h2 id="dialog-title">{criado ? "Empréstimo criado" : "Confirmar solicitação"}</h2>
            {criado ? (
              <p className={styles.dialogBody}>{nome} · devolver até {criado}.</p>
            ) : (
              <>
                <p className={styles.dialogBody}>{nome} · devolução até {devolucaoPrevista}, 14 dias úteis a partir de hoje.</p>
                {emUso < LIMITE ? <div className={styles.consequence}>Você chegará a {emUso + 1} de {LIMITE} itens.</div> : null}
              </>
            )}
            {erro ? <p className={styles.feedback} role="alert">{erro}</p> : null}
            {criado ? <p className={styles.feedback} role="status">Empréstimo registrado. <Link href="/meus-emprestimos">Ver meus empréstimos</Link></p> : null}
            <div className={styles.dialogActions}>
              <button type="button" className={`${ui.btn} ${ui.btnSecondary} ${ui.h38}`} onClick={() => setOpen(false)}>
                {criado || erro ? "Fechar" : "Cancelar"}
              </button>
              {criado || erro ? null : (
                <button ref={confirmRef} type="button" className={`${ui.btn} ${ui.btnConfirm} ${ui.h38}`} onClick={confirmar} disabled={sending}>
                  {sending ? "Solicitando…" : "Confirmar"}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
