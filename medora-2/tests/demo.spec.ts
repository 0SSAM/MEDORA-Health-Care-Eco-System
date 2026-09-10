import { test, expect } from '@playwright/test';

test('all existing and new routes are reachable', async ({ request }) => {
  for (const path of ['/', '/dashboard', '/sales', '/purchases', '/inventory', '/customers', '/suppliers', '/team', '/reports', '/settings', '/help', '/api/health']) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
  expect((await request.get('/missing-module')).status()).toBe(404);
});

test('demo sessions isolate CRUD and restore original records', async ({ playwright, baseURL }) => {
  const a = await playwright.request.newContext({ baseURL });
  const b = await playwright.request.newContext({ baseURL });
  try {
    const first = await (await a.get('/api/demo')).json();
    const second = await (await b.get('/api/demo')).json();
    expect(first.records).toHaveLength(23);
    expect(first.records[0].id).not.toBe(second.records[0].id);
    const record = { action: 'create', module: 'sales', name: 'عميل اختبار مستقل', amount: 750, date: '2026-06-20', status: 'مكتملة', detail: 'اختبار آلي' };
    expect((await a.post('/api/demo', { data: record })).status()).toBe(200);
    const updated = await (await a.get('/api/demo')).json();
    const created = updated.records.find((r: { name: string }) => r.name === record.name);
    expect(created).toBeTruthy();
    expect((await (await b.get('/api/demo')).json()).records).toHaveLength(23);
    expect((await b.post('/api/demo', { data: { ...record, action: 'update', id: created.id } })).status()).toBe(404);
    expect((await a.post('/api/demo', { data: { ...record, action: 'update', id: created.id, amount: 950 } })).status()).toBe(200);
    expect((await a.post('/api/demo', { data: { ...record, amount: -5 } })).status()).toBe(400);
    expect((await a.post('/api/demo', { data: { action: 'delete', id: created.id } })).status()).toBe(200);
    expect((await a.post('/api/demo', { data: { action: 'reset' } })).status()).toBe(200);
    expect((await (await a.get('/api/demo')).json()).records).toHaveLength(23);
    expect((await (await b.get('/api/demo')).json()).records).toHaveLength(23);
  } finally { await a.dispose(); await b.dispose(); }
});

test('visitor creates searches edits and exports an invoice without login', async ({ page }) => {
  await page.goto('/sales');
  const add = page.getByRole('button', { name: 'إضافة فاتورة بيع', exact: true });
  await expect(add).toBeEnabled();
  await add.click();
  await page.getByRole('textbox', { name: 'اسم العميل' }).fill('عميل اختبار الواجهة');
  await page.getByRole('spinbutton').fill('1200');
  await page.getByRole('button', { name: 'حفظ السجل', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await page.getByRole('textbox', { name: 'البحث في السجلات' }).fill('عميل اختبار الواجهة');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await page.getByRole('button', { name: 'عرض وتعديل عميل اختبار الواجهة' }).click();
  await page.getByRole('spinbutton').fill('2200');
  await page.getByRole('button', { name: 'حفظ التغييرات', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator('tbody')).toContainText('2,200');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'تصدير القائمة' }).click();
  expect((await download).suggestedFilename()).toContain('.csv');
  await page.getByRole('button', { name: 'تصفية', exact: true }).click();
  await page.getByLabel('تصفية حسب الحالة').selectOption('قيد الانتظار');
  await expect(page.getByText('لا توجد نتائج', { exact: true })).toBeVisible();
});

test('mobile navigation and accessible demo tour work without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'إضافة فاتورة بيع', exact: true })).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.getByRole('button', { name: 'فتح القائمة' }).click();
  await page.getByRole('button', { name: 'استكشف النظام' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await page.getByRole('button', { name: 'فتح القائمة' }).click();
  await page.locator('.sidebar').getByRole('link', { name: 'العملاء', exact: true }).click();
  await expect(page).toHaveURL(/\/customers$/);
});
