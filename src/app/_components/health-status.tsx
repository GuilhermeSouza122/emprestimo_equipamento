"use client";

import { useEffect, useState } from "react";

type HealthResponse = {
  status: "ok" | "error";
  database: "connected" | "unavailable";
  message?: string;
};

export function HealthStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    let active = true;

    async function loadHealth() {
      try {
        const response = await fetch("/health", { cache: "no-store" });
        const body = (await response.json()) as HealthResponse;

        if (active) {
          setHealth(body);
        }
      } catch {
        if (active) {
          setHealth({
            status: "error",
            database: "unavailable",
            message: "Nao foi possivel consultar o endpoint /health.",
          });
        }
      }
    }

    void loadHealth();

    return () => {
      active = false;
    };
  }, []);

  if (!health) {
    return <p className="status statusLoading" role="status">Verificando a conexão com o PostgreSQL...</p>;
  }

  const connected = health.status === "ok";

  return (
    <div className={`status ${connected ? "statusOk" : "statusError"}`} role="status">
      <span className="statusDot" aria-hidden="true" />
      <div>
        <strong>{connected ? "Sistema disponível" : "Sistema indisponível"}</strong>
        <p>
          {connected
            ? "A aplicação está conectada ao PostgreSQL."
            : health.message}
        </p>
      </div>
    </div>
  );
}
