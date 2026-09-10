import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "server/routers/ai-insights.ts"), "utf8");

describe("governed AI insight scope contract", () => {
  it("accepts jurisdiction zero while retaining explicit scope filters", () => {
    expect(source).toContain("jurisdictionId: z.number().int().min(0).optional()");
    expect(source.match(/input\.jurisdictionId !== undefined/g)?.length).toBeGreaterThanOrEqual(3);
    expect(source).toContain("Jurisdiction is not assigned to the selected branch");
  });

  it("keeps every generated result advisory and subject to human review", () => {
    expect(source).toContain("requiresHumanReview: true as const");
    expect(source).toContain("advisoryOnly: true as const");
    expect(source).toContain("لا تنفذ شراءً أو تغييرًا");
  });
});
