import { getSessionUser } from "@/server/auth";
import {
  getInterviewsByUserId,
  saveInterviewsForUser,
} from "@/server/database";
import type { InterviewCard } from "@/types/interview";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return Response.json({ message: "请先登录。" }, { status: 401 });
  }

  return Response.json({
    record: await getInterviewsByUserId(user.id),
  });
}

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return Response.json({ message: "请先登录。" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    interviews?: InterviewCard[];
  } | null;
  if (!Array.isArray(body?.interviews)) {
    return Response.json(
      { message: "面试数据格式不正确。" },
      { status: 400 },
    );
  }

  return Response.json({
    record: await saveInterviewsForUser(user.id, body.interviews),
  });
}
