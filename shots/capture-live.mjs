import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const dir = "/home/user/medora/extracted/MEDORA-Health-Care-Eco-System-main/shots/final4";
mkdirSync(dir, { recursive: true });
const routes = [
  ["01-welcome", "/"], ["02-login", "/login"], ["03-workspace", "/workspace"],
  ["04-pos", "/pos"], ["05-sales", "/sales"], ["06-operations", "/operations"],
  ["07-finance", "/finance"], ["08-admin", "/admin"], ["09-icd11", "/icd11"],
  ["10-gp-max", "/gp-max"], ["11-delivery", "/delivery"], ["12-notfound", "/nope-xyz"],
];
const exe = "/home/user/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome";
let browser;
try { browser = await chromium.launch({ args: ["--no-sandbox"] }); }
catch { browser = await chromium.launch({ executablePath: exe, args: ["--no-sandbox"] }); }
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
for (const [name, path] of routes) {
  try {
    await page.goto(`http://localhost:3000${path}`, { waitUntil: "load", timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${dir}/${name}.png` });
    console.log("SHOT", name, "OK");
  } catch (e) { console.log("SHOT", name, "ERR", String(e).slice(0, 100)); }
}
await browser.close();
