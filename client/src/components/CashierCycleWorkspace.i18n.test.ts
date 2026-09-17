import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/components/CashierCycleWorkspace.tsx"), "utf8");

describe("CashierCycleWorkspace bilingual UI contract", () => {
  it("uses the active language and direction for cashier actions", () => {
    expect(source).toContain('const { direction, locale, language } = useLocalization()');
    expect(source).toContain('const t = (arabic: string, english: string) => language === "ar" ? arabic : english');
    expect(source).toContain('dir={direction}');
    expect(source).toContain('"Cashier shift & drawer"');
    expect(source).toContain('"Open cash drawer"');
    expect(source).toContain('"Invoices from the last 7 days"');
    expect(source).toContain('"POS return request"');
  });

  it("retains the review-gated return path", () => {
    expect(source).toContain('disposition: "pending_review"');
    expect(source).toContain('"Create return request for review"');
    expect(source).toContain('"The request goes to review. Neither stock nor payment is reversed until an authorized approver accepts it."');
  });
});
