import { clearSession, getSessionUser } from "@/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ user: await getSessionUser() });
}

export async function DELETE() {
  await clearSession();
  return Response.json({ success: true });
}
