"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "./icons";
import type { IconName } from "./icons";
import styles from "./shell.module.css";

type NavItem = { href: string; label: string; icon: IconName; badge?: string };

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "Colaborador",
    items: [
      { href: "/catalogo", label: "Catálogo", icon: "squares-four" },
      { href: "/meus-emprestimos", label: "Meus empréstimos", icon: "hand-arrow-down", badge: "2" },
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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <Link className={styles.brand} href="/catalogo" aria-label="EmpresTI, ir ao catálogo">
        <span className={styles.brandMark}><Icon name="package" size={16} /></span>
        EmpresTI
      </Link>

      <nav className={styles.nav} aria-label="Principal">
        {groups.map((group) => (
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
                  {item.badge ? <span className={styles.badge}>{item.badge}</span> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={styles.user}>
        <span className={styles.avatar} aria-hidden="true">MA</span>
        <div>
          <p className={styles.userName}>Marina Alves</p>
          <p className={styles.userRole}>Design</p>
        </div>
      </div>
    </aside>
  );
}
