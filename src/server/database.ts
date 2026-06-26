import "server-only";

import {
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  JobPilotDatabase,
  ServerSettingsRecord,
  StoredUser,
  UserInterviewsRecord,
  UserJobsRecord,
  UserResumeRecord,
} from "@/types/backend";
import type { InterviewCard } from "@/types/interview";
import type { Job } from "@/types/job";
import type { ResumeData, ResumeTemplate } from "@/types/resume";
import type { JobPilotSettings } from "@/types/settings";

const demoEmail = "demo@jobpilot.local";
const demoPassword = "jobpilot123";

function legacyPasswordHash(password: string) {
  return createHash("sha256")
    .update(`jobpilot-demo:${password}`)
    .digest("hex");
}

function passwordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password: string, storedHash: string) {
  if (!storedHash.startsWith("scrypt$")) {
    return storedHash === legacyPasswordHash(password);
  }

  const [, salt, expectedHash] = storedHash.split("$");

  if (!salt || !expectedHash) {
    return false;
  }

  const actualBuffer = scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expectedHash, "hex");

  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

function createInitialDatabase(): JobPilotDatabase {
  return {
    version: 1,
    users: [
      {
        id: "user-demo",
        email: demoEmail,
        name: "Kimi",
        passwordHash: passwordHash(demoPassword),
        createdAt: new Date().toISOString(),
      },
    ],
    settings: [],
    jobs: [],
    interviews: [],
    resumes: [],
  };
}

export function getDatabasePath() {
  const dataDir =
    process.env.JOBPILOT_DATA_DIR ?? path.join(process.cwd(), ".jobpilot");

  return path.join(dataDir, "jobpilot-db.json");
}

async function ensureDatabase() {
  const databasePath = getDatabasePath();
  await mkdir(path.dirname(databasePath), { recursive: true });

  try {
    await readFile(databasePath, "utf8");
  } catch {
    await writeDatabase(createInitialDatabase());
  }

  return databasePath;
}

export async function readDatabase(): Promise<JobPilotDatabase> {
  const databasePath = await ensureDatabase();
  const raw = await readFile(databasePath, "utf8");
  const database = JSON.parse(raw) as Partial<JobPilotDatabase>;

  return {
    version: 1 as const,
    users: database.users ?? [],
    settings: database.settings ?? [],
    jobs: database.jobs ?? [],
    interviews: database.interviews ?? [],
    resumes: database.resumes ?? [],
  };
}

export async function writeDatabase(database: JobPilotDatabase) {
  const databasePath = getDatabasePath();
  await mkdir(path.dirname(databasePath), { recursive: true });
  const temporaryPath = `${databasePath}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(database, null, 2), "utf8");
  await rename(temporaryPath, databasePath);
}

export async function verifyUser(email: string, password: string) {
  const database = await readDatabase();
  const normalizedEmail = email.trim().toLowerCase();
  const user = database.users.find(
    (candidate) => candidate.email.toLowerCase() === normalizedEmail,
  );

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return null;
  }

  if (!user.passwordHash.startsWith("scrypt$")) {
    user.passwordHash = passwordHash(password);
    await writeDatabase(database);
  }

  return user;
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
) {
  const database = await readDatabase();
  const normalizedEmail = email.trim().toLowerCase();

  if (
    database.users.some(
      (candidate) => candidate.email.toLowerCase() === normalizedEmail,
    )
  ) {
    return { user: null, error: "该邮箱已经注册。" };
  }

  const user: StoredUser = {
    id: `user-${randomBytes(8).toString("hex")}`,
    email: normalizedEmail,
    name: name.trim(),
    passwordHash: passwordHash(password),
    createdAt: new Date().toISOString(),
  };
  database.users.push(user);
  await writeDatabase(database);
  return { user, error: null };
}

export async function getUserById(userId: string) {
  const database = await readDatabase();
  return database.users.find((user) => user.id === userId) ?? null;
}

export async function getSettingsByUserId(userId: string) {
  const database = await readDatabase();
  return (
    database.settings.find((record) => record.userId === userId) ?? null
  );
}

export async function saveSettingsForUser(
  userId: string,
  settings: JobPilotSettings,
) {
  const database = await readDatabase();
  const record: ServerSettingsRecord = {
    userId,
    settings,
    updatedAt: new Date().toISOString(),
  };
  const existingIndex = database.settings.findIndex(
    (candidate) => candidate.userId === userId,
  );

  if (existingIndex >= 0) {
    database.settings[existingIndex] = record;
  } else {
    database.settings.push(record);
  }

  await writeDatabase(database);
  return record;
}

export async function getJobsByUserId(userId: string) {
  const database = await readDatabase();
  return database.jobs.find((record) => record.userId === userId) ?? null;
}

export async function saveJobsForUser(userId: string, jobs: Job[]) {
  const database = await readDatabase();
  const record: UserJobsRecord = {
    userId,
    jobs,
    updatedAt: new Date().toISOString(),
  };
  upsertUserRecord(database.jobs, record);
  await writeDatabase(database);
  return record;
}

export async function getInterviewsByUserId(userId: string) {
  const database = await readDatabase();
  return (
    database.interviews.find((record) => record.userId === userId) ?? null
  );
}

export async function saveInterviewsForUser(
  userId: string,
  interviews: InterviewCard[],
) {
  const database = await readDatabase();
  const record: UserInterviewsRecord = {
    userId,
    interviews,
    updatedAt: new Date().toISOString(),
  };
  upsertUserRecord(database.interviews, record);
  await writeDatabase(database);
  return record;
}

export async function getResumeByUserId(userId: string) {
  const database = await readDatabase();
  return database.resumes.find((record) => record.userId === userId) ?? null;
}

export async function saveResumeForUser(
  userId: string,
  resume: ResumeData,
  template: ResumeTemplate,
) {
  const database = await readDatabase();
  const record: UserResumeRecord = {
    userId,
    resume,
    template,
    updatedAt: new Date().toISOString(),
  };
  upsertUserRecord(database.resumes, record);
  await writeDatabase(database);
  return record;
}

function upsertUserRecord<RecordType extends { userId: string }>(
  records: RecordType[],
  record: RecordType,
) {
  const existingIndex = records.findIndex(
    (candidate) => candidate.userId === record.userId,
  );

  if (existingIndex >= 0) {
    records[existingIndex] = record;
  } else {
    records.push(record);
  }
}

export function toPublicUser(user: StoredUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

export const demoCredentials = {
  email: demoEmail,
  password: demoPassword,
};
