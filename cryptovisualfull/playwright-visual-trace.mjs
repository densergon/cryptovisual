import { chromium } from "playwright";
import { mkdirSync, existsSync } from "fs";
import { join } from "path";

const BASE_URL = "http://localhost:3000";
const TRACE_DIR = join(process.cwd(), "playwright-trace");
const VIDEO_DIR = join(TRACE_DIR, "videos");

if (!existsSync(VIDEO_DIR)) {
  mkdirSync(VIDEO_DIR, { recursive: true });
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForPageReady(page) {
  // Wait for the main content to appear
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(1500);
}

async function runTrace() {
  console.log("[trace] Launching browser...");

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();

  // Step through the wizard twice
  for (let run = 1; run <= 2; run++) {
    console.log(`\n[trace] ======== RUN ${run} ========`);

    // Start at landing page
    await page.goto(`${BASE_URL}?demo=true`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await waitForPageReady(page);
    console.log(`[trace] Run ${run}: Loaded landing page`);
    await delay(2000);

    // Click start
    const startBtn = page.locator('a[href*="step-1"]').first();
    if (await startBtn.isVisible().catch(() => false)) {
      await startBtn.click();
      await page.waitForURL("**/step-1**", { timeout: 15000 });
      console.log(`[trace] Run ${run}: Navigated to step-1`);
    } else {
      await page.goto(`${BASE_URL}/handshake/step-1?demo=true`, { waitUntil: "domcontentloaded", timeout: 30000 });
    }
    await waitForPageReady(page);
    await delay(3000);

    // Step 1
    console.log(`[trace] Run ${run}: Step 1 (RSA keygen) — observing...`);
    await page.screenshot({ path: join(TRACE_DIR, `run-${run}-step-1.png`), fullPage: false });
    await delay(3000);

    // Navigate to step 2
    await page.goto(`${BASE_URL}/handshake/step-2?demo=true`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await waitForPageReady(page);
    console.log(`[trace] Run ${run}: Step 2 (Session key) — observing...`);
    await delay(3000);
    await page.screenshot({ path: join(TRACE_DIR, `run-${run}-step-2.png`), fullPage: false });
    await delay(3000);

    // Step 3
    await page.goto(`${BASE_URL}/handshake/step-3?demo=true`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await waitForPageReady(page);
    console.log(`[trace] Run ${run}: Step 3 (AES cipher) — observing...`);
    await delay(4000);
    await page.screenshot({ path: join(TRACE_DIR, `run-${run}-step-3.png`), fullPage: false });
    await delay(4000);

    // Step 4
    await page.goto(`${BASE_URL}/handshake/step-4?demo=true`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await waitForPageReady(page);
    console.log(`[trace] Run ${run}: Step 4 (Hybrid envelope) — observing...`);
    await delay(3000);
    await page.screenshot({ path: join(TRACE_DIR, `run-${run}-step-4.png`), fullPage: false });
    await delay(3000);

    // Step 5
    await page.goto(`${BASE_URL}/handshake/step-5?demo=true`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await waitForPageReady(page);
    console.log(`[trace] Run ${run}: Step 5 (Wire simulation) — observing...`);
    await delay(4000);
    await page.screenshot({ path: join(TRACE_DIR, `run-${run}-step-5.png`), fullPage: false });
    await delay(4000);

    // Step 6
    await page.goto(`${BASE_URL}/handshake/step-6?demo=true`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await waitForPageReady(page);
    console.log(`[trace] Run ${run}: Step 6 (Decryption) — observing...`);
    await delay(3000);
    await page.screenshot({ path: join(TRACE_DIR, `run-${run}-step-6.png`), fullPage: false });
    await delay(2000);
  }

  await context.close();
  await browser.close();

  console.log(`\n[trace] Done! Video: ${VIDEO_DIR} | Screenshots: ${TRACE_DIR}`);
}

runTrace().catch((err) => {
  console.error("[trace] Fatal error:", err);
  process.exit(1);
});
