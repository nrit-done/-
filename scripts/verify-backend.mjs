const baseUrl = process.env.JOBPILOT_BASE_URL ?? "http://127.0.0.1:3000";

async function readJson(response) {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

const healthResponse = await fetch(`${baseUrl}/api/health`);
const health = await readJson(healthResponse);

const unauthorizedResponse = await fetch(`${baseUrl}/api/settings`);

const badLoginResponse = await fetch(`${baseUrl}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "demo@jobpilot.local",
    password: "wrong-password",
  }),
});

const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "demo@jobpilot.local",
    password: "jobpilot123",
  }),
});
const login = await readJson(loginResponse);
const cookie = loginResponse.headers.get("set-cookie")?.split(";")[0] ?? "";

const sessionResponse = await fetch(`${baseUrl}/api/auth/session`, {
  headers: { Cookie: cookie },
});
const session = await readJson(sessionResponse);

const settingsPayload = {
  profile: {
    name: "Backend Verified",
    title: "前端开发工程师",
    email: "demo@jobpilot.local",
    phone: "138-0000-0000",
    location: "北京 / 远程",
    github: "https://github.com/kimi-jobpilot",
  },
  appearance: {
    theme: "dark",
    density: "compact",
  },
  notifications: {
    interviewReminder: true,
    applicationReminder: true,
    weeklySummary: true,
    browserNotification: false,
  },
  privacy: {
    showEmailInPortfolio: true,
    includeAtsKeywords: true,
    rememberFilters: true,
  },
};

const writeResponse = await fetch(`${baseUrl}/api/settings`, {
  method: "PUT",
  headers: {
    Cookie: cookie,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(settingsPayload),
});
const writeResult = await readJson(writeResponse);

const readResponse = await fetch(`${baseUrl}/api/settings`, {
  headers: { Cookie: cookie },
});
const readResult = await readJson(readResponse);

const logoutResponse = await fetch(`${baseUrl}/api/auth/session`, {
  method: "DELETE",
  headers: { Cookie: cookie },
});

const registrationEmail = `candidate-${Date.now()}@jobpilot.local`;
const registrationResponse = await fetch(`${baseUrl}/api/auth/register`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Candidate User",
    email: registrationEmail,
    password: "candidate123",
  }),
});
const registration = await readJson(registrationResponse);
const registrationCookie =
  registrationResponse.headers.get("set-cookie")?.split(";")[0] ?? "";

const duplicateRegistrationResponse = await fetch(
  `${baseUrl}/api/auth/register`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Duplicate User",
      email: registrationEmail,
      password: "candidate123",
    }),
  },
);

const isolatedJob = {
  id: `isolated-${Date.now()}`,
  title: "隔离测试岗位",
  company: "Candidate Only Company",
  channel: "注册测试",
  location: "远程",
  status: "pending",
  appliedAt: "2026-06-25",
  skills: ["TypeScript"],
};
const isolatedWriteResponse = await fetch(`${baseUrl}/api/jobs`, {
  method: "PUT",
  headers: {
    Cookie: registrationCookie,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ jobs: [isolatedJob] }),
});
const isolatedReadResponse = await fetch(`${baseUrl}/api/jobs`, {
  headers: { Cookie: registrationCookie },
});
const isolatedRead = await readJson(isolatedReadResponse);
const demoReadResponse = await fetch(`${baseUrl}/api/jobs`, {
  headers: { Cookie: cookie },
});
const demoRead = await readJson(demoReadResponse);

const checks = {
  health:
    healthResponse.ok &&
    health?.status === "ok" &&
    health?.database?.writable === true,
  unauthorizedBlocked: unauthorizedResponse.status === 401,
  invalidPasswordBlocked: badLoginResponse.status === 401,
  login:
    loginResponse.ok &&
    login?.user?.email === "demo@jobpilot.local" &&
    cookie.startsWith("jobpilot_session="),
  session:
    sessionResponse.ok &&
    session?.user?.email === "demo@jobpilot.local",
  settingsWrite:
    writeResponse.ok &&
    writeResult?.record?.settings?.profile?.name === "Backend Verified",
  settingsRead:
    readResponse.ok &&
    readResult?.record?.settings?.profile?.name === "Backend Verified",
  logout: logoutResponse.ok,
  registration:
    registrationResponse.status === 201 &&
    registration?.user?.email === registrationEmail &&
    registrationCookie.startsWith("jobpilot_session="),
  duplicateEmailBlocked: duplicateRegistrationResponse.status === 409,
  userDataIsolation:
    isolatedWriteResponse.ok &&
    isolatedReadResponse.ok &&
    isolatedRead?.record?.jobs?.[0]?.company === "Candidate Only Company" &&
    !demoRead?.record?.jobs?.some(
      (job) => job.company === "Candidate Only Company",
    ),
};

const passed = Object.values(checks).every(Boolean);

console.log(
  JSON.stringify(
    {
      passed,
      checks,
      health,
      user: session?.user ?? null,
      persistedAt: readResult?.record?.updatedAt ?? null,
    },
    null,
    2,
  ),
);

if (!passed) {
  process.exitCode = 1;
}
