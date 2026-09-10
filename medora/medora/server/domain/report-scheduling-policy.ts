export function getReportSchedulingReadiness(value: string | undefined) {
  const enabled = value === "true";
  return {
    enabled,
    reason: enabled
      ? null
      : "Report automation is disabled until an authorized production release explicitly enables it.",
  } as const;
}

export function assertReportSchedulingEnabled(value: string | undefined): void {
  const readiness = getReportSchedulingReadiness(value);
  if (!readiness.enabled) throw new Error("Report automation is disabled until an authorized production release explicitly enables it.");
}
