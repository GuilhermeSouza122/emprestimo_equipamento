import Link from "next/link";

import { HealthStatus } from "./_components/health-status";
import { Icon } from "./_components/nocturne/icons";
import type { IconName } from "./_components/nocturne/icons";
import { NocturneRoot } from "./_components/nocturne/root";
import ui from "./_components/nocturne/ui.module.css";
import styles from "./home.module.css";

const steps: { number: string; icon: IconName; title: string; description: string }[] = [
  { number: "01", icon: "magnifying-glass", title: "Encontre o que precisa", description: "Consulte o catálogo para saber quais equipamentos estão disponíveis." },
  { number: "02", icon: "plus", title: "Solicite o empréstimo", description: "Escolha um item disponível e acompanhe seus empréstimos em um só lugar." },
  { number: "03", icon: "hand-arrow-down", title: "Devolva com facilidade", description: "Registre a devolução e ajude o próximo colega a encontrar o item." },
];

const rules: { value?: string; icon?: IconName; title: string; description: string }[] = [
  { value: "03", title: "Itens por pessoa", description: "Até três equipamentos emprestados ao mesmo tempo." },
  { value: "14", title: "Dias para devolver", description: "Prazo padrão de devolução de cada empréstimo." },
  { icon: "warning", title: "Atrasos importam", description: "Quem tem item em atraso não pode solicitar outro." },
  { icon: "wrench", title: "Manutenção", description: "Itens em manutenção não aparecem como disponíveis." },
];

