import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.DOC_BASE_URL || "http://127.0.0.1:3000";
const outDir = path.resolve("documents", "images", "real");
const profileDir = path.resolve(".playwright-doc-profile");
const reportPath = path.resolve("documents", "screenshot-report-real.json");

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function bypassSecurityWarningIfPresent(page) {
  const current = page.url();
  const title = await page.title();

  const looksLikeInterstitial =
    current.includes("chrome-error://") ||
    current.includes("about:blank") ||
    /privacy error|your connection is not private|保護されていません|安全ではありません/i.test(
      title,
    );

  if (!looksLikeInterstitial) {
    return false;
  }

  // Chromium cert warning: click "Advanced" -> "Proceed" when present.
  const advancedButton = page.locator("#details-button");
  if ((await advancedButton.count()) > 0) {
    await advancedButton.first().click();
    const proceedLink = page.locator("#proceed-link");
    if ((await proceedLink.count()) > 0) {
      await proceedLink.first().click();
      await page.waitForLoadState("domcontentloaded", { timeout: 30000 });
      return true;
    }
  }

  return false;
}

function sanitizeFileName(value) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-").replace(/-+/g, "-");
}

async function capturePage(page, report, name, targetPath) {
  const targetUrl = `${baseUrl}${targetPath}`;
  await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 90000 });
  await bypassSecurityWarningIfPresent(page);
  await page.waitForLoadState("domcontentloaded");

  const fileName = `${sanitizeFileName(name)}.png`;
  const filePath = path.join(outDir, fileName);
  await page.screenshot({ path: filePath, fullPage: true });

  const finalUrl = page.url();
  report.push({
    name,
    requestedPath: targetPath,
    requestedUrl: targetUrl,
    finalUrl,
    title: await page.title(),
    file: `images/real/${fileName}`,
    redirected: finalUrl !== targetUrl,
  });

  return finalUrl;
}

async function ensureDashboardAuth(page) {
  const targetUrl = `${baseUrl}/dashboard`;
  await page.goto(targetUrl, {
    waitUntil: "networkidle",
    timeout: 90000,
  });
  await bypassSecurityWarningIfPresent(page);
  return !page.url().includes("/signin");
}

async function findFirstEventPath(page) {
  await page.goto(`${baseUrl}/event-list`, {
    waitUntil: "networkidle",
    timeout: 90000,
  });
  await bypassSecurityWarningIfPresent(page);

  const href = await page
    .locator('a[href^="/event/"]')
    .first()
    .getAttribute("href");

  return href || null;
}

async function findFirstStorePath(page) {
  const candidates = page.locator('a[href*="/store/"]');
  const count = await candidates.count();
  if (count === 0) {
    return null;
  }
  const href = await candidates.first().getAttribute("href");
  return href || null;
}

async function main() {
  await ensureDir(outDir);

  const context = await chromium.launchPersistentContext(profileDir, {
    headless: false,
    viewport: { width: 1600, height: 1000 },
    ignoreHTTPSErrors: true,
    args: ["--ignore-certificate-errors"],
    channel: "chrome",
  });

  const page = context.pages()[0] || (await context.newPage());
  const report = [];

  const signedIn = await ensureDashboardAuth(page);
  if (!signedIn) {
    console.log(
      "[warn] ダッシュボードは未サインインでした。Google OAuth自動サインインは行わず、公開ページと(event)配下の撮影を継続します。",
    );
  }

  await capturePage(page, report, "home", "/");
  await capturePage(page, report, "event-list", "/event-list");
  await capturePage(page, report, "signin", "/signin");

  if (signedIn) {
    await capturePage(page, report, "dashboard", "/dashboard");
    await capturePage(page, report, "super-admin", "/dashboard/super-admin");
  }

  await capturePage(page, report, "user", "/user");
  await capturePage(page, report, "user-tickets", "/user/tickets");
  await capturePage(page, report, "user-settings", "/user/settings");

  const eventPath = await findFirstEventPath(page);

  if (eventPath) {
    await capturePage(page, report, "event-top", eventPath);

    await capturePage(
      page,
      report,
      "event-store-list",
      `${eventPath}/store-list`,
    );
    await capturePage(
      page,
      report,
      "event-waiting-status",
      `${eventPath}/attraction/waiting-status`,
    );
    await capturePage(
      page,
      report,
      "event-issue-ticket",
      `${eventPath}/issue-ticket`,
    );

    const storePath = await findFirstStorePath(page);
    if (storePath) {
      await capturePage(page, report, "event-store-detail", storePath);
    }
  }

  await fs.writeFile(
    reportPath,
    JSON.stringify(
      {
        baseUrl,
        generatedAt: new Date().toISOString(),
        profileDir,
        report,
      },
      null,
      2,
    ),
  );

  await context.close();

  console.log(`Generated ${report.length} screenshots in ${outDir}`);
  console.log(`Report: ${reportPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
