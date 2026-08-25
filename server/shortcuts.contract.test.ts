import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("MEDORA shortcuts contract", () => {
  const home = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

  it("keeps core operational shortcuts discoverable", () => {
    for (const key of ["F2", "F4", "F6", "F7", "F8", "F9"]) expect(home).toContain(`key: "${key}"`);
    expect(home).toContain("الاختصارات الأساسية");
    expect(home).toContain("availableShortcuts");
  });

  it("does not grant shortcut access by role alone without module scope", () => {
    expect(home).toContain("allowedModules.some(item => item.id === module)");
    expect(home).toContain("roles.includes(role)");
  });

  it("documents application-level Select All protection boundaries", () => {
    expect(home).toContain("event.preventDefault()" );
    expect(home).toContain("target?.isContentEditable");
  });
});
