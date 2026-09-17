export type CatalogIntakeContext = {
  actorRole: "admin" | "catalog_manager" | "user";
  organizationId: string;
  branchId: string;
  jurisdictionCode: string;
  recordOrganizationId: string;
  recordBranchId: string;
  recordJurisdictionCode: string;
  sourceUrl: string;
  sourceVerified: boolean;
};

export function catalogIntakeReadiness(context: CatalogIntakeContext | null) {
  if (!context) return "BLOCKED" as const;
  const authorized = context.actorRole === "admin" || context.actorRole === "catalog_manager";
  const scoped = context.organizationId === context.recordOrganizationId && context.branchId === context.recordBranchId && context.jurisdictionCode === context.recordJurisdictionCode;
  return authorized && scoped && Boolean(context.sourceUrl) && context.sourceVerified ? "READY" as const : "BLOCKED" as const;
}

export function assertCatalogIntakeReady(context: CatalogIntakeContext | null) {
  if (catalogIntakeReadiness(context) !== "READY") throw new Error("Catalog intake is not authorized or source-verified");
  return true as const;
}
