import type { Metadata } from "next";
import Link from "next/link";

import { Icon } from "../_components/nocturne/icons";
import { NocturneRoot } from "../_components/nocturne/root";
import { LoginForm } from "./login-form";
import styles from "./login.module.css";

export const metadata: Metadata = {
  title: "Entrar | EmpresTI",
  description: "Acesse o EmpresTI, sistema interno de empréstimo de equipamentos.",
};

export default function LoginPage() {
  return (
    <NocturneRoot>
      <div className={styles.page}>
        <aside className={styles.hero} aria-labelledby="login-intro-title">
          <Link className={styles.brand} href="/" aria-label="EmpresTI, voltar ao início">
            <span className={styles.brandMark}><Icon name="package" size={18} /></span>
            EmpresTI
          </Link>

          <div className={styles.heroBody}>
            <h2 className={styles.heroTitle} id="login-intro-title">Equipamentos certos, na hora certa.</h2>
            <p className={styles.heroText}>Consulte o catálogo, solicite empréstimos e registre devoluções em um só lugar.</p>
            <div className={styles.brandRule} />
            <div className={styles.numbers}>
              <div><p className={styles.number}>3</p><p className={styles.numberLabel}>itens por pessoa</p></div>
              <div><p className={styles.number}>14</p><p className={styles.numberLabel}>dias de prazo</p></div>
            </div>
          </div>

          <p className={styles.heroFoot}>Operações · v1</p>
        </aside>

        <main className={styles.formSide}>
          <div className={styles.formBox}>
            <div>
              <h1 className={styles.formTitle} id="login-title">Entrar</h1>
              <p className={styles.formSub}>Use seu e-mail corporativo.</p>
            </div>
            <LoginForm />
            <hr className={styles.rule} />
            <p className={styles.support}>
              Acesso interno para colaboradores e Operações.{" "}
              <Link className={styles.back} href="/">Voltar ao início</Link>
            </p>
          </div>
        </main>
      </div>
    </NocturneRoot>
  );
}
