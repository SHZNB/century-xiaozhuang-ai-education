import { existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const url = process.env.VISUAL_URL || 'http://127.0.0.1:8080/';
const outDir = resolve('screenshots');
mkdirSync(outDir, { recursive: true });

const chromeCandidates = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
];

const executablePath = chromeCandidates.find((path) => existsSync(path));
const browser = await chromium.launch({
  headless: true,
  ...(executablePath ? { executablePath } : {})
});

const errors = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});
page.on('pageerror', (error) => errors.push(error.message));

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForSelector('.hero-banner', { timeout: 10000 });
const desktopPath = resolve(outDir, 'home-desktop.png');
await page.screenshot({ path: desktopPath, fullPage: true });

const loginVisible = await page.locator('#loginScreen.active, .login-screen:not([hidden])').count();
const title = await page.locator('.hero-copy h2').first().textContent();

await page.setViewportSize({ width: 390, height: 1000 });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForSelector('.hero-banner', { timeout: 10000 });
const mobilePath = resolve(outDir, 'home-mobile.png');
await page.screenshot({ path: mobilePath, fullPage: true });

await browser.close();

console.log(JSON.stringify({
  url,
  loginVisible: Boolean(loginVisible),
  title,
  desktop: desktopPath,
  mobile: mobilePath,
  errors
}, null, 2));
