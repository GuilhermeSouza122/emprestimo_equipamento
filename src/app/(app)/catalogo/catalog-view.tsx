"use client";

import { useState } from "react";

import { AppHeader, HeaderSearch, ItemCounter } from "../../_components/nocturne/app-header";
import { Icon } from "../../_components/nocturne/icons";
import { categorias, equipamentos } from "../../_components/nocturne/sample-data";
import type { Categoria } from "../../_components/nocturne/sample-data";
import shell from "../../_components/nocturne/shell.module.css";
import { EquipmentCard } from "../../_components/nocturne/ui";
import ui from "../../_components/nocturne/ui.module.css";
import styles from "../screens.module.css";

export function CatalogView() {
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [query, setQuery] = useState("");

  const text = query.trim().toLowerCase();
  const visible = equipamentos.filter(
    (item) =>
      (!categoria || item.categoria === categoria) &&
      (!onlyAvailable || item.estado === "disponivel") &&
      (!text || `${item.nome} ${item.patrimonio} ${item.categoria}`.toLowerCase().includes(text)),
  );

  return (
    <>
      <AppHeader
        left={<HeaderSearch label="Buscar equipamento" placeholder="Buscar por nome ou patrimônio" value={query} onChange={setQuery} />}
        right={<ItemCounter />}
      />
      <div className={shell.content}>
        <div className={shell.pageTitle}>
          <h1>Catálogo</h1>
          <p className={shell.pageSub}>32 equipamentos · 11 disponíveis agora</p>
        </div>

        <div className={ui.notice}>
          <Icon name="info" size={17} />
          <div>
            <p className={ui.noticeTitle}>Regras de empréstimo</p>
            <p className={ui.noticeBody}>
              Até 3 itens por pessoa, prazo de 14 dias. Quem tem item em atraso não solicita outro.
              Itens em manutenção ficam fora do catálogo.
            </p>
          </div>
        </div>

        <div className={styles.filters}>
          <div className={ui.chips} role="group" aria-label="Categoria">
            <button type="button" className={`${ui.chip} ${categoria === null ? ui.chipActive : ""}`} aria-pressed={categoria === null} onClick={() => setCategoria(null)}>Todos</button>
            {categorias.map((nome) => (
              <button key={nome} type="button" className={`${ui.chip} ${categoria === nome ? ui.chipActive : ""}`} aria-pressed={categoria === nome} onClick={() => setCategoria(nome)}>{nome}</button>
            ))}
          </div>
          <label className={styles.toggle}>
            <input type="checkbox" checked={onlyAvailable} onChange={(event) => setOnlyAvailable(event.target.checked)} />
            Só disponíveis
          </label>
        </div>

        {visible.length === 0 ? (
          <p className={styles.empty}>Nenhum equipamento encontrado com esses filtros.</p>
        ) : (
          <div className={styles.grid3}>
            {visible.map((item) => <EquipmentCard key={item.patrimonio} item={item} />)}
          </div>
        )}
        <p className={shell.preview}>Dados de exemplo. O catálogo real ainda não está conectado ao banco.</p>
      </div>
    </>
  );
}
