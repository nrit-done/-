import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const outputDir = path.resolve("output/playwright");
const executablePath =
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ executablePath, headless: true });

try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1024 },
  });
  const desktop = await context.newPage();

  await desktop.goto("http://127.0.0.1:3000/system", {
    waitUntil: "networkidle",
  });
  await context.clearCookies();
  await desktop.reload({ waitUntil: "networkidle" });
  await desktop.getByRole("button", { name: "登录演示账号" }).click();
  await desktop.getByText("登录会话有效", { exact: true }).waitFor({
    state: "visible",
  });

  await desktop.goto("http://127.0.0.1:3000/jobs", {
    waitUntil: "networkidle",
  });
  await desktop.getByText("账号数据", { exact: true }).waitFor({
    state: "visible",
  });
  await desktop.getByRole("button", { name: "新增岗位" }).click();
  const jobDialog = desktop.getByRole("dialog", { name: "新增岗位" });
  const jobInputs = jobDialog.locator("input");
  await jobInputs.nth(0).fill("账号持久化前端工程师");
  await jobInputs.nth(1).fill("Persist Labs");
  await jobInputs.nth(2).fill("内推");
  await jobInputs.nth(3).fill("远程");
  await jobDialog.getByRole("button", { name: "保存岗位" }).click();
  await desktop.getByText("已新增 Persist Labs 的岗位记录", {
    exact: true,
  }).waitFor({ state: "visible" });
  await desktop.reload({ waitUntil: "networkidle" });
  await desktop.getByText("Persist Labs", { exact: true }).first().waitFor({
    state: "visible",
  });
  const jobPersisted = (await desktop.getByText("Persist Labs", {
    exact: true,
  }).count()) >= 1;

  await desktop.screenshot({
    path: path.join(outputDir, "jobpilot-account-jobs-desktop.png"),
    fullPage: true,
  });

  await desktop.goto("http://127.0.0.1:3000/interviews", {
    waitUntil: "networkidle",
  });
  await desktop.getByText("账号数据", { exact: true }).waitFor({
    state: "visible",
  });
  await desktop
    .getByRole("button", { name: "字节跳动 前端开发工程师" })
    .click();
  const interviewDialog = desktop.getByRole("dialog", { name: "面试详情" });
  await interviewDialog.locator("select").selectOption("second_interview");
  await interviewDialog.getByRole("button", { name: "保存记录" }).click();
  await desktop.getByText("字节跳动 的面试记录已更新", {
    exact: true,
  }).waitFor({ state: "visible" });
  await desktop.reload({ waitUntil: "networkidle" });
  const interviewPersisted = await desktop.evaluate(() => {
    const sections = Array.from(document.querySelectorAll("section"));
    return sections.some(
      (section) =>
        section.querySelector("h2")?.textContent?.trim() === "二面" &&
        section.textContent?.includes("字节跳动"),
    );
  });

  await desktop.goto("http://127.0.0.1:3000/resume", {
    waitUntil: "networkidle",
  });
  await desktop.getByText("账号草稿", { exact: true }).waitFor({
    state: "visible",
  });
  await desktop.getByRole("textbox", { name: "姓名" }).fill("Server Resume User");
  await desktop.getByRole("button", { name: "保存版本" }).click();
  await desktop.getByText(/简历已保存到本地和当前账号/).waitFor({
    state: "visible",
  });
  await desktop.reload({ waitUntil: "networkidle" });
  await desktop
    .getByTestId("resume-preview")
    .getByRole("heading", { name: "Server Resume User" })
    .waitFor({ state: "visible" });
  const resumePersisted = await desktop
    .getByTestId("resume-preview")
    .getByRole("heading", { name: "Server Resume User" })
    .isVisible();

  const desktopMetrics = await desktop.evaluate(
    ({ interviewSaved, jobSaved, resumeSaved }) => ({
      jobPersisted: jobSaved,
      interviewPersisted: interviewSaved,
      resumePersisted: resumeSaved,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }),
    {
      interviewSaved: interviewPersisted,
      jobSaved: jobPersisted,
      resumeSaved: resumePersisted,
    },
  );

  await desktop.screenshot({
    path: path.join(outputDir, "jobpilot-account-resume-desktop.png"),
    fullPage: true,
  });

  const mobile = await context.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.goto("http://127.0.0.1:3000/jobs", {
    waitUntil: "networkidle",
  });
  await mobile.getByText("账号数据", { exact: true }).waitFor({
    state: "visible",
  });
  const mobileMetrics = await mobile.evaluate(() => ({
    hasPersistedJob: document.body.innerText.includes("Persist Labs"),
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  await mobile.screenshot({
    path: path.join(outputDir, "jobpilot-account-jobs-mobile.png"),
    fullPage: true,
  });

  const registrationContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const registrationPage = await registrationContext.newPage();
  const registrationEmail = `ui-${Date.now()}@jobpilot.local`;
  await registrationPage.goto("http://127.0.0.1:3000/system", {
    waitUntil: "networkidle",
  });
  await registrationPage.getByRole("button", { name: "注册" }).click();
  await registrationPage
    .getByRole("textbox", { name: "注册姓名" })
    .fill("UI Registered User");
  await registrationPage
    .getByRole("textbox", { name: "注册邮箱" })
    .fill(registrationEmail);
  await registrationPage
    .getByLabel("注册密码")
    .fill("registered123");
  await registrationPage.getByRole("button", { name: "创建并登录" }).click();
  await registrationPage.getByText("登录会话有效", { exact: true }).waitFor({
    state: "visible",
  });
  const registrationUi = await registrationPage
    .getByText(registrationEmail, { exact: true })
    .isVisible();
  await registrationContext.close();

  console.log(
    JSON.stringify(
      {
        desktopMetrics,
        mobileMetrics,
        registrationUi,
        screenshots: [
          path.join(outputDir, "jobpilot-account-jobs-desktop.png"),
          path.join(outputDir, "jobpilot-account-resume-desktop.png"),
          path.join(outputDir, "jobpilot-account-jobs-mobile.png"),
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
