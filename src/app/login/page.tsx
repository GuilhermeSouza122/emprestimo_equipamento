import type { Metadata } from "next";
import Link from "next/link";

import { Brand } from "../_components/brand";
import { LoginForm } from "./login-form";
import styles from "./login.module.css";

export const metadata: Metadata = {
  title: "Entrar | Equipar",
  description: "Acesse a interface de entrada do Equipar, seu espaço para empréstimos de equipamentos internos.",
};

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Brand />
        <Link className={styles.backLink} href="/">
          <span aria-hidden="true">←</span> Voltar ao início
        </Link>
      </header>

      <main className={styles.layout}>
        <aside className={styles.aside} aria-labelledby="login-intro-title">
          <div className={styles.asideCopy}>
            <p className={styles.eyebrow}><span className={styles.dot} /> MAIS SIMPLES. MAIS EQUIPAR.</p>
            <h2 id="login-intro-title">Boas ideias<br />merecem os<br /><em>recursos certos.</em></h2>
            <p>Um lugar para encontrar equipamentos, organizar empréstimos e seguir com o que importa.</p>
          </div>

          <div className={styles.illustration} aria-hidden="true">
            <div className={styles.illustrationOrbit} />
            <div className={styles.deviceCard}>
              <div className={styles.deviceScreen}>
                <span className={styles.deviceSpark}>✳</span>
                <span className={styles.deviceLine} />
                <span className={styles.deviceLineShort} />
              </div>
              <div className={styles.deviceBase} />
            </div>
            <div className={styles.noteCard}>
              <span className={styles.noteIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" />
                </svg>
              </span>
              <span className={styles.noteText}>
                <span>Compartilhar</span>
                <strong>faz mais sentido.</strong>
              </span>
            </div>
            <span className={styles.artSpark}>✳</span>
          </div>

          <div className={styles.asideFoot}>
            <span className={styles.miniMark} aria-hidden="true">◎</span>
            <p>Menos planilhas.<br /><strong>Mais possibilidades.</strong></p>
          </div>
        </aside>

        <section className={styles.formSection} aria-labelledby="login-title">
          <div className={styles.formContent}>
            <p className={styles.eyebrow}>BEM-VINDO AO EQUIPAR</p>
            <h1 className={styles.title} id="login-title">Bom ter você<br /><em>por aqui.</em></h1>
            <p className={styles.description}>Seu espaço para acompanhar empréstimos e encontrar o que precisa.</p>
            <LoginForm />
            <p className={styles.audience}>
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <rect x="5" y="10" width="14" height="11" rx="3" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
              </svg>
              Um espaço interno para colaboradores e Operações.
            </p>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>Equipar · Empréstimo de equipamentos internos.</span>
        <span>Feito para compartilhar.</span>
      </footer>
    </div>
  );
}
