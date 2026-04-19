import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.DOC_BASE_URL || "http://127.0.0.1:3000";
const outDir = path.resolve("documents", "images");

const targets = [
  { name: "home", path: "/" },
  { name: "event-list", path: "/event-list" },
  { name: "signin", path: "/signin" },
  { name: "dashboard", path: "/dashboard" },
  { name: "super-admin", path: "/dashboard/super-admin" },
];

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function capture() {
  await ensureDir(outDir);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
  });
  const page = await context.newPage();

  const report = [];

  for (const target of targets) {
    const targetUrl = `${baseUrl}${target.path}`;
    await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(800);

    const finalUrl = page.url();
    const title = await page.title();
    const fileName = `${target.name}.png`;
    const filePath = path.join(outDir, fileName);

    await page.screenshot({ path: filePath, fullPage: true });

    report.push({
      name: target.name,
      requestedPath: target.path,
      requestedUrl: targetUrl,
      finalUrl,
      title,
      file: `images/${fileName}`,
      redirected: finalUrl !== targetUrl,
    });
  }

  await browser.close();

  const reportPath = path.resolve("documents", "screenshot-report.json");
  await fs.writeFile(
    reportPath,
    JSON.stringify(
      { baseUrl, generatedAt: new Date().toISOString(), report },
      null,
      2,
    ),
  );

  console.log(`Generated ${report.length} screenshots in ${outDir}`);
  console.log(`Report: ${reportPath}`);
}

capture().catch((error) => {
  console.error(error);
  process.exit(1);
});
