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
  "view_financials",
] as const;

export type OrganizationCapability = (typeof ORGANIZATION_CAPABILITIES)[number];

export const ROLE_CAPABILITIES: Record<OrganizationRole, readonly OrganizationCapability[]> = {
  owner: ["view_workspace", "manage_members", "view_sensitive_clinical", "view_audit", "view_financials"],
  org_admin: ["view_workspace", "manage_members", "view_sensitive_clinical", "view_audit", "view_financials"],
  compliance_officer: ["view_workspace", "view_sensitive_clinical", "view_audit"],
  clinical_lead: ["view_workspace", "view_sensitive_clinical"],
  operations_manager: ["view_workspace", "view_financials"],
  staff: ["view_workspace"],
  auditor: ["view_workspace", "view_sensitive_clinical", "view_audit"],
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

export function canViewFinancialData(
  userRole: string,
  memberships: OrganizationMembershipSnapshot[],
  organizationId: number,
) {
  return hasOrganizationCapability(userRole, memberships, organizationId, "view_financials");
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
