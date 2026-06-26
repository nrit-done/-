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

  await desktop.goto("http://127.0.0.1:3000/interviews", {
    waitUntil: "networkidle",
  });

  await desktop.evaluate(() => {
    const card = document.querySelector(
      'article[aria-label="腾讯 高级前端工程师"]',
    );
    const target = Array.from(document.querySelectorAll("section")).find(
      (section) => section.querySelector("h2")?.textContent === "一面",
    );

    if (!card || !target) {
      throw new Error("Missing drag source or target");
    }

    const dataTransfer = new DataTransfer();
    dataTransfer.setData("text/plain", "interview-002");
    card.dispatchEvent(
      new DragEvent("dragstart", {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      }),
    );
    target.dispatchEvent(
      new DragEvent("dragover", {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      }),
    );
    target.dispatchEvent(
      new DragEvent("drop", {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      }),
    );
  });

  await desktop.waitForTimeout(300);

  const dragSucceeded = await desktop.evaluate(() => {
    const target = Array.from(document.querySelectorAll("section")).find(
      (section) => section.querySelector("h2")?.textContent === "一面",
    );

    return target?.textContent?.includes("腾讯") ?? false;
  });

  await desktop.getByRole("button", { name: /字节跳动 前端开发工程师/ }).click();
  await desktop.locator("select").last().selectOption("second_interview");
  await desktop
    .locator("textarea")
    .first()
    .fill("补充二面系统设计题和项目指标数据。");
  await desktop.getByRole("button", { name: "保存记录" }).click();

  const desktopMetrics = await desktop.evaluate(
    (dragResult) => ({
      title: document.querySelector("h1")?.textContent?.trim(),
      dragSucceeded: dragResult,
      saveFeedback: document.body.innerText.includes("字节跳动 的面试记录已更新"),
      hasDetail: document.body.innerText.includes("面试详情"),
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }),
    dragSucceeded,
  );

  await desktop.screenshot({
    path: path.join(outputDir, "jobpilot-interviews-detail-desktop.png"),
    fullPage: true,
  });
  await desktop.getByRole("button", { name: "关闭", exact: true }).click();
  await desktop.waitForTimeout(200);

  await desktop.screenshot({
    path: path.join(outputDir, "jobpilot-interviews-desktop.png"),
    fullPage: true,
  });

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });

  await mobile.goto("http://127.0.0.1:3000/interviews", {
    waitUntil: "networkidle",
  });

  const mobileMetrics = await mobile.evaluate(() => ({
    title: document.querySelector("h1")?.textContent?.trim(),
    hasBoard: document.body.innerText.includes("流程看板"),
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  await mobile.screenshot({
    path: path.join(outputDir, "jobpilot-interviews-mobile.png"),
    fullPage: true,
  });

  console.log(
    JSON.stringify(
      {
        desktopMetrics,
        mobileMetrics,
        screenshots: [
          path.join(outputDir, "jobpilot-interviews-desktop.png"),
          path.join(outputDir, "jobpilot-interviews-detail-desktop.png"),
          path.join(outputDir, "jobpilot-interviews-mobile.png"),
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
