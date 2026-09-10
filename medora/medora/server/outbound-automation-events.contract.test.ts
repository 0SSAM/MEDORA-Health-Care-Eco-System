import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { buildInventoryAutomationInternalEvent, internalEventLedgerAvailable, serializeAndSignInternalEvent, shouldNotifyRepeatedAutomationFailure } from "./scheduled/outbound-events";

describe("internal automation event-ledger contract", () => {

  it("builds a minimized event with a legal jurisdiction zero and deterministic HMAC signature", () => {
    const event = buildInventoryAutomationInternalEvent({ eventId: "inventory-automation:8:1", occurredAt: new Date("2026-08-19T00:00:00.000Z"), organizationId: 7, branchId: 3, jurisdictionId: 0, batchesEvaluated: 12, managerAlertsQueued: 4 });
    const { body, signature } = serializeAndSignInternalEvent(event, "a".repeat(32));
    expect(event).toEqual({ eventId: "inventory-automation:8:1", eventType: "inventory_automation.run_completed", occurredAt: "2026-08-19T00:00:00.000Z", scope: { organizationId: 7, branchId: 3, jurisdictionId: 0 }, summary: { status: "succeeded", batchesEvaluated: 12, managerAlertsQueued: 4 } });
    expect(Object.keys(event)).toEqual(["eventId", "eventType", "occurredAt", "scope", "summary"]);
    expect(Object.keys(event.summary)).toEqual(["status", "batchesEvaluated", "managerAlertsQueued"]);
    expect(body).not.toMatch(/patient|prescription|supplier|productId|batchId|price|reason/i);
    expect(signature).toBe(createHmac("sha256", "a".repeat(32)).update(body).digest("hex"));
  });

  it("requires only a local signing key and exposes no network delivery path", () => {
    expect(internalEventLedgerAvailable("short")).toBe(false);
    expect(internalEventLedgerAvailable("a".repeat(32))).toBe(true);
    expect(String(buildInventoryAutomationInternalEvent)).not.toMatch(/fetch|https?:\/\//i);
    expect(String(serializeAndSignInternalEvent)).not.toMatch(/fetch|https?:\/\//i);
  });

  it("notifies only when a failure reaches and advances beyond its configured threshold", () => {
    expect(shouldNotifyRepeatedAutomationFailure({ nextConsecutiveFailureCount: 2, lastFailureNotificationCount: 0, threshold: 3 })).toBe(false);
    expect(shouldNotifyRepeatedAutomationFailure({ nextConsecutiveFailureCount: 3, lastFailureNotificationCount: 0, threshold: 3 })).toBe(true);
    expect(shouldNotifyRepeatedAutomationFailure({ nextConsecutiveFailureCount: 3, lastFailureNotificationCount: 3, threshold: 3 })).toBe(false);
    expect(shouldNotifyRepeatedAutomationFailure({ nextConsecutiveFailureCount: 4, lastFailureNotificationCount: 3, threshold: 3 })).toBe(true);
  });
});
