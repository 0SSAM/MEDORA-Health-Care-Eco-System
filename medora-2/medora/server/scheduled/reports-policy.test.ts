import { describe, expect, it } from "vitest";
import { boundedReportErrorCode, buildReportDeliveryAudit, reportExecutionSkipReason, safeReportTransportError } from "./reports";

describe("report execution lifecycle policy", () => {
  const base = { id: 7, status: "active", jurisdictionId: 3, queryKey: "sales.daily.v1" };

  it("allows only active scoped allowlisted definitions", () => {
    expect(reportExecutionSkipReason(base)).toBeUndefined();
  });

  it("skips inactive and legacy unscoped definitions", () => {
    expect(reportExecutionSkipReason({ ...base, status: "draft" })).toBe("inactive");
    expect(reportExecutionSkipReason({ ...base, jurisdictionId: null })).toBe("missing_scope");
  });

  it("skips unsupported query keys", () => {
    expect(reportExecutionSkipReason({ ...base, queryKey: "select * from sales" })).toBe("unsupported_query");
  });

  it("bounds execution failures without exposing raw database errors", () => {
    expect(boundedReportErrorCode(new Error("password=secret; ER_ACCESS_DENIED"))).toBe("REPORT_QUERY_FAILED");
  });

  it("returns a fixed transport error without URL, task, or raw error details", () => {
    const response = safeReportTransportError(new Error("password=secret /taskUid=private"));
    expect(response).toEqual({ error: "report-execution-failed" });
    expect(JSON.stringify(response)).not.toContain("password");
    expect(JSON.stringify(response)).not.toContain("taskUid");
  });

  it("creates a scoped in-app delivery audit record", () => {
    expect(buildReportDeliveryAudit({ reportRunId: 11, definitionId: 7, organizationId: 3, jurisdictionId: 2, channel: "in_app", status: "delivered", notificationId: 90 })).toEqual({ reportRunId: 11, definitionId: 7, organizationId: 3, jurisdictionId: 2, channel: "in_app", status: "delivered", notificationId: 90, errorCode: null });
  });

  it("allows approved email channel audits while rejecting unsupported channels and unscoped records", () => {
    expect(buildReportDeliveryAudit({ reportRunId: 11, definitionId: 7, organizationId: 3, jurisdictionId: 0, channel: "email", status: "queued" })).toMatchObject({ channel: "email", jurisdictionId: 0, status: "queued" });
    expect(() => buildReportDeliveryAudit({ reportRunId: 11, definitionId: 7, organizationId: 3, jurisdictionId: 2, channel: "webhook", status: "queued" })).toThrow(/Unsupported/);
    expect(() => buildReportDeliveryAudit({ reportRunId: 11, definitionId: 7, organizationId: 3, jurisdictionId: null, channel: "in_app", status: "queued" })).toThrow(/jurisdiction/);
  });
});
