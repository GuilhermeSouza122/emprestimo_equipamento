import { HealthStatus } from "./_components/health-status";

export default function Home() {
  return (
    <main>
      <section className="card">
        <p className="eyebrow">Fatia zero</p>
        <h1>Emprestimo de equipamentos</h1>
        <p className="description">
          A aplicacao, o endpoint de saude e o banco ja conseguem se comunicar.
        </p>
        <HealthStatus />
      </section>
    </main>
  );
}
