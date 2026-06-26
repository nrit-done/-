import { access, constants } from "node:fs/promises";

import { getDatabasePath, readDatabase } from "@/server/database";
import type { HealthResponse } from "@/types/backend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await readDatabase();
  let writable = true;

  try {
    await access(getDatabasePath(), constants.W_OK);
  } catch {
    writable = false;
  }

  const response: HealthResponse = {
    status: "ok",
    service: "jobpilot-api",
    timestamp: new Date().toISOString(),
    database: {
      driver: "json-file",
      writable,
    },
  };

  return Response.json(response);
}
