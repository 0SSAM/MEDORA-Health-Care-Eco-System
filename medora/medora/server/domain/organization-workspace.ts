export type OrganizationType =
  | "government"
  | "pharmacy"
  | "pharmacy_chain"
  | "distributor"
  | "insurer"
  | "rehabilitation"
  | "hospital"
  | "laboratory"
  | "radiology";

const workspaceModules: Record<OrganizationType, string[]> = {
  government: ["overview", "compliance", "finance", "people", "insurance"],
  pharmacy: ["overview", "pos", "inventory", "prescriptions", "insurance", "compliance", "customerCare", "callCentre", "catalog"],
  pharmacy_chain: ["overview", "pos", "inventory", "prescriptions", "insurance", "compliance", "finance", "people", "customerCare", "callCentre", "catalog"],
  distributor: ["overview", "inventory", "compliance", "finance", "people", "catalog"],
  insurer: ["overview", "insurance", "compliance", "finance", "people", "customerCare"],
  rehabilitation: ["overview", "prescriptions", "customerCare", "finance", "compliance", "people"],
  hospital: ["overview", "inventory", "prescriptions", "insurance", "compliance", "finance", "people", "customerCare"],
  laboratory: ["overview", "prescriptions", "compliance", "finance", "people", "customerCare"],
  radiology: ["overview", "prescriptions", "compliance", "finance", "people", "customerCare"],
};

export function modulesForOrganization(organizationType: string | undefined) {
  if (!organizationType || !(organizationType in workspaceModules)) return null;
  return workspaceModules[organizationType as OrganizationType];
}

export function canUseOrganizationModule(organizationType: string | undefined, moduleId: string) {
  const modules = modulesForOrganization(organizationType);
  return modules !== null && modules.includes(moduleId);
}
