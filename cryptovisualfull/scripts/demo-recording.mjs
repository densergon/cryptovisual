#!/usr/bin/env node
/**
 * CryptoVisual Demo Recording Script
 *
 * Captures screenshots and records a WebM screencast of the full wizard flow.
 * Run via: pnpm run demo:recording
 *
 * Requirements:
 *   pnpm add -D @playwright/test playwright
 *   npx playwright install chromium
 */

import { chromium } from "@playwright/test";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const MEDIA_DIR = join(ROOT, "docs", "portfolio", "media");

const SCREENSHOT_DIR = join(MEDIA_DIR, "screenshots");
const SCREENCAST_FILE = join(MEDIA_DIR, "demo.webm");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const WIZARD_STEPS = [
	{ path: "/handshake/step-1", name: "rsa-keygen", delay: 3000 },
	{ path: "/handshake/step-2", name: "session-key", delay: 2000 },
	{ path: "/handshake/step-3", name: "aes-cipher", delay: 4000 },
	{ path: "/handshake/step-4", name: "hybrid-envelope", delay: 2000 },
	{ path: "/handshake/step-5", name: "wire-simulation", delay: 4000 },
	{ path: "/handshake/step-6", name: "decryption", delay: 2000 },
];

async function ensureDirectories() {
	if (!existsSync(SCREENSHOT_DIR)) {
		mkdirSync(SCREENSHOT_DIR, { recursive: true });
		console.log(`[demo] Created directory: ${SCREENSHOT_DIR}`);
	}
}

async function takeScreenshot(
	browser,
	page,
	step,
	index,
) {
	const screenshotPath = join(SCREENSHOT_DIR, `step-${index + 1}-${step.name}.png`);

	try {
		await page.screenshot({
			path: screenshotPath,
			fullPage: false,
		});
		console.log(`[demo] Captured: step-${index + 1}-${step.name}.png`);
	} catch (err) {
		console.warn(`[demo] Screenshot failed for ${step.name}:`, err.message);
	}
}

async function recordDemo() {
	console.log("[demo] Starting CryptoVisual demo recording...");
	console.log(`[demo] Base URL: ${BASE_URL}`);
	console.log(`[demo] Output directory: ${MEDIA_DIR}`);

	await ensureDirectories();

	const browser = await chromium.launch({
		headless: true,
		args: [
			"--no-sandbox",
			"--disable-setuid-sandbox",
			"--disable-dev-shm-usage",
		],
	});

	const context = await browser.newContext({
		viewport: { width: 1280, height: 720 },
		recordVideo: {
			dir: MEDIA_DIR,
			name: "demo.webm",
			size: { width: 1280, height: 720 },
		},
	});

	const page = await context.newPage();

	try {
		await page.goto(BASE_URL, { waitUntil: "networkidle" });
		console.log("[demo] Loaded landing page");

		await page.waitForTimeout(2000);

		const startButton = page.locator('a[href*="step-1"]').first();
		if (await startButton.isVisible()) {
			await startButton.click();
			await page.waitForURL("**/step-1**", { timeout: 10000 });
			console.log("[demo] Navigated to wizard step 1");
		} else {
			console.log("[demo] Could not find start button, navigating directly");
			await page.goto(`${BASE_URL}/handshake/step-1`, {
				waitUntil: "networkidle",
			});
		}

		for (let i = 0; i < WIZARD_STEPS.length; i++) {
			const step = WIZARD_STEPS[i];

			if (i > 0) {
				await page.goto(`${BASE_URL}${step.path}`, {
					waitUntil: "networkidle",
				});
			}

			console.log(`[demo] Step ${i + 1}: ${step.name}`);

			await page.waitForTimeout(step.delay / 2);

			await takeScreenshot(browser, page, step, i);

			await page.waitForTimeout(step.delay / 2);
		}

		console.log("[demo] Recording complete!");
		console.log(`[demo] Screenshots: ${SCREENSHOT_DIR}`);
		console.log(`[demo] Screencast: ${SCREENCAST_FILE}`);

	} catch (error) {
		console.error("[demo] Recording failed:", error);
		throw error;
	} finally {
		await context.close();
		await browser.close();
	}

	console.log("[demo] Demo recording finished successfully.");
}

recordDemo().catch((err) => {
	console.error("[demo] Fatal error:", err);
	process.exit(1);
});