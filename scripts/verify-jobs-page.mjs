import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const outputDir = "G:/前端/jobpilot/output/playwright";
const executablePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ executablePath, headless: true });

try {
  const desktop = await browser.newPage({
    viewport: { width: 1440, height: 1024 },
    deviceScaleFactor: 1,
  });

  await desktop.goto("http://127.0.0.1:3000/jobs", {
    waitUntil: "networkidle",
  });
  await desktop.getByRole("button", { name: "新增岗位" }).click();
  await desktop.locator("#job-form input").nth(0).fill("前端可视化工程师");
  await desktop.locator("#job-form input").nth(1).fill("OpenAI Demo Team");
  await desktop.locator("#job-form input").nth(2).fill("作品集投递");
  await desktop.locator("#job-form input").nth(3).fill("远程");
  await desktop.locator("#job-form input").nth(4).fill("30k-45k");
  await desktop.locator("#job-form select").first().selectOption("first_interview");
  await desktop.locator("#job-form input").nth(5).fill("2026-06-23");
  await desktop.locator("#job-form input").nth(6).fill("https://example.com/jobpilot-demo");
  await desktop.locator("#job-form input").nth(7).fill("React、TypeScript、Recharts、Next.js");
  await desktop.locator("#job-form textarea").fill("用于面试展示的岗位管理完整流程。");
  await desktop.getByRole("button", { name: "保存岗位" }).click();
  await desktop.waitForTimeout(300);

  const desktopMetrics = await desktop.evaluate(() => ({
    title: document.querySelector("h1")?.textContent?.trim(),
    hasNewJob: document.body.innerText.includes("前端可视化工程师"),
    hasFeedback: document.body.innerText.includes("已新增 OpenAI Demo Team 的岗位记录"),
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  await desktop.screenshot({
    path: path.join(outputDir, "jobpilot-jobs-desktop.png"),
    fullPage: true,
  });

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });

  await mobile.goto("http://127.0.0.1:3000/jobs", {
    waitUntil: "networkidle",
  });

  const mobileMetrics = await mobile.evaluate(() => ({
    title: document.querySelector("h1")?.textContent?.trim(),
    hasTable: document.body.innerText.includes("岗位列表"),
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  await mobile.screenshot({
    path: path.join(outputDir, "jobpilot-jobs-mobile.png"),
    fullPage: true,
  });

  console.log(
    JSON.stringify(
      {
        desktopMetrics,
        mobileMetrics,
        screenshots: [
          path.join(outputDir, "jobpilot-jobs-desktop.png"),
          path.join(outputDir, "jobpilot-jobs-mobile.png"),
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
