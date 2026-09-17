import { expect, test } from "@playwright/test";

test.describe("MEDORA public Arabic and English experience", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("starts in Arabic RTL and switches to English LTR", async ({ page }) => {
    const html = page.locator("html");
    const main = page.locator("main");

    await expect(html).toHaveAttribute("lang", "ar");
    await expect(html).toHaveAttribute("dir", "rtl");
    await expect(main).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("link", { name: "MEDORA | منظومة الرعاية الصحية المتكاملة" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "مساحة تشغيل آمنة وموحّدة لدورة الرعاية الصحية." })).toBeVisible();

    await page.getByRole("button", { name: "تغيير اللغة إلى English" }).click();

    await expect(html).toHaveAttribute("lang", "en");
    await expect(html).toHaveAttribute("dir", "ltr");
    await expect(main).toHaveAttribute("dir", "ltr");
    await expect(page.getByRole("heading", { name: "One secure operating space for the healthcare journey." })).toBeVisible();
    await expect(page.getByRole("link", { name: "MEDORA | Health Care Eco System" })).toBeVisible();
    await expect(page.getByRole("button", { name: "تغيير اللغة إلى العربية" })).toBeVisible();
  });

  test("persists the selected language after a reload", async ({ page }) => {
    const html = page.locator("html");

    await page.getByRole("button", { name: "تغيير اللغة إلى English" }).click();
    await expect(html).toHaveAttribute("lang", "en");
    await page.reload();

    await expect(html).toHaveAttribute("lang", "en");
    await expect(html).toHaveAttribute("dir", "ltr");
    await expect(page.getByRole("heading", { name: "One secure operating space for the healthcare journey." })).toBeVisible();
  });

  test("keeps RTL geometry stable for the Arabic landing surface", async ({ page }) => {
    const main = page.locator("main");
    const header = page.locator("header");
    const languageButton = page.getByRole("button", { name: "تغيير اللغة إلى English" });

    await expect(main).toHaveAttribute("dir", "rtl");
    await expect(languageButton).toBeVisible();

    const viewport = page.viewportSize();
    const mainBox = await main.boundingBox();
    const headerBox = await header.boundingBox();
    expect(viewport).not.toBeNull();
    expect(mainBox).not.toBeNull();
    expect(headerBox).not.toBeNull();
    expect(mainBox!.width).toBeGreaterThanOrEqual(viewport!.width - 2);
    expect(headerBox!.width).toBeGreaterThan(0);
    expect(headerBox!.x).toBeGreaterThanOrEqual(mainBox!.x);
    expect(headerBox!.x + headerBox!.width).toBeLessThanOrEqual(mainBox!.x + mainBox!.width + 1);
  });

  test("keeps the public Arabic surface within the active viewport", async ({ page }) => {
    const viewport = page.viewportSize();
    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);

    expect(viewport).not.toBeNull();
    expect(documentWidth).toBeLessThanOrEqual(viewport!.width + 1);
  });

  test("renders every registered route with a non-empty safe access state", async ({ page }) => {
    const routes = ["/", "/login", "/workspace", "/sales", "/pos", "/operations", "/finance", "/admin", "/404"];
    const pageErrors: string[] = [];
    page.on("pageerror", error => pageErrors.push(error.message));

    for (const route of routes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const main = page.locator("main");
      await expect(main).toBeVisible();
      await expect(main).not.toHaveText(/^\s*$/);
      await expect(page.getByText("حدث خطأ غير متوقع")).not.toBeVisible();
      await expect(page.getByText("An unexpected error occurred")).not.toBeVisible();
    }

    expect(pageErrors).toEqual([]);
  });
});
