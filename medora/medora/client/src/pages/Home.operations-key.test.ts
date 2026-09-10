import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Home command-center actions", () => {
  it("uses the stable shortcut identity instead of a translated title", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

    expect(source).toContain("overviewQuickActions.slice(0, 3)");
    expect(source).toContain("key={shortcut.key}");
    expect(source).not.toContain("key={title as string}");
  });
});
