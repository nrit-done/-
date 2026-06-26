import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const outputDir = path.resolve("output/playwright");
const executablePath =
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const backupPath = path.join(outputDir, "jobpilot-settings-backup.json");

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  executablePath,
  headless: true,
});

try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1024 },
    acceptDownloads: true,
  });
  const desktop = await context.newPage();

  await desktop.goto("http://127.0.0.1:3000/settings", {
    waitUntil: "networkidle",
  });
  await desktop.evaluate(() => localStorage.clear());
  await desktop.reload({ waitUntil: "networkidle" });

  await desktop.getByRole("textbox", { name: "设置姓名" }).fill("Kimi Tester");
  await desktop
    .getByRole("textbox", { name: "设置职位" })
    .fill("高级前端开发工程师");
  await desktop.getByRole("button", { name: /深色/ }).click();
  await desktop.getByRole("button", { name: /紧凑/ }).click();
  await desktop.getByRole("switch", { name: "浏览器通知" }).click();
  await desktop.getByRole("button", { name: "保存设置" }).click();

  const savedFeedback = await desktop
    .getByRole("status")
    .getByText(/设置已保存/)
    .isVisible();
  const savedState = await desktop.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    density: document.documentElement.dataset.density,
    stored: Boolean(localStorage.getItem("jobpilot-settings")),
  }));
  const shellProfileUpdated =
    (await desktop.getByText("Kimi Tester", { exact: true }).count()) >= 1 &&
    (await desktop
      .getByText("高级前端开发工程师", { exact: true })
      .count()) >= 1;

  await desktop.reload({ waitUntil: "networkidle" });
  const restoredAfterReload =
    (await desktop.getByRole("textbox", { name: "设置姓名" }).inputValue()) ===
      "Kimi Tester" &&
    (await desktop
      .getByRole("button", { name: /深色/ })
      .getAttribute("aria-pressed")) === "true";

  const downloadPromise = desktop.waitForEvent("download");
  await desktop.getByRole("button", { name: "导出 JSON 备份" }).click();
  const download = await downloadPromise;
  await download.saveAs(backupPath);
  const backup = JSON.parse(await fs.readFile(backupPath, "utf8"));
  const backupValid =
    backup.app === "JobPilot" &&
    backup.version === 1 &&
    typeof backup.data["jobpilot-settings"] === "string";

  await desktop.getByRole("button", { name: "清空所有本地数据" }).click();
  const resetDialogVisible = await desktop
    .getByRole("dialog", { name: "清空本地数据？" })
    .isVisible();
  await desktop.getByRole("button", { name: "确认清空" }).click();
  const clearedCount = await desktop.evaluate(
    () =>
      Object.keys(localStorage).filter((key) => key.startsWith("jobpilot-"))
        .length,
  );

  await desktop.getByLabel("选择备份文件").setInputFiles(backupPath);
  await desktop
    .getByText("已从 jobpilot-settings-backup.json 恢复 1 项数据。", {
      exact: true,
    })
    .waitFor({ state: "visible" });
  const importFeedback = true;
  const restoredAfterImport =
    (await desktop.getByRole("textbox", { name: "设置姓名" }).inputValue()) ===
      "Kimi Tester" &&
    (await desktop.evaluate(() => document.documentElement.dataset.theme)) ===
      "dark";

  const desktopMetrics = await desktop.evaluate(
    ({
      backupWasValid,
      clearCount,
      importWasVisible,
      profileWasUpdated,
      reloadRestored,
      resetWasVisible,
      saveWasVisible,
      state,
      importRestored,
    }) => ({
      title: document.querySelector("h1")?.textContent?.trim(),
      saveFeedback: saveWasVisible,
      theme: state.theme,
      density: state.density,
      settingsStored: state.stored,
      shellProfileUpdated: profileWasUpdated,
      restoredAfterReload: reloadRestored,
      backupValid: backupWasValid,
      resetDialogVisible: resetWasVisible,
      clearedCount: clearCount,
      importFeedback: importWasVisible,
      restoredAfterImport: importRestored,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }),
    {
      backupWasValid: backupValid,
      clearCount: clearedCount,
      importWasVisible: importFeedback,
      profileWasUpdated: shellProfileUpdated,
      reloadRestored: restoredAfterReload,
      resetWasVisible: resetDialogVisible,
      saveWasVisible: savedFeedback,
      state: savedState,
      importRestored: restoredAfterImport,
    },
  );

  await desktop.screenshot({
    path: path.join(outputDir, "jobpilot-settings-desktop.png"),
    fullPage: true,
  });

  const mobile = await context.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.goto("http://127.0.0.1:3000/settings", {
    waitUntil: "networkidle",
  });

  const mobileMetrics = await mobile.evaluate(() => ({
    title: document.querySelector("h1")?.textContent?.trim(),
    theme: document.documentElement.dataset.theme,
    hasSettingsNavigation: Array.from(document.querySelectorAll("a")).some(
      (link) => link.textContent?.trim() === "设置",
    ),
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  await mobile.screenshot({
    path: path.join(outputDir, "jobpilot-settings-mobile.png"),
    fullPage: true,
  });

  console.log(
    JSON.stringify(
      {
        desktopMetrics,
        mobileMetrics,
        artifacts: [
          path.join(outputDir, "jobpilot-settings-desktop.png"),
          path.join(outputDir, "jobpilot-settings-mobile.png"),
          backupPath,
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
