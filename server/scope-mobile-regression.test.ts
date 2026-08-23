import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("showcase scope and mobile layout regression contracts", () => {
  it("keeps showcase jurisdiction explicitly non-regulatory and production fail-closed", async () => {
    const localization = await readFile(new URL("../client/src/contexts/LocalizationContext.tsx", import.meta.url), "utf8");
    const db = await readFile(new URL("./db.ts", import.meta.url), "utf8");
    expect(db).toContain("taxProfile: SHOWCASE_TAX_PROFILE");
    expect(localization).toContain('profile?.taxProfile === "SHOWCASE_NOT_REGULATORY"');
    expect(localization).toContain("profile.active === 1 || isShowcaseProfile(profile)");
  });

  it("exposes a persistent scope indicator and server-guarded mode switching", async () => {
    const home = await readFile(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
    const localization = await readFile(new URL("../client/src/contexts/LocalizationContext.tsx", import.meta.url), "utf8");
    const router = await readFile(new URL("./routers.ts", import.meta.url), "utf8");
    expect(home).toContain('t("home.currentScope")');
    expect(home).toContain('t("home.switchToProduction")');
    expect(localization).toContain("sessionModesQuery");
    expect(router).toContain("switchSessionMode");
    expect(router).toContain('targetMode: z.enum(["production", "showcase"])');
  });

  it("keeps the mobile drawer above the backdrop and locks background scrolling", async () => {
    const home = await readFile(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
    expect(home).toContain('document.body.style.overflow = "hidden"');
    expect(home).toContain('aria-label={t("home.mainMenu")}');
    expect(home).toContain("z-50");
    expect(home).toContain("overscroll-contain");
    expect(home).toContain("min-w-0");
    expect(home).toContain("drawerTouchStartX");
    expect(home).toContain("setDrawerDragOffset");
    expect(home).toContain("branchSwitching");
  });

  it("keeps navigation grouped, searchable, and context-aware on narrow screens", async () => {
    const home = await readFile(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
    expect(home).toContain('aria-label={t("home.systemModules")}');
    expect(home).toContain("moduleGroups.map");
    expect(home).toContain('placeholder={t("home.searchPlaceholder")}');
    expect(home).toContain("moduleGroupLabel(activeModule.id)");
    expect(home).toContain("nextStepByModule[activeModule.id]");
  });
});
