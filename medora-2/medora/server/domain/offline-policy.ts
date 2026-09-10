export type OfflineOperationKind = "catalogDraft" | "customerCareDraft" | "callCentreDraft" | "inventoryMutation" | "sale" | "prescription" | "invoice";

export type OfflineContext = {
  hasConfirmedJurisdiction: boolean;
  packIsCurrent: boolean;
  isOnline: boolean;
};

export type OfflineDecision = {
  allowed: boolean;
  queueable: boolean;
  reason: string;
};

const REGULATED = new Set<OfflineOperationKind>(["inventoryMutation", "sale", "prescription", "invoice"]);

export function decideOfflineOperation(kind: OfflineOperationKind, context: OfflineContext): OfflineDecision {
  if (REGULATED.has(kind)) {
    if (!context.hasConfirmedJurisdiction) return { allowed: false, queueable: false, reason: "confirmed-jurisdiction-required" };
    if (!context.packIsCurrent) return { allowed: false, queueable: false, reason: "current-compliance-pack-required" };
    if (!context.isOnline) return { allowed: false, queueable: false, reason: "regulated-operation-requires-online-validation" };
    return { allowed: true, queueable: false, reason: "validated-online" };
  }
  if (context.isOnline) return { allowed: true, queueable: false, reason: "online" };
  return { allowed: true, queueable: true, reason: "non-regulated-draft-only" };
}

export type SyncConflict = {
  localRevision: number;
  serverRevision: number;
  localUpdatedAt: number;
  serverUpdatedAt: number;
};

export function resolveDraftConflict(conflict: SyncConflict) {
  if (conflict.localRevision === conflict.serverRevision) return { action: "noop" as const };
  return {
    action: "manual-review" as const,
    reason: conflict.serverRevision > conflict.localRevision ? "server-wins-until-review" : "local-draft-requires-review",
  };
}
