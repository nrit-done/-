import { getSessionUser } from "@/server/auth";
import { buildDashboardData } from "@/server/dashboard";
import {
  getInterviewsByUserId,
  getJobsByUserId,
} from "@/server/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ message: "请先登录。" }, { status: 401 });
  }

  const [jobsRecord, interviewsRecord] = await Promise.all([
    getJobsByUserId(user.id),
    getInterviewsByUserId(user.id),
  ]);

  return Response.json({
    dashboard: buildDashboardData(
      jobsRecord?.jobs ?? [],
      interviewsRecord?.interviews ?? [],
      "account",
    ),
  });
}
