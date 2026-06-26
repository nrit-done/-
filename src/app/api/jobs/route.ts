import { getSessionUser } from "@/server/auth";
import { getJobsByUserId, saveJobsForUser } from "@/server/database";
import type { Job } from "@/types/job";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return Response.json({ message: "请先登录。" }, { status: 401 });
  }

  return Response.json({ record: await getJobsByUserId(user.id) });
}

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return Response.json({ message: "请先登录。" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    jobs?: Job[];
  } | null;
  if (!Array.isArray(body?.jobs)) {
    return Response.json({ message: "岗位数据格式不正确。" }, { status: 400 });
  }

  return Response.json({
    record: await saveJobsForUser(user.id, body.jobs),
  });
}
