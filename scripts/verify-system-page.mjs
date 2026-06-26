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
  await desktop.evaluate(() => localStorage.clear());
  await desktop.reload({ waitUntil: "networkidle" });

  await desktop.getByText("运行正常", { exact: true }).waitFor({
    state: "visible",
  });
  await desktop.getByRole("button", { name: "登录演示账号" }).click();
  await desktop.getByText("登录会话有效", { exact: true }).waitFor({
    state: "visible",
  });

  const loginFeedback = await desktop
    .getByRole("status")
    .getByText("已登录 demo@jobpilot.local", { exact: true })
    .isVisible();

  await desktop.goto("http://127.0.0.1:3000/settings", {
    waitUntil: "networkidle",
  });
  await desktop.getByText("会话有效", { exact: true }).waitFor({
    state: "visible",
  });

  await desktop
    .getByRole("textbox", { name: "设置姓名" })
    .fill("Cloud Synced User");
  await desktop.getByRole("button", { name: "保存设置" }).click();
  await desktop.getByRole("button", { name: "上传当前设置" }).click();
  await desktop
    .getByText("当前设置已保存到服务端数据库。", { exact: true })
    .waitFor({ state: "visible" });

  await desktop
    .getByRole("textbox", { name: "设置姓名" })
    .fill("Local Temporary User");
  await desktop.getByRole("button", { name: "从服务端恢复" }).click();
  await desktop
    .getByText("已从服务端恢复设置并写入本地。", { exact: true })
    .waitFor({ state: "visible" });

  const restoredName = await desktop
    .getByRole("textbox", { name: "设置姓名" })
    .inputValue();
  const persistedResponse = await desktop.evaluate(async () => {
    const response = await fetch("/api/settings", { cache: "no-store" });
    const result = await response.json();
    return {
      ok: response.ok,
      name: result.record?.settings?.profile?.name ?? null,
    };
  });

  await desktop.goto("http://127.0.0.1:3000/system", {
    waitUntil: "networkidle",
  });

  const desktopMetrics = await desktop.evaluate(
    ({ feedbackVisible, restored, serverResult }) => ({
      title: document.querySelector("h1")?.textContent?.trim(),
      loginFeedback: feedbackVisible,
      sessionValid: document.body.innerText.includes("登录会话有效"),
      apiOnline: document.body.innerText.includes("运行正常"),
      databaseWritable: document.body.innerText.includes("读写正常"),
      restoredName: restored,
      serverSettingsName: serverResult.name,
      serverSettingsReadable: serverResult.ok,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }),
    {
      feedbackVisible: loginFeedback,
      restored: restoredName,
      serverResult: persistedResponse,
    },
  );

  await desktop.screenshot({
    path: path.join(outputDir, "jobpilot-system-desktop.png"),
    fullPage: true,
  });

  const mobile = await context.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.goto("http://127.0.0.1:3000/system", {
    waitUntil: "networkidle",
  });
  await mobile.getByText("登录会话有效", { exact: true }).waitFor({
    state: "visible",
  });

  const mobileMetrics = await mobile.evaluate(() => ({
    title: document.querySelector("h1")?.textContent?.trim(),
    sessionValid: document.body.innerText.includes("登录会话有效"),
    hasSystemNavigation: Array.from(document.querySelectorAll("a")).some(
      (link) => link.textContent?.trim() === "账号与服务",
    ),
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  await mobile.screenshot({
    path: path.join(outputDir, "jobpilot-system-mobile.png"),
    fullPage: true,
  });

  console.log(
    JSON.stringify(
      {
        desktopMetrics,
        mobileMetrics,
        screenshots: [
          path.join(outputDir, "jobpilot-system-desktop.png"),
          path.join(outputDir, "jobpilot-system-mobile.png"),
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
