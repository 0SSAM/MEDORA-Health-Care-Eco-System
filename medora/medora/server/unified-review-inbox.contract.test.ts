import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("unified review inbox contract", () => {
  it("remains a read-only, management-gated, branch-scoped directory of original workflows", () => {
    const source = readFileSync(resolve(process.cwd(), "server/routers/operations.ts"), "utf8");
    const workspace = readFileSync(resolve(process.cwd(), "client/src/components/OperationsManagementWorkspace.tsx"), "utf8");
    const inboxBlock = source.slice(source.indexOf("reviewInbox:"), source.indexOf("people:"));

    expect(inboxBlock).toContain("protectedProcedure.input");
    expect(inboxBlock).toContain("assertManagementAccess");
    expect(inboxBlock).toContain("assertBranchAccess");
    expect(inboxBlock).toContain("procurementRequests");
    expect(inboxBlock).toContain("employeeLeaveRequests");
    expect(inboxBlock).toContain("cashClosures");
    expect(inboxBlock).toContain("otherExpenses");
    expect(inboxBlock).toContain("interBranchTransfers");
    expect(inboxBlock).toContain("buildUnifiedReviewInbox");
    expect(inboxBlock).not.toContain(".mutation(");
    expect(inboxBlock).not.toContain("db.update(");
    expect(workspace).toContain("trpc.operations.reviewInbox.list.useQuery");
    expect(workspace).toContain("صندوق المراجعة الموحد");
    expect(workspace).toContain("مراجعة من المسار الأصلي");
    expect(workspace).not.toContain("reviewInbox.approve");
  });
});
