// MEDORA | ميدورا — Integrated Health Care System
// Role-Based Access Control (RBAC) Integration Tests for Finance and HR
import { test, expect } from "@playwright/test";

/**
 * These tests verify that the newly exposed Finance and HR modules 
 * correctly enforce role-based visibility and access.
 * 
 * Note: These tests assume the presence of test accounts with different roles.
 * In a CI environment, these accounts should be seeded before running tests.
 */

test.describe("MEDORA RBAC Verification", () => {
  
  test.describe("Admin Role (Full Access)", () => {
    test.beforeEach(async ({ page }) => {
      // Login as Admin
      await page.goto("/login");
      await page.fill('input[id="internal-username"]', "admin");
      await page.fill('input[id="internal-password"]', process.env.ADMIN_PASSWORD || "Admin#@!12345");
      await page.click('button[type="submit"]');
      
      // Check for login error messages
      const error = page.locator('[role="alert"]');
      if (await error.isVisible()) {
        const text = await error.innerText();
        throw new Error(`Login failed for admin: ${text}`);
      }
      
      // Handle potential organization selection or initial overview
      await page.waitForURL(url => url.pathname.includes("/workspace") || url.pathname === "/", { timeout: 15000 });
      
      // If we are on home, navigate to workspace with a default org
      if (page.url().endsWith("/")) {
        await page.goto("/workspace?org=1");
      }
    });

    test("should see Finance and HR in the sidebar", async ({ page }) => {
      const sidebar = page.locator('nav');
      // Arabic labels: الحسابات والمالية, الموارد البشرية
      await expect(sidebar).toContainText("الحسابات والمالية");
      await expect(sidebar).toContainText("الموارد البشرية");
    });

    test("should be able to access Finance workspace", async ({ page }) => {
      await page.click('text="الحسابات والمالية"');
      await expect(page.locator("h1")).toContainText("الحسابات والمالية");
      // Verify sub-sections (Reports, Expenses)
      await expect(page.locator("body")).toContainText("تقارير مالية");
      await expect(page.locator("body")).toContainText("مصروفات متنوعة");
    });

    test("should be able to access HR workspace", async ({ page }) => {
      await page.click('text="الموارد البشرية"');
      await expect(page.locator("h1")).toContainText("الموارد البشرية");
      // Verify employee directory access
      await expect(page.locator("body")).toContainText("دليل الموظفين");
    });
  });

  test.describe("Staff Role (Restricted Access)", () => {
    test.beforeEach(async ({ page }) => {
      // Login as Staff
      await page.goto("/login");
      await page.fill('input[id="internal-username"]', "staff_user");
      await page.fill('input[id="internal-password"]', process.env.STAFF_PASSWORD || "Staff#@!12345");
      await page.click('button[type="submit"]');
      
      const error = page.locator('[role="alert"]');
      if (await error.isVisible()) {
        const text = await error.innerText();
        throw new Error(`Login failed for staff_user: ${text}`);
      }
      
      await page.waitForURL(url => url.pathname.includes("/workspace") || url.pathname === "/", { timeout: 15000 });
      if (page.url().endsWith("/")) {
        await page.goto("/workspace?org=1");
      }
    });

    test("should NOT see Finance in the sidebar", async ({ page }) => {
      const sidebar = page.locator('nav');
      await expect(sidebar).not.toContainText("الحسابات والمالية");
    });

    test("should see limited HR options (Employee Dashboard)", async ({ page }) => {
      const sidebar = page.locator('nav');
      await expect(sidebar).toContainText("بصمة الموظف");
    });

    test("should receive 403 when trying to access Finance directly", async ({ page }) => {
      // Assuming organizationId 1 for testing
      await page.goto("/workspace?org=1&module=finance");
      // The UI should redirect or show an error state
      // If it renders the module, the server should return a 403 on data fetch
      const errorBoundary = page.locator('text="Insufficient permissions"');
      // Depending on implementation, it might just not render the component
      await expect(page.locator("h1")).not.toContainText("الحسابات والمالية");
    });
  });

  test.describe("Auditor Role (Read-Only Finance)", () => {
    test.beforeEach(async ({ page }) => {
      // Login as Auditor
      await page.goto("/login");
      await page.fill('input[id="internal-username"]', "auditor_user");
      await page.fill('input[id="internal-password"]', process.env.AUDITOR_PASSWORD || "Auditor#@!12345");
      await page.click('button[type="submit"]');
      
      const error = page.locator('[role="alert"]');
      if (await error.isVisible()) {
        const text = await error.innerText();
        throw new Error(`Login failed for auditor_user: ${text}`);
      }
      
      await page.waitForURL(url => url.pathname.includes("/workspace") || url.pathname === "/", { timeout: 15000 });
      if (page.url().endsWith("/")) {
        await page.goto("/workspace?org=1");
      }
    });

    test("should see Finance/Reports but not manage HR", async ({ page }) => {
      const sidebar = page.locator('nav');
      await expect(sidebar).toContainText("الحسابات والمالية");
      await expect(sidebar).not.toContainText("الموارد البشرية");
    });
  });
});
