import { describe, expect, it } from "vitest";
import { assertAssigneeScope, assertCustomerTicketScope, buildCallTicketUpdate } from "./customer-care-policy";

describe("customer and call-ticket scope policy", () => {
  it("accepts matching organization and branch scope", () => {
    expect(assertCustomerTicketScope({ ticketOrganizationId: 10, ticketBranchId: 3, customerOrganizationId: 10, customerBranchId: 3 })).toBe(true);
  });

  it("rejects cross-organization, cross-branch, and unbound customer scope", () => {
    expect(() => assertCustomerTicketScope({ ticketOrganizationId: 10, ticketBranchId: 3, customerOrganizationId: 11, customerBranchId: 3 })).toThrow(/organization/);
    expect(() => assertCustomerTicketScope({ ticketOrganizationId: 10, ticketBranchId: 3, customerOrganizationId: 10, customerBranchId: 4 })).toThrow(/branch/);
    expect(() => assertCustomerTicketScope({ ticketOrganizationId: 10, ticketBranchId: 3, customerOrganizationId: null, customerBranchId: 3 })).toThrow(/required/);
  });

  it("accepts only an assignee in the same organization and branch", () => {
    expect(assertAssigneeScope({ ticketOrganizationId: 10, ticketBranchId: 3, assigneeOrganizationId: 10, assigneeBranchId: 3 })).toBe(true);
    expect(() => assertAssigneeScope({ ticketOrganizationId: 10, ticketBranchId: 3, assigneeOrganizationId: 11, assigneeBranchId: 3 })).toThrow(/organization/);
    expect(() => assertAssigneeScope({ ticketOrganizationId: 10, ticketBranchId: 3, assigneeOrganizationId: 10, assigneeBranchId: 4 })).toThrow(/branch/);
    expect(() => assertAssigneeScope({ ticketOrganizationId: 10, ticketBranchId: 3 })).toThrow(/required/);
  });

  it("rejects an offline call-centre replay customer outside the ticket scope", () => {
    expect(() => assertCustomerTicketScope({ ticketOrganizationId: 10, ticketBranchId: 3, customerOrganizationId: 11, customerBranchId: 4 })).toThrow();
  });

  it("builds an update payload from persisted ticket fields only", () => {
    expect(buildCallTicketUpdate({ status: "resolved", disposition: "completed", assignedUserId: 7 })).toEqual({ status: "resolved", disposition: "completed", assignedUserId: 7 });
    expect(buildCallTicketUpdate({ status: "pending" })).toEqual({ status: "pending" });
    expect(buildCallTicketUpdate({ status: "closed", ...( { ticketId: 99 } as never) })).not.toHaveProperty("ticketId");
  });
});
