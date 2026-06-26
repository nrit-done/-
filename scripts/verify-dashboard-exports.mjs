import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = "http://127.0.0.1:3000";
const outputDir = path.resolve("output/playwright");
const executablePath =
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ executablePath, headless: true });

try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1024 },
    acceptDownloads: true,
  });
  const page = await context.newPage();

  await page.goto(`${baseUrl}/system`, { waitUntil: "networkidle" });
  await context.clearCookies();
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "登录演示账号" }).click();
  await page.getByText("登录会话有效", { exact: true }).waitFor();

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.getByText("账号数据", { exact: true }).waitFor();

  const dashboardMetrics = await page.evaluate(() => ({
    title: document.querySelector("h1")?.textContent?.trim(),
    values: Array.from(document.querySelectorAll("main strong"))
      .slice(0, 4)
      .map((node) => node.textContent?.trim()),
    overflow:
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  }));

  const [dashboardDownload] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "导出数据" }).click(),
  ]);
  const dashboardPath = path.join(outputDir, "jobpilot-dashboard.json");
  await dashboardDownload.saveAs(dashboardPath);
  const dashboardData = JSON.parse(await fs.readFile(dashboardPath, "utf8"));

  await page.screenshot({
    path: path.join(outputDir, "jobpilot-dashboard-desktop.png"),
    fullPage: true,
  });

  await page.goto(`${baseUrl}/jobs`, { waitUntil: "networkidle" });
  await page.getByText("账号数据", { exact: true }).waitFor();
  const [jobsDownload] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "导出", exact: true }).click(),
  ]);
  const jobsPath = path.join(outputDir, "jobpilot-jobs.csv");
  await jobsDownload.saveAs(jobsPath);
  const jobsCsv = await fs.readFile(jobsPath, "utf8");

  await page.goto(`${baseUrl}/interviews`, { waitUntil: "networkidle" });
  await page.getByText("账号数据", { exact: true }).waitFor();
  const [calendarDownload] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "新建提醒" }).click(),
  ]);
  const calendarPath = path.join(outputDir, "jobpilot-interviews.ics");
  await calendarDownload.saveAs(calendarPath);
  const calendar = await fs.readFile(calendarPath, "utf8");

  const [interviewsDownload] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "导出", exact: true }).click(),
  ]);
  const interviewsPath = path.join(outputDir, "jobpilot-interviews.json");
  await interviewsDownload.saveAs(interviewsPath);
  const interviews = JSON.parse(await fs.readFile(interviewsPath, "utf8"));

  const mobile = await context.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.goto(baseUrl, { waitUntil: "networkidle" });
  await mobile.getByText("账号数据", { exact: true }).waitFor();
  const mobileMetrics = await mobile.evaluate(() => ({
    title: document.querySelector("h1")?.textContent?.trim(),
    overflow:
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  }));
  await mobile.screenshot({
    path: path.join(outputDir, "jobpilot-dashboard-mobile.png"),
    fullPage: true,
  });

  const result = {
    passed:
      dashboardMetrics.title === "求职进展总览" &&
      dashboardMetrics.overflow === false &&
      dashboardData.source === "account" &&
      dashboardData.stats.length === 4 &&
      jobsCsv.includes('"职位","公司","渠道"') &&
      jobsCsv.includes("Persist Labs") &&
      calendar.includes("BEGIN:VCALENDAR") &&
      calendar.includes("BEGIN:VEVENT") &&
      Array.isArray(interviews) &&
      interviews.length > 0 &&
      mobileMetrics.overflow === false,
    dashboardMetrics,
    dashboardExport: {
      source: dashboardData.source,
      stats: dashboardData.stats.length,
    },
    jobsExport: {
      hasHeader: jobsCsv.includes('"职位","公司","渠道"'),
      hasPersistedJob: jobsCsv.includes("Persist Labs"),
    },
    interviewExports: {
      calendarEvents: (calendar.match(/BEGIN:VEVENT/g) ?? []).length,
      jsonRecords: interviews.length,
    },
    mobileMetrics,
    artifacts: [
      dashboardPath,
      jobsPath,
      calendarPath,
      interviewsPath,
      path.join(outputDir, "jobpilot-dashboard-desktop.png"),
      path.join(outputDir, "jobpilot-dashboard-mobile.png"),
    ],
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.passed) {
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
