import Link from "next/link";

import { Brand } from "./_components/brand";
import { HealthStatus } from "./_components/health-status";

const steps = [
  { number: "01", symbol: "⌕", title: "Encontre o que precisa", description: "Consulte o catálogo para saber quais equipamentos estão disponíveis." },
  { number: "02", symbol: "+", title: "Solicite o empréstimo", description: "Escolha um item disponível e acompanhe seus empréstimos em um só lugar." },
  { number: "03", symbol: "↗", title: "Devolva com facilidade", description: "Registre a devolução e ajude o próximo colega a encontrar o item." },
];

const rules = [
  { value: "03", title: "Itens por pessoa", description: "Até três equipamentos emprestados ao mesmo tempo." },
  { value: "14", title: "Dias para devolver", description: "Prazo padrão de devolução de cada empréstimo." },
  { value: "!", title: "Atrasos importam", description: "Quem tem item em atraso não pode solicitar outro." },
  { value: "✳", title: "Manutenção", description: "Itens em manutenção não aparecem como disponíveis." },
];

export default function Home() {
  return (
    <div className="site-shell" id="inicio">
      <header className="site-header">
        <Brand href="#inicio" />
        <nav className="site-nav" aria-label="Navegação principal">
          <a href="#como-funciona">Como funciona</a>
          <a href="#regras">Regras</a>
          <a href="#operacoes">Operações</a>
        </nav>
        <div className="header-actions">
          <a className="header-link header-status-link" href="#sistema" aria-label="Estado do sistema"><span className="header-status-label">Estado do sistema</span> <span aria-hidden="true">↗</span></a>
          <Link className="header-login" href="/login">Entrar <span aria-hidden="true">↗</span></Link>
        </div>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-content">
            <p className="hero-label"><span className="label-dot" /> EQUIPAMENTOS INTERNOS, SEM COMPLICAÇÃO</p>
            <h1 id="hero-title">O equipamento certo,<br /><em>na hora certa.</em></h1>
            <p className="hero-description">Um lugar para descobrir o que está disponível, organizar empréstimos e devolver cada item com tranquilidade.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#como-funciona">Entenda como funciona <span aria-hidden="true">↗</span></a>
              <a className="text-link" href="#regras">Conheça as regras <span aria-hidden="true">→</span></a>
            </div>
            <p className="hero-note"><span aria-hidden="true">◎</span> Feito para colaboradores e para o time de Operações.</p>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-grid" /><div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <div className="equipment-card monitor-card">
              <div className="monitor-frame"><div className="monitor-screen"><span className="screen-pill" /><span className="screen-line" /><span className="screen-line short" /></div></div>
              <div className="monitor-neck" /><div className="monitor-base" />
            </div>
            <div className="equipment-card laptop-card">
              <div className="laptop-screen"><span className="laptop-spark">✳</span><span className="laptop-line" /><span className="laptop-line short" /></div>
              <div className="laptop-base" />
            </div>
            <div className="floating-tag available-tag"><span className="tag-dot" /> Equipamentos à disposição</div>
            <div className="floating-tag loan-tag"><span>↗</span> Empréstimos organizados</div>
            <div className="art-spark spark-one">✳</div><div className="art-spark spark-two">✳</div>
          </div>
        </section>

        <div className="promise-strip" aria-label="Benefícios do sistema">
          <span>Menos planilhas</span><i aria-hidden="true">✳</i><span>Mais clareza</span><i aria-hidden="true">✳</i><span>Tudo no mesmo lugar</span>
        </div>

        <section className="section how-section" id="como-funciona" aria-labelledby="how-title">
          <div className="section-heading">
            <div><p className="eyebrow">SIMPLES DO INÍCIO AO FIM</p><h2 id="how-title">Emprestar e devolver<br /><em>sem perder o controle.</em></h2></div>
            <p>Um caminho claro para quem precisa de um equipamento e para quem cuida de cada devolução.</p>
          </div>
          <div className="steps-grid">
            {steps.map((step) => <article className="step-card" key={step.number}>
              <div className="step-top"><span className="step-icon" aria-hidden="true">{step.symbol}</span><span className="step-number">{step.number} / 03</span></div>
              <h3>{step.title}</h3><p>{step.description}</p>
            </article>)}
          </div>
        </section>

        <section className="section rules-section" id="regras" aria-labelledby="rules-title">
          <div className="rules-intro"><p className="eyebrow">COMBINADOS QUE AJUDAM TODO MUNDO</p><h2 id="rules-title">Regras claras.<br /><em>Uso melhor.</em></h2><p>Os equipamentos circulam melhor quando todo mundo sabe como funciona.</p></div>
          <div className="rules-grid">
            {rules.map((rule) => <article className="rule-card" key={rule.title}>
              <span className="rule-value" aria-hidden="true">{rule.value}</span><h3>{rule.title}</h3><p>{rule.description}</p>
            </article>)}
          </div>
        </section>

        <section className="section closing-section" id="operacoes" aria-labelledby="operations-title">
          <div className="closing-copy"><p className="eyebrow">PARA QUEM FAZ ACONTECER</p><h2 id="operations-title">Operações também<br /><em>ganha tempo.</em></h2><p>Uma visão dos empréstimos em aberto ajuda o time a acompanhar equipamentos e registrar devoluções no balcão.</p></div>
          <div className="closing-illustration" aria-hidden="true">
            <div className="illustration-sheet"><span className="sheet-heading" /><span className="sheet-row"><i /><b /><em /></span><span className="sheet-row"><i /><b /><em /></span><span className="sheet-row"><i /><b /><em /></span></div>
            <div className="illustration-check">✓</div>
          </div>
        </section>

        <section className="system-section" id="sistema" aria-labelledby="system-title">
          <div><p className="eyebrow">ESTADO DA APLICAÇÃO</p><h2 id="system-title">Por trás de tudo, uma base pronta para crescer.</h2><p>Esta página verifica a comunicação da aplicação com o PostgreSQL.</p></div>
          <HealthStatus />
        </section>
      </main>

      <footer className="site-footer">
        <Brand href="#inicio" />
        <p>Empréstimo de equipamentos internos.</p>
        <a href="#inicio">Voltar ao início ↑</a>
      </footer>
    </div>
  );
}
