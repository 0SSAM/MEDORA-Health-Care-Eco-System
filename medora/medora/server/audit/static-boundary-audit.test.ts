import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

describe("static boundary audit", () => {
  it("emits a bounded summary and preserves the non-certification disclaimer", async () => {
    const { stdout } = await execFileAsync("node", ["server/audit/static-boundary-audit.mjs"], {
      cwd: process.cwd(),
      maxBuffer: 2 * 1024 * 1024,
    });
    const report = JSON.parse(stdout) as {
      methodology: string;
      summary: { filesScanned: number; filesWithOrganizationScope: number; filesWithJurisdictionScope: number };
      totals: { "raw-error-string": number };
    };

    expect(report.summary.filesScanned).toBeGreaterThan(0);
    expect(report.summary.filesWithOrganizationScope).toBeGreaterThan(0);
    expect(report.summary.filesWithJurisdictionScope).toBeGreaterThan(0);
    expect(report.methodology).toContain("do not replace code review");
    expect(report.totals["raw-error-string"]).toBe(0);
  });
});
