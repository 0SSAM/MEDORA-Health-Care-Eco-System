import { describe, expect, it } from "vitest";
import { canSyncOfflineDraft, reviewTransaction } from "./realtimeReview";

describe("realtime review safety", () => {
  it("blocks regulated work without server confirmation", () => {
    expect(reviewTransaction({ module: "pos", hasServerConfirmation: false, sensitiveFieldsPresent: false }).status).toBe("BLOCKED");
  });
  it("requires review for sensitive data", () => {
    expect(reviewTransaction({ module: "customer-care", hasServerConfirmation: true, sensitiveFieldsPresent: true }).status).toBe("REVIEW");
  });
  it("falls back to human review when the model is unavailable and emits an audit event", () => {
    const result = reviewTransaction({ module: "inventory", hasServerConfirmation: true, sensitiveFieldsPresent: false, modelAvailable: false });
    expect(result.status).toBe("REVIEW");
    expect(result.auditEvent.modelStatus).toBe("unavailable");
  });
  it("only syncs drafts online with an idempotency key", () => {
    expect(canSyncOfflineDraft({ idempotencyKey: "x", regulated: false, serverOnline: true, approvedByHuman: false })).toBe(true);
    expect(canSyncOfflineDraft({ idempotencyKey: "x", regulated: true, serverOnline: true, approvedByHuman: false })).toBe(false);
  });
});