export default function Home() {
  return (
    <NocturneRoot>
      <div className={styles.shell} id="inicio">
        <header className={styles.header}>
          <div className={`${styles.wrap} ${styles.headerInner}`}>
            <a className={styles.brand} href="#inicio" aria-label="EmpresTI, voltar ao início">
              <span className={styles.brandMark}><Icon name="package" size={16} /></span>
              EmpresTI
            </a>
            <nav className={styles.nav} aria-label="Navegação principal">
              <a href="#como-funciona">Como funciona</a>
              <a href="#regras">Regras</a>
              <a href="#operacoes">Operações</a>
            </nav>
            <div className={styles.actions}>
              <a className={`${ui.btn} ${ui.btnSecondary} ${ui.h34} ${styles.statusLink}`} href="#sistema" aria-label="Estado do sistema">Estado do sistema</a>
              <Link className={`${ui.btn} ${ui.btnPrimary} ${ui.h34}`} href="/login">Entrar <Icon name="arrow-right" size={15} /></Link>
            </div>
          </div>
        </header>

        <main>
          <section className={styles.hero} aria-labelledby="hero-title">
            <div className={`${styles.wrap} ${styles.heroInner}`}>
              <div>
                <p className={styles.eyebrow}><span className={styles.dot} /> Equipamentos internos, sem complicação</p>
                <h1 className={styles.title} id="hero-title">O equipamento certo, <em>na hora certa.</em></h1>
                <p className={styles.lead}>Um lugar para descobrir o que está disponível, organizar empréstimos e devolver cada item com tranquilidade.</p>
                <div className={styles.heroActions}>
                  <a className={`${ui.btn} ${ui.btnPrimary} ${ui.h44}`} href="#como-funciona">Entenda como funciona <Icon name="arrow-right" size={16} /></a>
                  <a className={styles.textLink} href="#regras">Conheça as regras <Icon name="caret-right" size={14} /></a>
                </div>
                <p className={styles.note}><Icon name="info" size={16} /> Feito para colaboradores e para o time de Operações.</p>
              </div>

              <div className={styles.preview} aria-hidden="true">
                <div className={styles.previewBar}><span>Catálogo</span><span>Exemplo ilustrativo</span></div>
                <div className={styles.previewRow}>
                  <span className={styles.previewIcon}><Icon name="laptop" size={18} /></span>
                  <span className={styles.previewText}><span className={`${styles.bar} ${styles.barLong}`} /><span className={`${styles.bar} ${styles.barShort}`} /></span>
                  <span className={`${styles.pill} ${styles.pillOk}`}>Disponível</span>
                </div>
                <div className={styles.previewRow}>
                  <span className={styles.previewIcon}><Icon name="monitor" size={18} /></span>
                  <span className={styles.previewText}><span className={`${styles.bar} ${styles.barLong}`} /><span className={`${styles.bar} ${styles.barShort}`} /></span>
                  <span className={`${styles.pill} ${styles.pillLoan}`}>Emprestado</span>
                </div>
                <div className={styles.previewRow}>
                  <span className={styles.previewIcon}><Icon name="video-camera" size={18} /></span>
                  <span className={styles.previewText}><span className={`${styles.bar} ${styles.barLong}`} /><span className={`${styles.bar} ${styles.barShort}`} /></span>
                  <span className={`${styles.pill} ${styles.pillWarn}`}>Manutenção</span>
                </div>
              </div>
            </div>
          </section>

          <div className={styles.strip} aria-label="Benefícios do sistema">
            <span>Menos planilhas</span><span>Mais clareza</span><span>Tudo no mesmo lugar</span>
          </div>
          <hr className={styles.rule} />

          <section className={`${styles.wrap} ${styles.section}`} id="como-funciona" aria-labelledby="how-title">
            <div className={styles.sectionHead}>
              <div>
                <p className={styles.eyebrow}>Simples do início ao fim</p>
                <h2 className={styles.sectionTitle} id="how-title">Emprestar e devolver <em>sem perder o controle.</em></h2>
              </div>
              <p className={styles.sectionText}>Um caminho claro para quem precisa de um equipamento e para quem cuida de cada devolução.</p>
            </div>
            <div className={styles.grid3}>
              {steps.map((step) => (
                <article className={styles.card} key={step.number}>
                  <div className={styles.cardTop}>
                    <span className={styles.cardIcon} aria-hidden="true"><Icon name={step.icon} size={20} /></span>
                    <span className={styles.cardIndex}>{step.number} / 03</span>
                  </div>
                  <h3 className={styles.cardTitle}>{step.title}</h3>
                  <p className={styles.cardText}>{step.description}</p>
                </article>
              ))}
            </div>
          </section>

          <hr className={styles.rule} />

          <section className={`${styles.wrap} ${styles.section}`} id="regras" aria-labelledby="rules-title">
            <div className={styles.sectionHead}>
              <div>
                <p className={styles.eyebrow}>Combinados que ajudam todo mundo</p>
                <h2 className={styles.sectionTitle} id="rules-title">Regras claras. <em>Uso melhor.</em></h2>
              </div>
              <p className={styles.sectionText}>Os equipamentos circulam melhor quando todo mundo sabe como funciona.</p>
            </div>
            <div className={styles.grid4}>
              {rules.map((rule) => (
                <article className={styles.card} key={rule.title}>
                  <span className={`${styles.ruleValue} ${rule.icon ? styles.icon : ""}`} aria-hidden="true">
                    {rule.icon ? <Icon name={rule.icon} size={26} /> : rule.value}
                  </span>
                  <h3 className={styles.cardTitle}>{rule.title}</h3>
                  <p className={styles.cardText}>{rule.description}</p>
                </article>
              ))}
            </div>
          </section>

          <hr className={styles.rule} />

          <section className={`${styles.wrap} ${styles.section}`} id="operacoes" aria-labelledby="operations-title">
            <div className={styles.split}>
              <div>
                <p className={styles.eyebrow}>Para quem faz acontecer</p>
                <h2 className={styles.sectionTitle} id="operations-title">Operações também <em>ganha tempo.</em></h2>
                <p className={styles.sectionText}>Uma visão dos empréstimos em aberto ajuda o time a acompanhar equipamentos e registrar devoluções no balcão.</p>
              </div>
              <div className={styles.table} aria-hidden="true">
                <div className={styles.tableHead}><span>Colaborador</span><span>Item</span><span>Situação</span></div>
                <div className={`${styles.tableRow} ${styles.tableRowLate}`}>
                  <span className={`${styles.bar} ${styles.barLong}`} /><span className={styles.bar} /><span className={`${styles.pill} ${styles.pillLate}`}>Atraso</span>
                </div>
                <div className={styles.tableRow}>
                  <span className={`${styles.bar} ${styles.barLong}`} /><span className={styles.bar} /><span className={`${styles.pill} ${styles.pillLoan}`}>No prazo</span>
                </div>
                <div className={styles.tableRow}>
                  <span className={`${styles.bar} ${styles.barLong}`} /><span className={styles.bar} /><span className={`${styles.pill} ${styles.pillLoan}`}>No prazo</span>
                </div>
              </div>
            </div>
          </section>

          <section className={`${styles.wrap} ${styles.system}`} id="sistema" aria-labelledby="system-title">
            <div>
              <p className={styles.eyebrow}>Estado da aplicação</p>
              <h2 className={styles.systemTitle} id="system-title">Por trás de tudo, uma base pronta para crescer.</h2>
              <p className={styles.systemText}>Esta página verifica a comunicação da aplicação com o PostgreSQL.</p>
            </div>
            <HealthStatus />
          </section>
        </main>

        <footer className={styles.footer}>
          <div className={`${styles.wrap} ${styles.footerInner}`}>
            <a className={styles.brand} href="#inicio" aria-label="EmpresTI, voltar ao início">
              <span className={styles.brandMark}><Icon name="package" size={16} /></span>
              EmpresTI
            </a>
            <p>Empréstimo de equipamentos internos.</p>
            <a className={styles.textLink} href="#inicio">Voltar ao início <Icon name="arrow-up-right" size={14} /></a>
          </div>
        </footer>
      </div>
    </NocturneRoot>
  );
}
