import { createHash } from "node:crypto";
import { lstatSync, readFileSync } from "node:fs";
import { resolve, sep } from "node:path";
import { describe, expect, it } from "vitest";

type IntegrityEntry = { path: string; sha256: string };
type IntegrityManifest = {
  schemaVersion: number;
  product: string;
  purpose: string;
  algorithm: string;
  files: IntegrityEntry[];
};

const root = process.cwd();
const manifestPath = resolve(root, "docs/security/source-integrity-manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as IntegrityManifest;

function readIntegrityFile(relativePath: string): Buffer {
  expect(relativePath).not.toContain("..");
  const absolutePath = resolve(root, relativePath);
  expect(absolutePath.startsWith(`${root}${sep}`)).toBe(true);
  expect(lstatSync(absolutePath).isSymbolicLink()).toBe(false);
  return readFileSync(absolutePath);
}

describe("MEDORA source-integrity manifest contract", () => {
  it("records a proprietary, bounded SHA-256 release surface without claiming legal registration", () => {
    expect(manifest.schemaVersion).toBe(1);
    expect(manifest.product).toBe("MEDORA Health Care Eco System");
    expect(manifest.algorithm).toBe("SHA-256");
    expect(manifest.purpose).toContain("not a copyright");
    expect(manifest.files.length).toBeGreaterThanOrEqual(10);
  });

  it("matches every recorded source digest", () => {
    for (const entry of manifest.files) {
      expect(entry.sha256).toMatch(/^[a-f0-9]{64}$/);
      const actual = createHash("sha256").update(readIntegrityFile(entry.path)).digest("hex");
      expect(actual, entry.path).toBe(entry.sha256);
    }
  });

  it("keeps verification instructions and proprietary notices present", () => {
    const evidence = readFileSync(resolve(root, "docs/security/source-integrity-release-evidence.md"), "utf8");
    const license = readFileSync(resolve(root, "LICENSE"), "utf8");
    const notice = readFileSync(resolve(root, "NOTICE"), "utf8");
    expect(evidence).toContain("pnpm vitest run server/source-integrity.contract.test.ts");
    expect(evidence).toContain("not an independent legal escrow service");
    expect(license).toContain("All rights reserved");
    expect(notice).toContain("Intellectual Property Notice");
  });
});
