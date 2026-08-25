import { describe, expect, it } from "vitest";
import { assertReportSchedulingEnabled, getReportSchedulingReadiness } from "./report-scheduling-policy";

describe("report scheduling release gate", () => {
  it("keeps scheduling disabled unless the explicit production flag is true", () => {
    expect(getReportSchedulingReadiness(undefined)).toMatchObject({ enabled: false });
    expect(getReportSchedulingReadiness("false")).toMatchObject({ enabled: false });
    expect(() => assertReportSchedulingEnabled(undefined)).toThrow(/disabled/i);
  });

  it("allows scheduling only after an explicit release approval flag", () => {
    expect(getReportSchedulingReadiness("true")).toEqual({ enabled: true, reason: null });
    expect(() => assertReportSchedulingEnabled("true")).not.toThrow();
  });
});
