import { afterAll, describe, expect, it } from "vitest";

import { GET } from "../app/health/route";
import { db } from "./db";

describe("GET /health", () => {
  afterAll(async () => {
    await db.$disconnect();
  });

  it("responde 200 quando o PostgreSQL esta conectado", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: "ok",
      database: "connected",
    });
  });
});
