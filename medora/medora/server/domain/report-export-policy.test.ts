import { describe, expect, it } from "vitest";
import { compareReportValues, escapeSpreadsheetCell, isDateInRange } from "./report-export-policy";

describe("report export policy", () => {
  it("escapes spreadsheet formula and markup characters", () => {
    expect(escapeSpreadsheetCell(`<x>&\"`)).toBe("&lt;x&gt;&amp;&quot;");
  });

  it("enforces inclusive date boundaries", () => {
    const value = new Date("2026-08-16T12:00:00");
    expect(isDateInRange(value, "2026-08-16", "2026-08-16")).toBe(true);
    expect(isDateInRange(value, "2026-08-17", undefined)).toBe(false);
  });

  it("uses an allowlisted direction for deterministic sorting", () => {
    expect(compareReportValues(2, 1, "asc")).toBeGreaterThan(0);
    expect(compareReportValues("draft", "approved", "desc")).toBeLessThan(0);
  });
});
