const { chromium } = require('/home/user/medora/extracted/MEDORA-Health-Care-Eco-System-main/node_modules/playwright-core');
(async () => {
  const browser = await chromium.launch({ executablePath: '/home/user/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome', args: ['--no-sandbox','--disable-dev-shm-usage'] });
  const ctx = await browser.newContext({
    geolocation: { latitude: 30.0444, longitude: 31.2357 },
    permissions: ['geolocation'],
    viewport: { width: 1280, height: 900 },
  });
  await ctx.addCookies([{ name: 'aldo_internal_session', value: 'medora-demo-session-2026', url: 'http://localhost:3000' }]);
  const page = await ctx.newPage();
  const targets = [['/compliance','compliance'], ['/attendance','attendance'], ['/kpi','kpi']];
  for (const [route, name] of targets) {
    await page.goto('http://localhost:3000' + route, { waitUntil: 'networkidle', timeout: 30000 }).catch(()=>{});
    await page.waitForTimeout(3500);
    await page.screenshot({ path: 'shots/final5/' + name + '.png' });
    console.log('SHOT_OK', name);
  }
  await page.goto('http://localhost:3000/compliance', { waitUntil: 'networkidle', timeout: 30000 }).catch(()=>{});
  await page.waitForTimeout(1500);
  await page.fill('input', '(01)06221234567891(17)281231(10)B123(21)S9F3').catch(()=>{});
  await page.click('text=تحقق').catch(()=>{});
  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'shots/final5/compliance-datamatrix.png' });
  console.log('SHOT_OK datamatrix');
  await page.click('[data-testid="toggle-capture"]').catch(()=>{});
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'shots/final5/compliance-capture-armed.png' });
  console.log('SHOT_OK capture');
  await browser.close();
  console.log('SHOTS_DONE');
})().catch((e) => { console.log('SHOT_ERR', String(e).slice(0, 300)); process.exit(1); });
