import { describe, expect, it } from "vitest";
import { assertOfflineSyncReady, offlineSyncReadiness, type OfflineSyncContext } from "./offline-sync-policy";

const complete: OfflineSyncContext = {
  idempotencyKeyPresent: true,
  actorAndDeviceScoped: true,
  conflictResolutionConfigured: true,
  retrySafe: true,
  auditMetadataConfigured: true,
};

describe("offline sync readiness", () => {
  it("blocks synchronization when idempotency, scope, conflict, retry, or audit gates are missing", () => {
    expect(offlineSyncReadiness(null)).toBe("BLOCKED");
    expect(offlineSyncReadiness({ ...complete, idempotencyKeyPresent: false })).toBe("BLOCKED");
    expect(offlineSyncReadiness({ ...complete, conflictResolutionConfigured: false })).toBe("BLOCKED");
    expect(() => assertOfflineSyncReady({ ...complete, retrySafe: false })).toThrow(/not ready/);
  });

  it("allows synchronization only when every offline mutation gate is verified", () => {
    expect(offlineSyncReadiness(complete)).toBe("READY");
    expect(assertOfflineSyncReady(complete)).toBe(true);
  });
});
