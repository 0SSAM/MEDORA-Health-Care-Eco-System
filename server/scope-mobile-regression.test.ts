import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("scope and mobile layout regression contracts", () => {
  it("requires an active, positive legal jurisdiction and retains no session-mode switching", async () => {
    const localization = await readFile(new URL("../client/src/contexts/LocalizationContext.tsx", import.meta.url), "utf8");
    const router = await readFile(new URL("./routers.ts", import.meta.url), "utf8");
    expect(localization).toContain("value > 0");
    expect(localization).toContain("profile?.active === 1");
    expect(localization).not.toMatch(/showcase|sessionMode|sessionModes|switchSessionMode/iu);
    expect(router).not.toMatch(/showcase|sessionMode|sessionModes|switchSessionMode/iu);
  });

  it("exposes a persistent approved-scope indicator without an alternate data environment", async () => {
    const home = await readFile(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
    expect(home).toContain('t("home.currentScope")');
    expect(home).toContain('t("home.productionData")');
    expect(home).not.toMatch(/showcase|sessionMode|switchSessionMode|DemoExperienceWorkspace/iu);
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
