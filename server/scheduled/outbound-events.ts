import { createHmac } from "node:crypto";

export const inventoryAutomationEventType = "inventory_automation.run_completed" as const;

export type InventoryAutomationInternalEvent = {
  eventId: string;
  eventType: typeof inventoryAutomationEventType;
  occurredAt: string;
  scope: {
    organizationId: number;
    branchId: number;
    jurisdictionId: number;
  };
  summary: {
    status: "succeeded";
    batchesEvaluated: number;
    managerAlertsQueued: number;
  };
};

export function internalEventLedgerAvailable(signingKey: string) {
  return signingKey.trim().length >= 32;
}

export function buildInventoryAutomationInternalEvent(input: {
  eventId: string;
  occurredAt: Date;
  organizationId: number;
  branchId: number;
  jurisdictionId: number;
  batchesEvaluated: number;
  managerAlertsQueued: number;
}): InventoryAutomationInternalEvent {
  return {
    eventId: input.eventId,
    eventType: inventoryAutomationEventType,
    occurredAt: input.occurredAt.toISOString(),
    scope: {
      organizationId: input.organizationId,
      branchId: input.branchId,
      jurisdictionId: input.jurisdictionId,
    },
    summary: {
      status: "succeeded",
      batchesEvaluated: Math.max(0, Math.trunc(input.batchesEvaluated)),
      managerAlertsQueued: Math.max(0, Math.trunc(input.managerAlertsQueued)),
    },
  };
}

export function serializeAndSignInternalEvent(event: InventoryAutomationInternalEvent, signingKey: string) {
  const body = JSON.stringify(event);
  const signature = createHmac("sha256", signingKey).update(body).digest("hex");
  return { body, signature };
}

export function shouldNotifyRepeatedAutomationFailure(input: {
  nextConsecutiveFailureCount: number;
  lastFailureNotificationCount: number;
  threshold: number;
}) {
  return input.nextConsecutiveFailureCount >= input.threshold
    && input.nextConsecutiveFailureCount > input.lastFailureNotificationCount;
}
