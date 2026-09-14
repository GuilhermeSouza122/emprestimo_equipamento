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
    return <p className="status statusLoading">Verificando o PostgreSQL...</p>;
  }

  const connected = health.status === "ok";

  return (
    <div className={`status ${connected ? "statusOk" : "statusError"}`}>
      <span className="statusDot" aria-hidden="true" />
      <div>
        <strong>{connected ? "Sistema disponivel" : "Sistema indisponivel"}</strong>
        <p>
          {connected
            ? "O endpoint /health confirmou a conexao com o PostgreSQL."
            : health.message}
        </p>
      </div>
    </div>
  );
}
