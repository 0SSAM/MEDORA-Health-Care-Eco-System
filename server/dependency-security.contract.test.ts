import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const packageJson = JSON.parse(readFileSync(resolve(projectRoot, "package.json"), "utf8")) as { devDependencies?: Record<string, string> };
const workspace = readFileSync(resolve(projectRoot, "pnpm-workspace.yaml"), "utf8");
const lockfile = readFileSync(resolve(projectRoot, "pnpm-lock.yaml"), "utf8");

describe("esbuild dependency-security contract", () => {
  it("pins the direct toolchain to a patched esbuild release without a duplicate workspace override", () => {
    expect(packageJson.devDependencies?.esbuild).toBe("^0.28.2");
    expect(workspace).not.toContain("esbuild:");
  });

  it("resolves the patched esbuild line in the committed lockfile", () => {
    expect(lockfile).toContain("esbuild@0.28.2");
    expect(lockfile).not.toContain("esbuild@0.24.2");
  });
});
