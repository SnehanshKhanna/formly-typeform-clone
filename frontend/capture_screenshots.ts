import { chromium, test } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const SCREENSHOTS_DIR = path.join(__dirname, '../docs/screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function capture() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // Dashboard
  await page.goto('http://localhost:3000/');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'dashboard.png') });

  // Dashboard Empty (if we had no forms, but we have seeded ones, so we'll skip empty for now)

  // Builder (assuming demo-feedback is the first form)
  await page.click('text=Customer Satisfaction Survey');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'builder.png') });

  // Results
  const builderUrl = page.url();
  const resultsUrl = builderUrl.replace('/create', '/results');
  await page.goto(resultsUrl);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'results_summary.png') });



  // Player Public
  await page.goto('http://localhost:3000/f/demo-form-1');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'player_public.png') });

  await browser.close();
}

capture().catch(console.error);
