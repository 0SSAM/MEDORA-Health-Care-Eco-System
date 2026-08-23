import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("sensitive screen-capture protection contract", () => {
  const homeSource = read("client/src/pages/Home.tsx");
  const componentSource = read("client/src/components/ScreenCaptureProtection.tsx");
  const securitySource = read("server/_core/security.ts");

  it("wraps authenticated workspaces while keeping public entry pages outside the sensitive boundary", () => {
    expect(homeSource).toContain("<ScreenCaptureProtection");
    expect(homeSource).toContain("enabled={Boolean(user)}");
  });

  it("redacts protected content on browser lifecycle risk and blocks common browser exfiltration actions", () => {
    for (const listener of ["visibilitychange", "blur", "pagehide", "beforeprint", "copy", "cut", "contextmenu", "dragstart"]) {
      expect(componentSource).toContain(listener);
    }
    expect(componentSource).toContain("shouldBlockProtectedShortcut");
    expect(componentSource).toContain("medora:capture-risk");
    expect(componentSource).toContain("Array.from({ length: 15 }");
  });

  it("disables the browser display-capture capability in the baseline response policy", () => {
    expect(securitySource).toContain("display-capture=()");
  });
});
