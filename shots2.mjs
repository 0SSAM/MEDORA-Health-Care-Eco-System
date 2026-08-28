import { chromium } from 'playwright';
const base = 'http://localhost:3000';
const errs = [];
const browser = await chromium.launch({ args: ['--no-sandbox'] }).catch(e => { console.log('LAUNCH_FAIL:', e.message.split('\n')[0]); process.exit(1); });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text().slice(0,160)); });
await page.goto(base + '/login', { waitUntil: 'networkidle', timeout: 45000 }).catch(()=>{});
await page.waitForTimeout(2500);
await page.screenshot({ path: '/home/user/medora/shots/01-login.png' });
try {
  await page.fill('#internal-username', 'admin');
  await page.fill('#internal-password', 'admin');
  await page.click('button[type=submit]');
  await page.waitForTimeout(8000);
  console.log('URL_AFTER_LOGIN:', page.url());
  await page.screenshot({ path: '/home/user/medora/shots/02-after-login.png' });
} catch (e) { console.log('LOGIN_UI_ERR:', e.message.split('\n')[0]); }
await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 45000 }).catch(()=>{});
await page.waitForTimeout(3000);
await page.screenshot({ path: '/home/user/medora/shots/03-home.png' });
console.log('JS_ERRORS:', errs.length ? errs.join(' || ') : 'none');
await browser.close();
