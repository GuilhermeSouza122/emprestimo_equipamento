import { db } from "./db";

export type HealthStatus = {
  status: "ok";
  database: "connected";
};

export async function getHealthStatus(): Promise<HealthStatus> {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL nao foi definida. Copie .env.example para .env.",
    );
  }

  await db.systemStatus.findUniqueOrThrow({ where: { id: 1 } });

  return {
    status: "ok",
    database: "connected",
  };
}
