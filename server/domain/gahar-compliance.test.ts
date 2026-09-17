import { describe, expect, it } from "vitest";
import { evaluateGaharReadiness, GAHAR_STANDARDS } from "./gahar-compliance";

describe("gahar-compliance", () => {
  it("has at least 5 standards", () => {
    expect(GAHAR_STANDARDS.length).toBeGreaterThanOrEqual(5);
  });
  it("reports remaining gaps honestly", () => {
    const r = evaluateGaharReadiness();
    expect(r.total).toBe(GAHAR_STANDARDS.length);
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
    // PH-01 has one unimplemented control (double_signoff)
    expect(r.gaps.some((g) => g.code === "GAHAR-PH-01")).toBe(true);
  });
});
