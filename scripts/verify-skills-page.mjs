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

  await desktop.goto("http://127.0.0.1:3000/skills", {
    waitUntil: "networkidle",
  });

  await desktop.getByLabel("搜索技能").fill("性能");
  await desktop.getByRole("button", { name: /查看详情/ }).first().click();
  const detailVisible = await desktop
    .getByRole("heading", { name: "性能优化 技能详情" })
    .isVisible();
  await desktop.getByRole("button", { name: "加入学习计划" }).click();
  const planFeedback = await desktop.evaluate(() =>
    document.body.innerText.includes("已将 性能优化 加入本周学习计划"),
  );
  await desktop.getByRole("button", { name: "重置" }).click();
  await desktop.getByRole("button", { name: "只看缺口" }).click();
  const gapFeedback = await desktop.evaluate(() =>
    document.body.innerText.includes("已切换为关键缺口视图"),
  );

  const desktopMetrics = await desktop.evaluate(([detailWasVisible, planWasVisible, gapWasVisible]) => ({
    title: document.querySelector("h1")?.textContent?.trim(),
    detailVisible: detailWasVisible,
    hasPlanFeedback: planWasVisible,
    hasGapFeedback: gapWasVisible,
    gapView: document.body.innerText.includes("关键缺口"),
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }), [detailVisible, planFeedback, gapFeedback]);

  await desktop.screenshot({
    path: path.join(outputDir, "jobpilot-skills-desktop.png"),
    fullPage: true,
  });

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });

  await mobile.goto("http://127.0.0.1:3000/skills", {
    waitUntil: "networkidle",
  });

  const mobileMetrics = await mobile.evaluate(() => ({
    title: document.querySelector("h1")?.textContent?.trim(),
    hasMatrix: document.body.innerText.includes("技能匹配矩阵"),
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  await mobile.screenshot({
    path: path.join(outputDir, "jobpilot-skills-mobile.png"),
    fullPage: true,
  });

  console.log(
    JSON.stringify(
      {
        desktopMetrics,
        mobileMetrics,
        screenshots: [
          path.join(outputDir, "jobpilot-skills-desktop.png"),
          path.join(outputDir, "jobpilot-skills-mobile.png"),
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
