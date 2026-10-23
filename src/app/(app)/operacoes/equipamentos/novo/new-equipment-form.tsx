"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { Icon } from "../../../../_components/nocturne/icons";
import { categorias } from "../../../../_components/nocturne/sample-data";
import type { Categoria, Estado } from "../../../../_components/nocturne/sample-data";
import { EquipmentCard } from "../../../../_components/nocturne/ui";
import ui from "../../../../_components/nocturne/ui.module.css";
import styles from "../../../screens.module.css";

const situacoes: { valor: Estado | "fora"; rotulo: string }[] = [
  { valor: "disponivel", rotulo: "Disponível" },
  { valor: "manutencao", rotulo: "Em manutenção" },
  { valor: "fora", rotulo: "Fora de uso" },
];

const recentes = [
  { item: "ThinkPad T14 · PAT-1190", data: "02/set" },
  { item: "Projetor Epson X49 · PAT-0102", data: "28/ago" },
  { item: "Adaptador HDMI Belkin · PAT-0338", data: "20/ago" },
];

export function NewEquipmentForm() {
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState<Categoria>("Notebooks");
  const [patrimonio, setPatrimonio] = useState("");
  const [serie, setSerie] = useState("");
  const [local, setLocal] = useState("Balcão de Operações, 2º andar");
  const [situacao, setSituacao] = useState<Estado | "fora">("disponivel");
  const [observacoes, setObservacoes] = useState("");
  const [status, setStatus] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Prévia: nada foi gravado. O cadastro real ainda não está conectado ao banco.");
  }

  const previewState: Estado = situacao === "manutencao" ? "manutencao" : "disponivel";

  return (
    <div className={styles.formLayout}>
      <form onSubmit={handleSubmit} aria-labelledby="form-title" className={styles.stack}>
        <div>
          <h1 id="form-title">Cadastrar equipamento</h1>
          <p className={styles.panelNote}>Um registro por unidade física.</p>
        </div>

        <div className={styles.formGrid}>
          <div className={`${ui.field} ${styles.span2}`}>
            <label className={ui.label} htmlFor="eq-nome">Nome</label>
            <input id="eq-nome" className={ui.input} value={nome} onChange={(e) => setNome(e.target.value)} placeholder='Ex.: MacBook Pro 14"' required />
          </div>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="eq-categoria">Categoria</label>
            <div className={ui.selectWrap}>
              <select id="eq-categoria" className={ui.input} value={categoria} onChange={(e) => setCategoria(e.target.value as Categoria)}>
                {categorias.map((nomeCategoria) => <option key={nomeCategoria}>{nomeCategoria}</option>)}
              </select>
              <span className={ui.selectCaret}><Icon name="caret-down" size={13} /></span>
            </div>
          </div>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="eq-patrimonio">Patrimônio</label>
            <input id="eq-patrimonio" className={ui.input} value={patrimonio} onChange={(e) => setPatrimonio(e.target.value)} placeholder="PAT-0000" required />
          </div>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="eq-serie">Número de série <span className={ui.optional}>(opcional)</span></label>
            <input id="eq-serie" className={ui.input} value={serie} onChange={(e) => setSerie(e.target.value)} />
          </div>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="eq-local">Local de retirada</label>
            <input id="eq-local" className={ui.input} value={local} onChange={(e) => setLocal(e.target.value)} required />
          </div>
          <div className={`${ui.field} ${styles.span2}`}>
            <span className={ui.label} id="eq-situacao">Situação inicial</span>
            <div className={ui.segmented} role="group" aria-labelledby="eq-situacao">
              {situacoes.map((opcao) => (
                <button key={opcao.valor} type="button" aria-pressed={situacao === opcao.valor} className={`${ui.segmentedOpt} ${situacao === opcao.valor ? ui.segmentedOptActive : ""}`} onClick={() => setSituacao(opcao.valor)}>{opcao.rotulo}</button>
              ))}
            </div>
            <p className={ui.note}>Em manutenção não aparece no catálogo.</p>
          </div>
          <div className={`${ui.field} ${styles.span2}`}>
            <label className={ui.label} htmlFor="eq-obs">Observações <span className={ui.optional}>(opcional)</span></label>
            <textarea id="eq-obs" className={ui.textarea} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={`${ui.btn} ${ui.btnPrimary} ${ui.h44}`}>Cadastrar</button>
          <button type="submit" className={`${ui.btn} ${ui.btnSecondary} ${ui.h44}`}>Cadastrar e adicionar outro</button>
        </div>
        <div aria-live="polite">{status ? <p className={styles.feedback} role="status">{status}</p> : null}</div>
      </form>

      <aside className={styles.side} aria-label="Apoio ao cadastro">
        <section className={styles.sectionCol}>
          <h2 className={styles.sideLabel}>Prévia no catálogo</h2>
          {situacao === "fora" ? (
            <p className={styles.panelNote}>Itens fora de uso não aparecem no catálogo.</p>
          ) : (
            <EquipmentCard
              linked={false}
              item={{
                nome: nome.trim() || "Nome do equipamento",
                categoria,
                patrimonio: patrimonio.trim() || "PAT-0000",
                estado: previewState,
                assistencia: previewState === "manutencao" ? "aguardando avaliação" : undefined,
              }}
            />
          )}
        </section>
        <section className={styles.sectionCol}>
          <h2 className={styles.sideLabel}>Últimos cadastros</h2>
          <div className={styles.recent}>
            {recentes.map((linha) => (
              <div className={styles.recentRow} key={linha.item}><span>{linha.item}</span><span>{linha.data}</span></div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
