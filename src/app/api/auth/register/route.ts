import { createSession } from "@/server/auth";
import { registerUser, toPublicUser } from "@/server/database";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    name?: string;
    email?: string;
    password?: string;
  } | null;

  if (!body?.name?.trim() || !body.email?.trim() || !body.password) {
    return Response.json(
      { message: "请填写姓名、邮箱和密码。" },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return Response.json({ message: "邮箱格式不正确。" }, { status: 400 });
  }

  if (body.password.length < 8) {
    return Response.json(
      { message: "密码至少需要 8 个字符。" },
      { status: 400 },
    );
  }

  const result = await registerUser(body.name, body.email, body.password);

  if (!result.user) {
    return Response.json({ message: result.error }, { status: 409 });
  }

  await createSession(result.user.id);
  return Response.json({ user: toPublicUser(result.user) }, { status: 201 });
}
