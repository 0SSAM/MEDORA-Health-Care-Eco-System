import { describe, expect, it } from "vitest";
import { canQueueOfflineDraft, enqueueOfflineDraft, isOfflinePayloadSafe } from "./offlineQueue";

describe("limited offline mode", () => {
  it("allows only non-regulated drafts", () => {
    expect(canQueueOfflineDraft({ regulated: false, payload: { note: "stock reminder" } })).toBe(true);
    expect(isOfflinePayloadSafe({ note: "stock reminder" })).toBe(true);
    expect(isOfflinePayloadSafe({ patientId: "P-1" })).toBe(false);
    expect(isOfflinePayloadSafe({ nested: { diagnosis: "Z00" } })).toBe(false);
    expect(canQueueOfflineDraft({ regulated: true, payload: { total: 10 } })).toBe(false);
  });

  it("fails closed before writing a regulated draft", () => {
    expect(() => enqueueOfflineDraft({
      idempotencyKey: "regulated-1",
      module: "sales",
      payload: { total: 10 },
      regulated: true,
    })).toThrow("regulated-or-sensitive-offline-draft-blocked");
  });

  it("fails closed for sensitive fields even when regulated is false", () => {
    expect(() => enqueueOfflineDraft({
      idempotencyKey: "sensitive-1",
      module: "notes",
      payload: { email: "person@example.com" },
      regulated: false,
    })).toThrow("regulated-or-sensitive-offline-draft-blocked");
  });
});
