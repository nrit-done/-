import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const outputDir = path.resolve("output/playwright");
const pdfOutputDir = path.resolve("output/pdf");
const executablePath =
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(pdfOutputDir, { recursive: true });

const browser = await chromium.launch({ executablePath, headless: true });

try {
  const desktop = await browser.newPage({
    viewport: { width: 1440, height: 1024 },
    deviceScaleFactor: 1,
  });

  await desktop.goto("http://127.0.0.1:3000/resume", {
    waitUntil: "networkidle",
  });
  await desktop.evaluate(() => localStorage.clear());
  await desktop.reload({ waitUntil: "networkidle" });

  await desktop.getByRole("textbox", { name: "姓名" }).fill("Kimi Chen");
  const previewNameUpdated = await desktop
    .getByTestId("resume-preview")
    .getByRole("heading", { name: "Kimi Chen" })
    .isVisible();

  await desktop.getByRole("tab", { name: "项目选择" }).click();
  await desktop.getByRole("checkbox", { name: "选择 Explore 发现社区" }).check();
  await desktop
    .getByRole("checkbox", { name: "选择 Resume Kit 简历生成器" })
    .click();

  const projectLimitFeedback = await desktop
    .getByRole("status")
    .getByText("一份简历最多选择 3 个项目，建议保留与岗位最相关的项目。")
    .isVisible();

  await desktop.getByRole("tab", { name: "岗位适配" }).click();
  await desktop.getByRole("button", { name: "补充岗位关键词" }).click();
  const keywordFeedback = await desktop
    .getByRole("status")
    .getByText(/已将 \d+ 个岗位关键词补充到技能列表/)
    .isVisible();

  await desktop.getByRole("button", { name: "技术" }).click();
  const technicalTemplateSelected =
    (await desktop
      .getByRole("button", { name: "技术" })
      .getAttribute("aria-pressed")) === "true";

  await desktop.getByRole("button", { name: "保存版本" }).click();
  const saveFeedback = await desktop
    .getByRole("status")
    .getByText(/简历版本已保存/)
    .isVisible();
  const localDraftSaved = await desktop.evaluate(
    () => Boolean(localStorage.getItem("jobpilot-resume-draft")),
  );

  await desktop.reload({ waitUntil: "networkidle" });
  await desktop.waitForTimeout(100);

  const restoredName = await desktop
    .getByTestId("resume-preview")
    .getByRole("heading", { name: "Kimi Chen" })
    .isVisible();
  const restoredTemplate =
    (await desktop
      .getByRole("button", { name: "技术" })
      .getAttribute("aria-pressed")) === "true";

  const desktopMetrics = await desktop.evaluate(
    ({
      draftSaved,
      keywordWasVisible,
      limitWasVisible,
      nameRestored,
      nameUpdated,
      saveWasVisible,
      templateRestored,
      templateSelected,
    }) => ({
      title: document.querySelector("h1")?.textContent?.trim(),
      previewNameUpdated: nameUpdated,
      projectLimitFeedback: limitWasVisible,
      keywordFeedback: keywordWasVisible,
      technicalTemplateSelected: templateSelected,
      saveFeedback: saveWasVisible,
      localDraftSaved: draftSaved,
      restoredName: nameRestored,
      restoredTemplate: templateRestored,
      selectedProjectCount: JSON.parse(
        localStorage.getItem("jobpilot-resume-draft") ?? '{"resume":{"projects":[]}}',
      ).resume.projects.filter((project) => project.selected).length,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }),
    {
      draftSaved: localDraftSaved,
      keywordWasVisible: keywordFeedback,
      limitWasVisible: projectLimitFeedback,
      nameRestored: restoredName,
      nameUpdated: previewNameUpdated,
      saveWasVisible: saveFeedback,
      templateRestored: restoredTemplate,
      templateSelected: technicalTemplateSelected,
    },
  );

  await desktop.screenshot({
    path: path.join(outputDir, "jobpilot-resume-desktop.png"),
    fullPage: true,
  });

  await desktop.emulateMedia({ media: "print" });
  await desktop.pdf({
    path: path.join(pdfOutputDir, "jobpilot-resume-preview.pdf"),
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
  });

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });

  await mobile.goto("http://127.0.0.1:3000/resume", {
    waitUntil: "networkidle",
  });

  const mobileMetrics = await mobile.evaluate(() => ({
    title: document.querySelector("h1")?.textContent?.trim(),
    hasPreview: Boolean(document.querySelector('[data-testid="resume-preview"]')),
    hasResumeNavigation: Array.from(document.querySelectorAll("a")).some(
      (link) => link.textContent?.trim() === "简历生成器",
    ),
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  await mobile.screenshot({
    path: path.join(outputDir, "jobpilot-resume-mobile.png"),
    fullPage: true,
  });

  console.log(
    JSON.stringify(
      {
        desktopMetrics,
        mobileMetrics,
        artifacts: [
          path.join(outputDir, "jobpilot-resume-desktop.png"),
          path.join(outputDir, "jobpilot-resume-mobile.png"),
          path.join(pdfOutputDir, "jobpilot-resume-preview.pdf"),
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
