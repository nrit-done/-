import { getSessionUser } from "@/server/auth";
import { getResumeByUserId, saveResumeForUser } from "@/server/database";
import type { ResumeData, ResumeTemplate } from "@/types/resume";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return Response.json({ message: "请先登录。" }, { status: 401 });
  }

  return Response.json({ record: await getResumeByUserId(user.id) });
}

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return Response.json({ message: "请先登录。" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    resume?: ResumeData;
    template?: ResumeTemplate;
  } | null;
  if (!body?.resume?.profile || !body.template) {
    return Response.json({ message: "简历数据格式不正确。" }, { status: 400 });
  }

  return Response.json({
    record: await saveResumeForUser(user.id, body.resume, body.template),
  });
}
