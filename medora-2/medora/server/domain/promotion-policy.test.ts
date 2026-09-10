import { describe, expect, it } from "vitest";
import { evaluatePromotion } from "./promotion-policy";

const base = {
  status: "active" as const,
  discountType: "percent" as const,
  discountValue: 5,
  startsAt: new Date("2026-01-01T00:00:00Z"),
  endsAt: new Date("2026-12-31T00:00:00Z"),
  usageLimit: null,
  usageCount: 0,
  now: new Date("2026-08-14T00:00:00Z"),
  subtotal: 100,
};

describe("promotion policy", () => {
  it("calculates a capped percentage discount", () => {
    expect(evaluatePromotion(base)).toMatchObject({ eligible: true, discountAmount: 5, total: 95 });
  });
  it("rejects a percentage above the statutory cap", () => {
    expect(() => evaluatePromotion({ ...base, discountValue: 7.01 })).toThrow(/statutory/);
  });
  it("rejects inactive, expired, and exhausted promotions", () => {
    expect(() => evaluatePromotion({ ...base, status: "paused" })).toThrow(/not active/);
    expect(() => evaluatePromotion({ ...base, now: new Date("2027-01-01T00:00:00Z") })).toThrow(/outside/);
    expect(() => evaluatePromotion({ ...base, usageLimit: 2, usageCount: 2 })).toThrow(/usage/);
  });
  it("caps fixed discounts at the subtotal", () => {
    expect(evaluatePromotion({ ...base, discountType: "fixed", discountValue: 200 })).toMatchObject({ discountAmount: 100, total: 0 });
  });
});
