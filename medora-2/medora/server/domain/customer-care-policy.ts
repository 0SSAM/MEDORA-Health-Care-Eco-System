export function assertCustomerTicketScope(input: { ticketOrganizationId: number; ticketBranchId: number; customerOrganizationId?: number | null; customerBranchId?: number | null }): true {
  if (!Number.isInteger(input.ticketOrganizationId) || input.ticketOrganizationId <= 0 || !Number.isInteger(input.ticketBranchId) || input.ticketBranchId <= 0) throw new Error("Ticket scope is required");
  if (input.customerOrganizationId == null || input.customerBranchId == null) throw new Error("Customer scope is required");
  if (input.customerOrganizationId !== input.ticketOrganizationId) throw new Error("Customer is outside ticket organization scope");
  if (input.customerBranchId !== input.ticketBranchId) throw new Error("Customer is outside ticket branch scope");
  return true;
}

export function assertAssigneeScope(input: { ticketOrganizationId: number; ticketBranchId: number; assigneeOrganizationId?: number | null; assigneeBranchId?: number | null }): true {
  if (input.assigneeOrganizationId == null || input.assigneeBranchId == null) throw new Error("Assigned user scope is required");
  if (input.assigneeOrganizationId !== input.ticketOrganizationId) throw new Error("Assigned user is outside ticket organization scope");
  if (input.assigneeBranchId !== input.ticketBranchId) throw new Error("Assigned user is outside ticket branch scope");
  return true;
}

export function buildCallTicketUpdate(input: { status: "open" | "pending" | "resolved" | "closed"; disposition?: string; assignedUserId?: number }) {
  return { status: input.status, ...(input.disposition === undefined ? {} : { disposition: input.disposition }), ...(input.assignedUserId === undefined ? {} : { assignedUserId: input.assignedUserId }) };
}
