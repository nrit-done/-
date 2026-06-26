import "server-only";

import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";

import { getUserById, toPublicUser } from "@/server/database";
import type { SessionUser } from "@/types/backend";

export const sessionCookieName = "jobpilot_session";
const sessionDurationSeconds = 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
  expiresAt: number;
};

function getSessionSecret() {
  return process.env.JOBPILOT_SESSION_SECRET ?? "jobpilot-local-development-secret";
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

function encodeSession(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decodeSession(value: string): SessionPayload | null {
  const [body, signature] = value.split(".");

  if (!body || !signature) {
    return null;
  }

  const expectedSignature = sign(body);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;

    if (payload.expiresAt <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(
    sessionCookieName,
    encodeSession({
      userId,
      expiresAt: Date.now() + sessionDurationSeconds * 1000,
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.JOBPILOT_SECURE_COOKIES === "true",
      maxAge: sessionDurationSeconds,
      path: "/",
    },
  );
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.JOBPILOT_SECURE_COOKIES === "true",
    expires: new Date(0),
    path: "/",
  });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(sessionCookieName)?.value;

  if (!sessionValue) {
    return null;
  }

  const payload = decodeSession(sessionValue);

  if (!payload) {
    return null;
  }

  const user = await getUserById(payload.userId);
  return user ? toPublicUser(user) : null;
}
