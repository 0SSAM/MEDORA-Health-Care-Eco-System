import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const schema = readFileSync(resolve(root, "drizzle/schema.ts"), "utf8");
const operations = readFileSync(resolve(root, "server/routers/operations.ts"), "utf8");
const procurement = readFileSync(resolve(root, "server/routers/procurement.ts"), "utf8");
const erp = readFileSync(resolve(root, "server/routers/erp.ts"), "utf8");
const managerUi = readFileSync(resolve(root, "client/src/components/ManagerOperationalIntelligence.tsx"), "utf8");
const supplyUi = readFileSync(resolve(root, "client/src/components/SupplyChainWorkspace.tsx"), "utf8");
const home = readFileSync(resolve(root, "client/src/pages/Home.tsx"), "utf8");

describe("SLA policy and approval ledger contract", () => {
  it("stores one adjustable SLA policy per organization with bounded targets and auditable updates", () => {
    expect(schema).toContain('export const organizationSlaPolicies = mysqlTable("organization_sla_policies"');
    expect(schema).toContain('organizationIdx: uniqueIndex("organization_sla_policies_organization_idx").on(table.organizationId)');
    expect(operations).toContain("const slaPolicyValues = z.object({");
    expect(operations).toContain("procurementTargetHours: z.number().int().min(1).max(720)");
    expect(operations).toContain("customerCareTargetHours: z.number().int().min(1).max(720)");
    expect(operations).toContain("escalationGraceHours: z.number().int().min(1).max(720)");
    expect(operations).toContain("escalationEnabled: z.boolean()");
    expect(operations).toContain("updateSlaPolicy: protectedProcedure.input(managementScope.extend(slaPolicyValues.shape))");
    expect(operations).toContain('action: "organization_sla_policy_updated"');
  });

  it("calculates quiet escalation inside the scoped SLA response without an external execution path", () => {
    const sla = operations.slice(operations.indexOf("slaIndicators: protectedProcedure"), operations.indexOf("slaPolicy: protectedProcedure"));
    expect(sla).toContain("eq(purchaseOrders.jurisdictionId, input.jurisdictionId)");
    expect(sla).toContain("eq(customerCareCases.jurisdictionId, input.jurisdictionId)");
    expect(sla).toContain("const escalationGraceHours = configuredPolicy?.escalationGraceHours ?? 24");
    expect(sla).toContain("if (!escalationEnabled) return { attention: 0, persistent: 0 }");
    expect(sla).toContain("policy: { configured: Boolean(configuredPolicy), procurementTargetHours, customerCareTargetHours: customerServiceTargetHours, escalationGraceHours, escalationEnabled }");
    expect(sla).toContain("escalation: { attention: caseEscalations.attention + taskEscalations.attention, persistent: caseEscalations.persistent + taskEscalations.persistent }");
    expect(sla).not.toContain("fetch(");
    expect(sla).not.toContain("sendEmail");
  });

  it("keeps the managerial SLA screen scope-gated and exposes only in-app quiet controls", () => {
    expect(managerUi).toContain("hasOrganizationBranchJurisdictionScope(organizationId, branchId, jurisdictionId)");
    expect(managerUi).toContain("slaPolicy.useQuery(input");
    expect(managerUi).toContain("updateSlaPolicy.useMutation");
    expect(managerUi).toContain("copy.slaSettings");
    expect(managerUi).toContain("copy.escalationEnabled");
    expect(managerUi).toContain("MEDORA and never sends an external notification");
  });

  it("requires a human reason and writes purchase-order decisions with their audit event atomically", () => {
    const transition = procurement.slice(procurement.indexOf("transition: protectedProcedure"), procurement.indexOf("  }),\n  receiving:"));
    expect(transition).toContain('reason: z.string().trim().min(1).max(1000).optional()');
    expect(transition).toContain('if (!input.reason) throw new TRPCError');
    expect(transition).toContain("await db.transaction(async tx => {");
    expect(transition).toContain('entityType: "purchase_order"');
    expect(transition).toContain("await tx.insert(decisionLogs).values");
    expect(transition).toContain("await tx.insert(auditLogs).values");
    expect(transition).toContain("purchase_order_${input.nextStatus}_decision_recorded");
  });

  it("keeps procurement list, creation, and reporting jurisdiction-safe including legal jurisdiction zero", () => {
    expect(procurement).toContain("jurisdictionId: z.number().int().nonnegative().nullable().optional()");
    expect(procurement).toContain("const purchaseOrderScopeSchema = scopeSchema.extend({ jurisdictionId: z.number().int().nonnegative() })");
    expect(procurement).toContain("await assertManagement(db, ctx.user.id, ctx.user.role, input.organizationId); return db.select().from(purchaseOrders).where(and(eq(purchaseOrders.organizationId, input.organizationId), eq(purchaseOrders.branchId, input.branchId), eq(purchaseOrders.jurisdictionId, input.jurisdictionId)))");
    expect(procurement).toContain("eq(suppliers.jurisdictionId, input.jurisdictionId)");
    expect(procurement).toContain("reportQuerySchema.extend({ jurisdictionId: z.number().int().nonnegative() })");
  });

  it("binds inter-branch transfer reviews to the same reasoned and atomic decision pattern", () => {
    const review = erp.slice(erp.indexOf("reviewInterBranchTransfer: protectedProcedure"), erp.indexOf("\n  }),", erp.indexOf("reviewInterBranchTransfer: protectedProcedure")));
    expect(review).toContain('reason: z.string().trim().min(1).max(1000)');
    expect(review).toContain("await db.transaction(async tx => {");
    expect(review).toContain('entityType: "inter_branch_transfer"');
    expect(review).toContain("await tx.insert(decisionLogs).values");
    expect(review).toContain('action: "inter_branch_transfer_review_recorded"');
  });

  it("wires the existing purchase-order transition into a manager-only supply review surface", () => {
    expect(supplyUi).toContain("purchaseOrderScopeReady = canManage && hasOrganizationBranchJurisdictionScope");
    expect(supplyUi).toContain("trpc.procurement.purchaseOrders.list.useQuery(purchaseOrderScope");
    expect(supplyUi).toContain("trpc.procurement.purchaseOrders.transition.useMutation");
    expect(supplyUi).toContain("reason.length < 3");
    expect(supplyUi).toContain("Recorded human decision");
    expect(home).toContain("<SupplyChainWorkspace organizationId={organizationId} branchId={branchId} jurisdictionId={jurisdictionId} canManage={canManagePolicies} />");
  });
});
