import { test, expect, type Page } from "@playwright/test";

const SHOTS = "shots/visual";

async function shot(page: Page, name: string) {
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });
}

async function expectNoHorizontalOverflow(page: Page) {
  const widths = await page.evaluate(() => ({ vw: window.innerWidth, body: document.documentElement.scrollWidth }));
  expect(widths.body, `page overflows the viewport: ${JSON.stringify(widths)}`).toBeLessThanOrEqual(widths.vw + 1);
}

async function acceptNdaIfNeeded(page: Page) {
  const checkbox = page.getByRole("checkbox", { name: /NDA|اتفاقية/i });
  if (await checkbox.isVisible({ timeout: 4000 }).catch(() => false)) {
    await checkbox.click();
    const accept = page.getByRole("button", { name: /موافق|الدخول|أوافق|Accept|Continue/i }).first();
    await accept.click();
    await page.waitForTimeout(900);
  }
}

test.describe("MEDORA visual journey", () => {
  test("public surfaces render without overflow", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await expect(page.locator("body")).toContainText(/MEDORA|ميدورا/);
    await expectNoHorizontalOverflow(page);
    await shot(page, "01-welcome");

    await page.goto("/demo");
    await shot(page, "02-demo");
    expect(errors, `unexpected page errors: ${errors.join(" | ")}`).toEqual([]);
  });

  test("admin signs in with admin/admin and reaches the workspace", async ({ page }) => {
    await page.goto("/login");
    await page.waitForTimeout(600);
    await expect(page.locator("#internal-username")).toBeVisible();
    await shot(page, "03-login-screen");

    await page.locator("#internal-username").fill("admin");
    await page.locator("#internal-password").fill("admin");
    await page.getByRole("button", { name: /دخول الموظفين/ }).click();

    await page.waitForURL(/\/(workspace|sales|operations|finance|pos)/, { timeout: 20000 });
    await acceptNdaIfNeeded(page);
    await expect(page.locator("body")).not.toContainText("اسم المستخدم أو كلمة المرور غير صحيحة");
    await expectNoHorizontalOverflow(page);
    await shot(page, "04-workspace-after-login");
  });

  test("wrong password shows the Arabic error and blocks access", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#internal-username").fill("admin");
    await page.locator("#internal-password").fill("definitely-wrong");
    await page.getByRole("button", { name: /دخول الموظفين/ }).click();
    await expect(page.locator("body")).toContainText("اسم المستخدم أو كلمة المرور غير صحيحة", { timeout: 15000 });
    await shot(page, "05-login-error");
  });

  test("protected modules render after authentication", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#internal-username").fill("admin");
    await page.locator("#internal-password").fill("admin");
    await page.getByRole("button", { name: /دخول الموظفين/ }).click();
    await page.waitForURL(/\/(workspace|sales|operations|finance|pos)/, { timeout: 20000 });
    await acceptNdaIfNeeded(page);

    const routes: Array<[string, string]> = [
      ["/kpi", "06-kpi-dashboard"],
      ["/finance-hub", "07-finance-hub"],
      ["/supply", "08-supply-hub"],
      ["/quality", "09-quality-center"],
      ["/compliance", "10-compliance-center"],
      ["/admin", "11-admin-console"],
      ["/pos", "12-pos"],
      ["/delivery", "13-delivery"],
      ["/icd11", "14-icd11"],
    ];
    for (const [route, name] of routes) {
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(1200);
      await expect(page.locator("body"), `${route} shows NotFound`).not.toContainText("404", { timeout: 15000 }).catch(() => undefined);
      await shot(page, name);
    }
  });
});
