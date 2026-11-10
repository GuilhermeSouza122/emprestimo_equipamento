"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import type { UsuarioPublico } from "../../../server/auth/sessao";
import { trpc } from "../../_lib/trpc-client";
import { Icon } from "./icons";
import type { IconName } from "./icons";
import styles from "./shell.module.css";

type NavItem = { href: string; label: string; icon: IconName };

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "Colaborador",
    items: [
      { href: "/catalogo", label: "Catálogo", icon: "squares-four" },
      { href: "/meus-emprestimos", label: "Meus empréstimos", icon: "hand-arrow-down" },
    ],
  },
  {
    label: "Operações",
    items: [
      { href: "/operacoes/emprestimos", label: "Empréstimos em aberto", icon: "list-checks" },
      { href: "/operacoes/equipamentos/novo", label: "Cadastrar equipamento", icon: "plus-square" },
    ],
  },
];

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return `${primeira}${ultima}`.toUpperCase();
}

export function Sidebar({ usuario, emprestimosAbertos }: { usuario: UsuarioPublico | null; emprestimosAbertos: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);
  // Esconder o grupo não é proteção: as rotas de Operações são recusadas no servidor.
  const visiveis = groups.filter((group) => group.label !== "Operações" || usuario?.papel === "operacoes");

  async function sair() {
    setSaindo(true);
    try {
      await trpc.auth.sair.mutate();
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <aside className={styles.sidebar}>
      <Link className={styles.brand} href="/catalogo" aria-label="EmpresTI, ir ao catálogo">
        <span className={styles.brandMark}><Icon name="package" size={16} /></span>
        EmpresTI
      </Link>

      <nav className={styles.nav} aria-label="Principal">
        {visiveis.map((group) => (
          <div key={group.label} className={styles.group}>
            <p className={styles.groupLabel}>{group.label}</p>
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  className={`${styles.navItem} ${active ? styles.navActive : ""}`}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon name={item.icon} filled={active} />
                  {item.label}
                  {item.href === "/meus-emprestimos" && emprestimosAbertos > 0 ? (
                    <span className={styles.badge}>{emprestimosAbertos}</span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={styles.user}>
        <span className={styles.avatar} aria-hidden="true">{usuario ? iniciais(usuario.nome) : "?"}</span>
        <div>
          <p className={styles.userName}>{usuario?.nome ?? "Visitante"}</p>
          <p className={styles.userRole}>{usuario?.papel === "operacoes" ? "Operações" : "Colaborador"}</p>
        </div>
        <button type="button" className={styles.signOut} onClick={sair} disabled={saindo}>
          {saindo ? "Saindo…" : "Sair"}
        </button>
      </div>
    </aside>
  );
}
