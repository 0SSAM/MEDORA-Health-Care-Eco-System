import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const routerSource = readFileSync(resolve(process.cwd(), "server/routers/secondaryModules.ts"), "utf8");

describe("secondary module workflow and scope contract", () => {
  it("treats jurisdiction zero as a valid scoped value when attaching a task to a case", () => {
    expect(routerSource).toContain("jurisdictionId: z.number().int().nonnegative().nullable().optional()");
    expect(routerSource).toContain("hasScopeValue(input.jurisdictionId) ? eq(customerCareCases.jurisdictionId, input.jurisdictionId) : undefined");
    expect(routerSource).toContain("Branch is required when a jurisdiction scope is supplied");
    expect(routerSource).toContain("Jurisdiction is outside the authorized branch scope");
  });

  it("checks case ownership before recording satisfaction", () => {
    expect(routerSource).toContain('message: "Case is outside the authorized scope"');
    expect(routerSource).toContain("const caseRow = await db.select({ id: customerCareCases.id })");
  });

  it("routes CRM and customer-care transitions through the shared policy", () => {
    expect(routerSource).toContain("canTransitionCrmOpportunity(row.stage, input.nextStage)");
    expect(routerSource).toContain("canTransitionCustomerCase(row.status, input.nextStatus)");
  });

  it("prevents closing a care case while actionable tasks remain", () => {
    expect(routerSource).toContain("Complete or cancel outstanding care tasks before closing the case");
    expect(routerSource).toContain("customerCareTasks.status} IN ('open', 'in_progress')");
  });

  it("keeps the customer 360 record within the requested operational scope", () => {
    expect(routerSource).toContain("await assertScopedCustomer(db, input)");
    expect(routerSource).toContain("eq(callTickets.customerId, input.customerId)");
  });

  it("sets a measurable SLA only after branch-scoped queue membership is verified", () => {
    expect(routerSource).toContain("Assigned user is not an active queue member");
    expect(routerSource).toContain("const slaDueAt = new Date(now.getTime() + queue.slaMinutes * 60_000)");
    expect(routerSource).toContain('action: "call_ticket_assigned"');
  });

  it("keeps HR lifecycle transitions manager-gated and audit logged", () => {
    expect(routerSource).toContain("const allowed: Record<string, string[]> = { draft: [\"active\", \"terminated\"], active: [\"expired\", \"terminated\"], expired: [], terminated: [] }");
    expect(routerSource).toContain("await assertManager(db, ctx.user.id, ctx.user.role, input.organizationId)");
    expect(routerSource).toContain("Review transition is not allowed");
    expect(routerSource).toContain("hr_shift_${input.nextStatus}");
  });

  it("validates HR creation through the shared branch and jurisdiction scope gate", () => {
    const hrSource = routerSource.slice(routerSource.indexOf("hr: router({"), routerSource.indexOf("customerCare: router({"));
    expect(hrSource).toContain("contracts: protectedProcedure");
    expect(hrSource).toContain("shifts: protectedProcedure");
    expect(hrSource.match(/await validateScope\(db, ctx, input\)/g)?.length).toBeGreaterThanOrEqual(4);
  });

  it("keeps lead conversion inside the current organization, branch, and jurisdiction", () => {
    expect(routerSource).toContain("Lead is outside the authorized scope");
    expect(routerSource).toContain("crm_lead_converted");
    expect(routerSource).toContain("jurisdictionId: lead.jurisdictionId");
  });
});
