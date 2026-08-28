import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("MEDORA POS progressive tools", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/components/PointOfSaleWorkspace.tsx"), "utf8");

  it("groups non-primary sale utilities under one localized disclosure control", () => {
    expect(source).toContain('t("pos.saleTools")');
    expect(source).toContain('<details className="group relative w-full sm:w-auto">');
    expect(source).toContain('<MoreHorizontal className="h-4 w-4" />');
  });

  it("retains direct access to camera, simulated, and held-invoice utilities", () => {
    expect(source).toContain('setShowCameraScanner(value => !value)');
    expect(source).toContain('setShowSimulatedScanner(value => !value)');
    expect(source).toContain('setShowHeld(value => !value)');
    expect(source).toContain('t("pos.heldInvoices")} ({heldInvoices.length})');
  });
});
