import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { inventoryAutomationSkipReason } from "./scheduled/inventory";

const serverRoot = new URL("./", import.meta.url);
const readProjectFile = (relativePath: string) => readFileSync(new URL(relativePath, serverRoot), "utf8");
const operationsSource = readProjectFile("routers/operations.ts");
const inventorySource = readProjectFile("scheduled/inventory.ts");
const schemaSource = readFileSync(new URL("../drizzle/schema.ts", serverRoot), "utf8");

describe("scoped inventory automation reorganization", () => {
  it("fails closed for missing, paused, unsupported, or unscoped scheduler records while accepting jurisdiction zero", () => {
    expect(inventoryAutomationSkipReason(undefined)).toBe("orphan");
    expect(inventoryAutomationSkipReason({ active: 0, workflowKey: "inventory_alert_scan", organizationId: 1, branchId: 2, jurisdictionId: 0 })).toBe("inactive");
    expect(inventoryAutomationSkipReason({ active: 1, workflowKey: "unapproved_workflow", organizationId: 1, branchId: 2, jurisdictionId: 0 })).toBe("unsupported-workflow");
    expect(inventoryAutomationSkipReason({ active: 1, workflowKey: "inventory_alert_scan", organizationId: 1, branchId: 2, jurisdictionId: null })).toBe("unscoped");
    expect(inventoryAutomationSkipReason({ active: 1, workflowKey: "inventory_alert_scan", organizationId: 1, branchId: 2, jurisdictionId: 0 })).toBeNull();
  });

  it("persists the tenant scope, workflow identity, safe run counters, and a one-per-scope uniqueness boundary", () => {
    expect(schemaSource).toMatch(/workflowKey:\s*varchar\("workflowKey",\s*\{\s*length:\s*80\s*\}\)\.notNull\(\)\.default\("legacy"\)/);
    expect(schemaSource).toMatch(/organizationId:\s*int\("organizationId"\)/);
    expect(schemaSource).toMatch(/branchId:\s*int\("branchId"\)/);
    expect(schemaSource).toMatch(/jurisdictionId:\s*int\("jurisdictionId"\)/);
    expect(schemaSource).toMatch(/lastRunEvaluatedCount:\s*int\("lastRunEvaluatedCount"\)/);
    expect(schemaSource).toMatch(/lastRunQueuedCount:\s*int\("lastRunQueuedCount"\)/);
    expect(schemaSource).toContain('uniqueIndex("scheduled_jobs_scope_workflow_idx")');
  });

  it("requires the established scoped manager guard for reads and schedule configuration", () => {
    const automationBlock = operationsSource.slice(operationsSource.indexOf("inventoryAutomation:"), operationsSource.indexOf("reviewInbox:"));
    expect(automationBlock.match(/assertScopedManagementAccess/g)?.length).toBe(2);
    expect(automationBlock).toContain("eq(scheduledJobs.organizationId, input.organizationId)");
    expect(automationBlock).toContain("eq(scheduledJobs.branchId, input.branchId)");
    expect(automationBlock).toContain("eq(scheduledJobs.jurisdictionId, input.jurisdictionId)");
    expect(automationBlock).toContain("eq(scheduledJobs.workflowKey, inventoryWorkflowKey)");
  });

  it("uses an idempotent create-or-update control path, writes an audit record, and never executes a source operation", () => {
    const automationBlock = operationsSource.slice(operationsSource.indexOf("configureInventoryAutomation:"), operationsSource.indexOf("reviewInbox:"));
    expect(automationBlock).toContain("if (existing)");
    expect(automationBlock).toContain("updateHeartbeatJob");
    expect(automationBlock).toContain("createHeartbeatJob");
    expect(automationBlock).toContain('action: input.active ? "inventory_automation_enabled" : "inventory_automation_paused"');
    expect(automationBlock).toContain("executed: false as const");
    expect(automationBlock).not.toMatch(/inventoryAlertHandler\(|purchaseOrders|salesReturns|interBranchTransfers/);
  });

  it("resolves scope from the persisted job before inventory access and records count-only safe run state", () => {
    expect(inventorySource).toContain("const skipReason = inventoryAutomationSkipReason(job)");
    expect(inventorySource).toContain("eq(inventoryBatches.organizationId, job.organizationId!)");
    expect(inventorySource).toContain("eq(inventoryBatches.branchId, job.branchId!)");
    expect(inventorySource).toContain("eq(inventoryBatches.jurisdictionId, job.jurisdictionId!)");
    expect(inventorySource).toContain('lastRunStatus: "succeeded"');
    expect(inventorySource).toContain("lastRunEvaluatedCount: batches.length");
    expect(inventorySource).toContain("lastRunQueuedCount: queued");
    expect(inventorySource).not.toMatch(/patient|prescription|createPurchase|transferStock/);
  });
});
