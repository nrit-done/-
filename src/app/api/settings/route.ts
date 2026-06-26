import { getSessionUser } from "@/server/auth";
import {
  getSettingsByUserId,
  saveSettingsForUser,
} from "@/server/database";
import type { JobPilotSettings } from "@/types/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ message: "请先登录。" }, { status: 401 });
  }

  const record = await getSettingsByUserId(user.id);
  return Response.json({ record });
}

export async function PUT(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ message: "请先登录。" }, { status: 401 });
  }

  const settings = (await request.json().catch(() => null)) as
    | JobPilotSettings
    | null;

  if (!settings?.profile || !settings.appearance) {
    return Response.json(
      { message: "设置数据格式不正确。" },
      { status: 400 },
    );
  }

  const record = await saveSettingsForUser(user.id, settings);
  return Response.json({ record });
}
