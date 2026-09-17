import { canViewOrganizationAudit, canViewSensitiveClinicalData, type OrganizationMembershipSnapshot } from "./organization-access";

export const SENSITIVE_DATA_TYPES = [
  "patient",
  "prescription",
  "diagnostic",
  "imaging",
  "insurance",
  "audit",
] as const;

export type SensitiveDataType = (typeof SENSITIVE_DATA_TYPES)[number];

export type SensitiveAccessRequest = {
  userRole: string;
  memberships: OrganizationMembershipSnapshot[];
  organizationId: number;
  dataType: SensitiveDataType;
  purpose: "view" | "create" | "update" | "export";
};

export function canAccessSensitiveData(request: SensitiveAccessRequest) {
  if (request.purpose === "export") return false;
  if (request.dataType === "audit") {
    return canViewOrganizationAudit(request.userRole, request.memberships, request.organizationId);
  }
  if (!canViewSensitiveClinicalData(request.userRole, request.memberships, request.organizationId)) return false;

  // High-risk imaging and insurance records require a future domain-specific capability.
  // Do not widen the existing clinical-lead permission while removing demo bypasses.
  if (request.dataType === "imaging" || request.dataType === "insurance") return false;
  return true;
}

export function assertSensitiveDataAccess(request: SensitiveAccessRequest) {
  if (!canAccessSensitiveData(request)) {
    throw new Error("Sensitive data access denied");
  }
  return true as const;
}
