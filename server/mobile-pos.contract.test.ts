import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("mobile POS and simulated barcode scanner", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/components/PointOfSaleWorkspace.tsx"), "utf8");

  it("provides an explicitly test-only simulated scanner", () => {
    expect(source).toContain("showSimulatedScanner");
    expect(source).toContain("simulateBarcodeScan");
    expect(source).toContain('t("pos.simulatedScanner")');
    expect(source).toContain('t("pos.simulatedScannerDetail")');
  });

  it("feeds simulated scans through the existing product and basket flow", () => {
    expect(source).toContain("setQuery(payload.raw)");
    expect(source).toContain("addItem(item)");
    expect(source).toContain("barcodeRef.current?.focus()");
    expect(source).toContain("stock.data?.slice(0, 4)");
  });

  it("keeps physical barcode input and server-scoped stock lookup intact", () => {
    expect(source).toContain("onKeyDown={event =>");
    expect(source).toContain('event.key === "Enter"');
    expect(source).toContain("hasValidPosScope({ branchId, jurisdictionId })");
    expect(source).toContain("hasPosScope ? { branchId: branchId!, jurisdictionId: jurisdictionId!, query } : skipToken");
    expect(source).toContain("POS_STOCK_QUERY_OPTIONS");
    expect(source).toContain("availableStock.useQuery");
  });

  it("adds mobile-first layout and touch-friendly controls", () => {
    expect(source).toContain("grid-cols-2");
    expect(source).toContain("min-h-11");
    expect(source).toContain("order-first");
    expect(source).toContain("sm:flex-row");
    expect(source).toContain('dir={direction}');
  });
});
