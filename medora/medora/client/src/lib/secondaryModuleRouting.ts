export type SecondaryModuleTab = "crm" | "hr" | "callCenter" | "customerCare";

export function secondaryModuleTabForRoute(route: string): SecondaryModuleTab | null {
  const tabs: Record<string, SecondaryModuleTab> = {
    secondaryModules: "crm",
    people: "hr",
    callCentre: "callCenter",
    customerCare: "customerCare",
  };
  return tabs[route] ?? null;
}
