const { chromium } = require('/home/user/medora/extracted/MEDORA-Health-Care-Eco-System-main/node_modules/playwright-core');
(async () => {
  const browser = await chromium.launch({ executablePath: '/home/user/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome', args: ['--no-sandbox','--disable-dev-shm-usage'] });
  const ctx = await browser.newContext({ geolocation: { latitude: 30.0444, longitude: 31.2357 }, permissions: ['geolocation'], viewport: { width: 1280, height: 900 } });
  await ctx.addCookies([{ name: 'aldo_internal_session', value: 'medora-demo-session-2026', url: 'https://doug-learning-overnight-clubs.trycloudflare.com' }]);
  const page = await ctx.newPage();
  for (const [route, name] of [['/finance-hub','finance-hub'],['/supply','supply'],['/attendance','attendance'],['/compliance','compliance'],['/kpi','kpi']]) {
    await page.goto('https://doug-learning-overnight-clubs.trycloudflare.com' + route, { waitUntil: 'networkidle', timeout: 45000 }).catch(()=>{});
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'shots/final6/' + name + '.png' });
    console.log('SHOT_OK', name);
  }
  await browser.close();
  console.log('SHOTS_DONE');
})().catch((e) => { console.log('SHOT_ERR', String(e).slice(0,200)); process.exit(1); });
