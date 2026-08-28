import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const router = readFileSync(resolve(root, "server/routers/operations.ts"), "utf8");
const schema = readFileSync(resolve(root, "drizzle/schema.ts"), "utf8");
const home = readFileSync(resolve(root, "client/src/pages/Home.tsx"), "utf8");
const intelligence = readFileSync(resolve(root, "client/src/components/ManagerOperationalIntelligence.tsx"), "utf8");

describe("manager operational intelligence contract", () => {
  it("defines an append-only, scope-indexed decision ledger", () => {
    expect(schema).toMatch(/export const decisionLogs = mysqlTable\("decision_logs"/);
    expect(schema).toMatch(/organizationId: int\("organizationId"\)\.notNull\(\)/);
    expect(schema).toMatch(/branchId: int\("branchId"\)\.notNull\(\)/);
    expect(schema).toMatch(/jurisdictionId: int\("jurisdictionId"\)\.notNull\(\)/);
    expect(schema).toMatch(/decision: mysqlEnum\("decision", \["approved", "rejected", "deferred"\]\)\.notNull\(\)/);
    expect(schema).toMatch(/reason: varchar\("reason", \{ length: 1000 \}\)\.notNull\(\)/);
    expect(schema).toMatch(/index\("decision_logs_scope_time_idx"\)\.on\(table\.organizationId, table\.branchId, table\.jurisdictionId, table\.decidedAt\)/);
  });

  it("places every manager endpoint behind authoritative management plus branch and jurisdiction access", () => {
    for (const procedure of ["inventorySignals", "slaIndicators", "recordDecision", "decisionHistory"]) {
      const start = router.indexOf(`${procedure}: protectedProcedure`);
      const end = router.indexOf("\n    }),", start);
      expect(start, `${procedure} exists`).toBeGreaterThan(-1);
      expect(router.slice(start, end)).toContain("await assertScopedManagementAccess(db, ctx.user.id, ctx.user.role, input)");
    }
    expect(router).toContain("inArray(organizationMemberships.organizationRole, [...managementRoles])");
    expect(router).toContain("jurisdictionId: z.number().int().nonnegative()");
  });

  it("uses fully scoped, minimized inventory data and manager-owned queued alerts", () => {
    const signals = router.slice(router.indexOf("inventorySignals: protectedProcedure"), router.indexOf("slaIndicators: protectedProcedure"));
    expect(signals).toContain("eq(inventoryBatches.organizationId, input.organizationId)");
    expect(signals).toContain("eq(inventoryBatches.branchId, input.branchId)");
    expect(signals).toContain("eq(inventoryBatches.jurisdictionId, input.jurisdictionId)");
    expect(signals).toContain("quantityOnHand: inventoryBatches.quantityOnHand");
    expect(signals).toContain("reorderPoint: inventoryBatches.reorderPoint");
    expect(signals).toContain("sql`${inventoryBatches.quantityOnHand} <= ${inventoryBatches.reorderPoint}`");
    expect(signals).toContain("eq(branchAlerts.managerUserId, ctx.user.id)");
    expect(signals).toContain("eq(branchAlerts.status, \"queued\")");
    expect(signals).toContain("inArray(branchAlerts.alertType, [\"reorder\", \"expiry\"])");
  });

  it("calculates SLA server-side from scoped, non-terminal procurement and customer-service records", () => {
    const sla = router.slice(router.indexOf("slaIndicators: protectedProcedure"), router.indexOf("recordDecision: protectedProcedure"));
    expect(sla).toContain("const now = new Date()");
    expect(sla).toContain("const configuredPolicy = (await db.select().from(organizationSlaPolicies).where(eq(organizationSlaPolicies.organizationId, input.organizationId)).limit(1))[0]");
    expect(sla).toContain("const procurementTargetHours = configuredPolicy?.procurementTargetHours ?? 48");
    expect(sla).toContain("const customerServiceTargetHours = configuredPolicy?.customerCareTargetHours ?? 24");
    expect(sla).toContain("const escalationGraceHours = configuredPolicy?.escalationGraceHours ?? 24");
    expect(sla).toContain("const escalationEnabled = configuredPolicy?.escalationEnabled !== 0");
    expect(sla).toContain("notInArray(purchaseOrders.status, [\"received\", \"cancelled\"])");
    expect(sla).toContain("notInArray(customerCareCases.status, [\"resolved\", \"closed\"])");
    expect(sla).toContain("notInArray(customerCareTasks.status, [\"done\", \"cancelled\"])");
    expect(sla).toContain("eq(purchaseOrders.jurisdictionId, input.jurisdictionId)");
    expect(sla).toContain("eq(customerCareCases.jurisdictionId, input.jurisdictionId)");
    expect(sla).toContain("targetHours: procurementTargetHours");
    expect(sla).toContain("targetHours: customerServiceTargetHours");
    expect(sla).toContain("escalation: procurementEscalations");
    expect(sla).toContain("persistent: caseEscalations.persistent + taskEscalations.persistent");
  });

  it("requires a bounded human rationale, verifies the source is in scope, audits the ledger, and never executes the source record", () => {
    const decision = router.slice(router.indexOf("recordDecision: protectedProcedure"), router.indexOf("decisionHistory: protectedProcedure"));
    expect(decision).toContain("reason: z.string().trim().min(3).max(1000)");
    expect(decision).toContain("await assertDecisionEntityInScope(db, input)");
    expect(decision).toContain("await tx.insert(decisionLogs).values");
    expect(decision).toContain('action: "manager_decision_recorded"');
    expect(decision).toContain('entityType: "decision_log"');
    expect(decision).toContain("executed: false as const");
    expect(decision).not.toContain(".update(");
  });

  it("keeps decision history scope-filtered, bounded, and newest-first", () => {
    const history = router.slice(router.indexOf("decisionHistory: protectedProcedure"), router.indexOf("\n  }),\n  reviewInbox:"));
    expect(history).toContain("limit: z.number().int().min(1).max(100).default(25)");
    expect(history).toContain("eq(decisionLogs.organizationId, input.organizationId)");
    expect(history).toContain("eq(decisionLogs.branchId, input.branchId)");
    expect(history).toContain("eq(decisionLogs.jurisdictionId, input.jurisdictionId)");
    expect(history).toContain("orderBy(desc(decisionLogs.id))");
  });

  it("only mounts the manager surface on the overview and skips requests unless the scope is complete", () => {
    expect(home).toContain('user && active === "overview" && canSeeManagementSurfaces && (');
    expect(home).toContain("<ManagerOperationalIntelligence");
    expect(home).toContain("organizationId={selectedOrganizationId}");
    expect(home).toContain("branchId={activeBranchId}");
    expect(home).toContain("jurisdictionId={activeJurisdictionId}");
    expect(intelligence).toContain("hasOrganizationBranchJurisdictionScope(organizationId, branchId, jurisdictionId)");
    expect(intelligence).toContain("scopeReady && canManage ? { organizationId: organizationId!, branchId: branchId!, jurisdictionId: jurisdictionId! } : skipToken");
    expect(intelligence).toContain("They do not approve or execute a source operation.");
    expect(intelligence).toContain("it never changes the source record state.");
  });
});
