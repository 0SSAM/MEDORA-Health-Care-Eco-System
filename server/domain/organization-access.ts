export type OrganizationMembershipSnapshot = {
  organizationId: number;
  active: number;
  organizationRole: string;
};

export const ORGANIZATION_ROLES = [
  "owner",
  "org_admin",
  "compliance_officer",
  "clinical_lead",
  "operations_manager",
  "staff",
  "auditor",
] as const;

export type OrganizationRole = (typeof ORGANIZATION_ROLES)[number];

export const ORGANIZATION_CAPABILITIES = [
  "view_workspace",
  "manage_members",
  "view_sensitive_clinical",
  "view_audit",
  // Inventory & Logistics
  "inventory_transfer_create",
  "inventory_transfer_approve",
  "inventory_transfer_dispatch",
  "inventory_transfer_receive",
  "inventory_adjustment_create",
  "inventory_adjustment_approve",
  // Finance
  "finance_expense_create",
  "finance_expense_approve",
  "finance_expense_cancel",
  "view_reports",
  "manage_payroll",
] as const;

export type OrganizationCapability = (typeof ORGANIZATION_CAPABILITIES)[number];

export const ROLE_CAPABILITIES: Record<OrganizationRole, readonly OrganizationCapability[]> = {
  owner: [
    "view_workspace", "manage_members", "view_sensitive_clinical", "view_audit",
    "inventory_transfer_create", "inventory_transfer_approve", "inventory_transfer_dispatch", "inventory_transfer_receive",
    "inventory_adjustment_create", "inventory_adjustment_approve",
    "finance_expense_create", "finance_expense_approve", "finance_expense_cancel",
    "view_reports", "manage_payroll"
  ],
  org_admin: [
    "view_workspace", "manage_members", "view_sensitive_clinical", "view_audit",
    "inventory_transfer_create", "inventory_transfer_approve", "inventory_transfer_dispatch", "inventory_transfer_receive",
    "inventory_adjustment_create", "inventory_adjustment_approve",
    "finance_expense_create", "finance_expense_approve", "finance_expense_cancel",
    "view_reports", "manage_payroll"
  ],
  operations_manager: [
    "view_workspace", "view_audit",
    "inventory_transfer_create", "inventory_transfer_approve", "inventory_transfer_dispatch", "inventory_transfer_receive",
    "inventory_adjustment_create", "inventory_adjustment_approve",
    "finance_expense_create", "finance_expense_approve", "finance_expense_cancel",
    "view_reports", "manage_payroll"
  ],
  clinical_lead: [
    "view_workspace", "view_sensitive_clinical",
    "inventory_transfer_create", "inventory_transfer_receive",
    "inventory_adjustment_create"
  ],
  staff: [
    "view_workspace",
    "inventory_transfer_create", "inventory_transfer_receive",
    "inventory_adjustment_create",
    "finance_expense_create"
  ],
  auditor: [
    "view_workspace", "view_sensitive_clinical", "view_audit", "view_reports"
  ],
  compliance_officer: [
    "view_workspace", "view_sensitive_clinical", "view_audit"
  ]
};

function isActiveMember(
  memberships: OrganizationMembershipSnapshot[],
  organizationId: number,
) {
  return memberships.find(
    membership => membership.organizationId === organizationId && membership.active === 1,
  );
}

export function hasOrganizationCapability(
  userRole: string,
  memberships: OrganizationMembershipSnapshot[],
  organizationId: number,
  capability: OrganizationCapability,
) {
  if (userRole === "admin") return true;
  const membership = isActiveMember(memberships, organizationId);
  if (!membership || !ORGANIZATION_ROLES.includes(membership.organizationRole as OrganizationRole)) return false;
  return ROLE_CAPABILITIES[membership.organizationRole as OrganizationRole].includes(capability);
}

export async function checkCapability(
  db: any,
  userId: number,
  organizationId: number,
  capability: OrganizationCapability,
) {
  const { organizationMemberships, internalCredentials } = await import("../../drizzle/schema");
  const { eq, and } = await import("drizzle-orm");
  
  const user = (await db.select({ role: internalCredentials.accountType }).from(internalCredentials).where(eq(internalCredentials.userId, userId)).limit(1))[0];
  if (user?.role === "admin") return true;

  const memberships = await db.select().from(organizationMemberships).where(
    and(
      eq(organizationMemberships.userId, userId),
      eq(organizationMemberships.organizationId, organizationId),
      eq(organizationMemberships.active, 1)
    )
  );

  if (memberships.length === 0) return false;
  const role = memberships[0].organizationRole as OrganizationRole;
  return ROLE_CAPABILITIES[role]?.includes(capability) || false;
}

export function canAccessOrganization(
  userRole: string,
  memberships: OrganizationMembershipSnapshot[],
  organizationId: number,
) {
  return hasOrganizationCapability(userRole, memberships, organizationId, "view_workspace");
}

export function canManageOrganization(
  userRole: string,
  memberships: OrganizationMembershipSnapshot[],
  organizationId: number,
) {
  return hasOrganizationCapability(userRole, memberships, organizationId, "manage_members");
}

export function canViewSensitiveClinicalData(
  userRole: string,
  memberships: OrganizationMembershipSnapshot[],
  organizationId: number,
) {
  return hasOrganizationCapability(userRole, memberships, organizationId, "view_sensitive_clinical");
}

export function canViewOrganizationAudit(
  userRole: string,
  memberships: OrganizationMembershipSnapshot[],
  organizationId: number,
) {
  return hasOrganizationCapability(userRole, memberships, organizationId, "view_audit");
}

export function isSupportedOrganizationType(value: string) {
  return [
    "government",
    "pharmacy",
    "pharmacy_chain",
    "distributor",
    "insurer",
    "rehabilitation",
    "hospital",
    "laboratory",
    "radiology",
  ].includes(value);
}
