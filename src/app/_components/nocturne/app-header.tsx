import Link from "next/link";

import { Icon } from "./icons";
import styles from "./shell.module.css";

export function AppHeader({ left, right }: { left?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>{left}</div>
      <div className={styles.headerRight}>{right}</div>
    </header>
  );
}

export function HeaderSearch({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={styles.search} role="search">
      <Icon name="magnifying-glass" size={17} />
      <input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export function ItemCounter({ used = 2 }: { used?: number }) {
  return (
    <>
      <span className={styles.counter}>{used} de 3 itens com você</span>
      <span className={styles.bell} aria-hidden="true"><Icon name="bell" size={17} /></span>
    </>
  );
}

export function Breadcrumb({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <nav className={styles.crumbs} aria-label="Você está em">
      {trail.map((crumb, index) => (
        <span key={crumb.label} className={styles.crumbs}>
          {index > 0 ? <Icon name="caret-right" size={12} /> : null}
          {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span className={styles.crumbCurrent} aria-current="page">{crumb.label}</span>}
        </span>
      ))}
    </nav>
  );
}
