import { createSession } from "@/server/auth";
import { toPublicUser, verifyUser } from "@/server/database";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;

  if (!body?.email || !body.password) {
    return Response.json(
      { message: "请输入邮箱和密码。" },
      { status: 400 },
    );
  }

  const user = await verifyUser(body.email, body.password);

  if (!user) {
    return Response.json(
      { message: "邮箱或密码不正确。" },
      { status: 401 },
    );
  }

  await createSession(user.id);
  return Response.json({ user: toPublicUser(user) });
}
