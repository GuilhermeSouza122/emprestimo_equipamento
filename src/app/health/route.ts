import { getHealthStatus } from "../../server/health";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    const health = await getHealthStatus();

    return Response.json(health, { status: 200 });
  } catch (error) {
    console.error("Falha ao verificar a conexao com o PostgreSQL:", error);

    return Response.json(
      {
        status: "error",
        database: "unavailable",
        message: "Nao foi possivel conectar ao PostgreSQL.",
      },
      { status: 503 },
    );
  }
}
