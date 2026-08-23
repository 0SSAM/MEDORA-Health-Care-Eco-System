export function hasJurisdictionScope(jurisdictionId: number | null | undefined) {
  return Number.isInteger(jurisdictionId) && (jurisdictionId as number) >= 0;
}

export function hasBranchJurisdictionScope(branchId: number | null | undefined, jurisdictionId: number | null | undefined) {
  return Number.isInteger(branchId) && (branchId as number) > 0 && hasJurisdictionScope(jurisdictionId);
}

export function hasOrganizationJurisdictionScope(organizationId: number | null | undefined, jurisdictionId: number | null | undefined) {
  return Number.isInteger(organizationId) && (organizationId as number) > 0 && hasJurisdictionScope(jurisdictionId);
}

export function hasOrganizationBranchJurisdictionScope(
  organizationId: number | null | undefined,
  branchId: number | null | undefined,
  jurisdictionId: number | null | undefined,
) {
  return Number.isInteger(organizationId) && (organizationId as number) > 0 && hasBranchJurisdictionScope(branchId, jurisdictionId);
}
