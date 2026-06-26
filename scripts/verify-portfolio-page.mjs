import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const outputDir = path.resolve("output/playwright");
const executablePath =
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ executablePath, headless: true });

try {
  const desktop = await browser.newPage({
    viewport: { width: 1440, height: 1024 },
    deviceScaleFactor: 1,
  });

  await desktop.goto("http://127.0.0.1:3000/portfolio", {
    waitUntil: "networkidle",
  });

  await desktop.getByRole("textbox", { name: "搜索项目" }).fill("JobPilot");

  const filteredProjectNames = await desktop
    .locator("article h2")
    .allTextContents();

  await desktop.getByRole("button", { name: "查看详情" }).click();

  const detailVisible = await desktop
    .getByRole("dialog", { name: "JobPilot 求职管理平台" })
    .isVisible();

  await desktop.screenshot({
    path: path.join(outputDir, "jobpilot-portfolio-detail-desktop.png"),
    fullPage: false,
  });

  await desktop.getByRole("button", { name: "复制 Demo" }).click();

  const copyFeedback = await desktop
    .getByText("已复制 JobPilot 求职管理平台 的项目链接", { exact: true })
    .isVisible();

  const desktopMetrics = await desktop.evaluate(
    ({ detailWasVisible, feedbackWasVisible, projectNames }) => ({
      title: document.querySelector("h1")?.textContent?.trim(),
      detailVisible: detailWasVisible,
      copyFeedback: feedbackWasVisible,
      filteredProjectNames: projectNames,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }),
    {
      detailWasVisible: detailVisible,
      feedbackWasVisible: copyFeedback,
      projectNames: filteredProjectNames,
    },
  );

  await desktop.getByRole("button", { name: "重置" }).click();
  await desktop.screenshot({
    path: path.join(outputDir, "jobpilot-portfolio-desktop.png"),
    fullPage: true,
  });

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });

  await mobile.goto("http://127.0.0.1:3000/portfolio", {
    waitUntil: "networkidle",
  });

  const mobileMetrics = await mobile.evaluate(() => ({
    title: document.querySelector("h1")?.textContent?.trim(),
    projectCount: document.querySelectorAll("article h2").length,
    hasPortfolioNavigation: Array.from(document.querySelectorAll("a")).some(
      (link) => link.textContent?.trim() === "作品集",
    ),
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  await mobile.screenshot({
    path: path.join(outputDir, "jobpilot-portfolio-mobile.png"),
    fullPage: true,
  });

  console.log(
    JSON.stringify(
      {
        desktopMetrics,
        mobileMetrics,
        screenshots: [
          path.join(outputDir, "jobpilot-portfolio-desktop.png"),
          path.join(outputDir, "jobpilot-portfolio-detail-desktop.png"),
          path.join(outputDir, "jobpilot-portfolio-mobile.png"),
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
