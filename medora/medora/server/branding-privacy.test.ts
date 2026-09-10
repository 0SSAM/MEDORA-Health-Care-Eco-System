import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("MEDORA visible branding privacy", () => {
  it("does not expose provider branding in the login dialog UI copy", async () => {
    const source = await readFile(new URL("../client/src/components/SecureLoginDialog.tsx", import.meta.url), "utf8");
    expect(source).not.toMatch(/Manus|Please login with|Login with/);
    expect(source).toContain("تسجيل الدخول الآمن للمتابعة");
    expect(source).toContain("تسجيل الدخول");
  });

  it("keeps the shipped application title explicitly owned by MEDORA", async () => {
    const source = await readFile(new URL("../client/index.html", import.meta.url), "utf8");
    expect(source).toContain("<title>MEDORA — Health Care Eco System</title>");
    expect(source).not.toContain("%VITE_APP_TITLE%");
    expect(source).not.toMatch(/<title>[^<]*manus[^<]*<\/title>/i);
  });

  it("does not print provider branding from the shipped debug asset", async () => {
    const source = await readFile(new URL("../client/public/__manus__/debug-collector.js", import.meta.url), "utf8");
    expect(source).not.toMatch(/Manus Debug Collector|\[Manus\]/);
    expect(source).toContain("MEDORA Debug Collector");
    expect(source).toContain("[MEDORA]");
  });

  it("keeps the application-owned service worker on the current MEDORA cache policy", async () => {
    const source = await readFile(new URL("../client/public/sw.js", import.meta.url), "utf8");
    expect(source).not.toMatch(/X-BDF|BDF_SYNC_STATUS/i);
    expect(source).toContain("medora-health-care-shell-v5");
    expect(source).toContain('LEGACY_CACHE_NAMES = ["medora-health-care-shell-v4", "aldo-health-care-shell-v3", "bdf-pharma-shell-v2"]');
    expect(source).toContain("caches.delete(name)");
    expect(source).toContain("X-ALDO-Regulated-Operation");
    expect(source).toContain("ALDO_SYNC_STATUS");
    expect(source).toContain('const API_PREFIX = "/api/"');
    expect(source).toContain("requestUrl.pathname.startsWith(API_PREFIX)");
  });
});
