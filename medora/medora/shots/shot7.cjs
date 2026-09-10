const { chromium } = require('/home/user/medora/extracted/MEDORA-Health-Care-Eco-System-main/node_modules/playwright-core');
(async () => {
  const browser = await chromium.launch({ executablePath: '/home/user/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome', args: ['--no-sandbox','--disable-dev-shm-usage'] });
  const ctx = await browser.newContext({ geolocation: { latitude: 30.0444, longitude: 31.2357 }, permissions: ['geolocation'], viewport: { width: 1280, height: 900 } });
  await ctx.addCookies([{ name: 'aldo_internal_session', value: 'medora-demo-session-2026', url: 'https://doug-learning-overnight-clubs.trycloudflare.com' }]);
  const page = await ctx.newPage();
  const shots = [
    ['/finance-hub','finance-hub'],
    ['/supply','supply'],
    ['/compliance','compliance'],
    ['/attendance','attendance'],
    ['/kpi','kpi'],
  ];
  for (const [route, name] of shots) {
    await page.goto('https://doug-learning-overnight-clubs.trycloudflare.com' + route, { waitUntil: 'networkidle', timeout: 45000 }).catch(()=>{});
    await page.waitForTimeout(4000);
    await page.evaluate(() => document.querySelectorAll('[aria-label]').forEach(b => b.click())).catch(()=>{});
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'shots/final6/' + name + '.png' });
    console.log('SHOT_OK', name);
  }
  // finance live action: post a journal entry via UI
  await page.goto('https://doug-learning-overnight-clubs.trycloudflare.com/finance-hub', { waitUntil: 'networkidle', timeout: 45000 }).catch(()=>{});
  await page.waitForTimeout(3000);
  await page.click('[data-testid="post-journal"]').catch(()=>{});
  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'shots/final6/finance-hub-after-post.png' });
  console.log('SHOT_OK finance-after-post');
  await browser.close();
  console.log('SHOTS_DONE');
})().catch((e) => { console.log('SHOT_ERR', String(e).slice(0, 250)); process.exit(1); });
