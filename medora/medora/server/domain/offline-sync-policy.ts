export type OfflineSyncContext = {
  idempotencyKeyPresent: boolean;
  actorAndDeviceScoped: boolean;
  conflictResolutionConfigured: boolean;
  retrySafe: boolean;
  auditMetadataConfigured: boolean;
};

export function offlineSyncReadiness(context: OfflineSyncContext | null) {
  if (!context) return "BLOCKED" as const;
  return Object.values(context).every(Boolean) ? "READY" as const : "BLOCKED" as const;
}

export function assertOfflineSyncReady(context: OfflineSyncContext | null) {
  if (offlineSyncReadiness(context) !== "READY") throw new Error("Offline sync is not ready");
  return true as const;
}
