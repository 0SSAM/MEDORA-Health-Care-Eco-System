import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectFile = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const appSource = projectFile("client/src/App.tsx");

import { existsSync } from "node:fs";
describe("demo and showcase surfaces are removed from the shipped build", () => {
  it("no demo route, no demo workspace file, welcome route is the only public surface", () => {
    const appSource = projectFile("client/src/App.tsx");
    expect(appSource).not.toContain("/demo");
    expect(appSource).not.toContain("DemoWorkspace");
    expect(existsSync(resolve(process.cwd(), "client/src/pages/DemoWorkspace.tsx"))).toBe(false);
    expect(appSource).toContain("isPublicSurface");
  });
});
