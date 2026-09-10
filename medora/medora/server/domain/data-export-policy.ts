export type DataExportContext = {
  subjectVerified: boolean;
  organizationScopeVerified: boolean;
  branchJurisdictionScopeVerified: boolean;
  legalBasisVerified: boolean;
  minimizationAndRedactionVerified: boolean;
  auditMetadataConfigured: boolean;
};

export function dataExportReadiness(context: DataExportContext | null) {
  if (!context) return "BLOCKED" as const;
  return Object.values(context).every(Boolean) ? "READY" as const : "BLOCKED" as const;
}

export function assertDataExportReady(context: DataExportContext | null) {
  if (dataExportReadiness(context) !== "READY") throw new Error("Data export is not ready");
  return true as const;
}
