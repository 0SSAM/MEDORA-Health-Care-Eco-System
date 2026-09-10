import { describe, expect, it } from "vitest";
import { decideOfflineOperation, resolveDraftConflict } from "./offline-policy";

describe("offline policy", () => {
  it("allows only non-regulated drafts while offline", () => {
    const context = { hasConfirmedJurisdiction: true, packIsCurrent: true, isOnline: false };
    expect(decideOfflineOperation("customerCareDraft", context)).toMatchObject({ allowed: true, queueable: true });
    expect(decideOfflineOperation("sale", context)).toMatchObject({ allowed: false, queueable: false });
  });

  it("blocks regulated work without a confirmed current pack", () => {
    expect(decideOfflineOperation("prescription", { hasConfirmedJurisdiction: false, packIsCurrent: true, isOnline: true }).allowed).toBe(false);
    expect(decideOfflineOperation("invoice", { hasConfirmedJurisdiction: true, packIsCurrent: false, isOnline: true }).allowed).toBe(false);
  });

  it("never silently overwrites a draft conflict", () => {
    expect(resolveDraftConflict({ localRevision: 1, serverRevision: 1, localUpdatedAt: 1, serverUpdatedAt: 1 })).toEqual({ action: "noop" });
    expect(resolveDraftConflict({ localRevision: 2, serverRevision: 3, localUpdatedAt: 2, serverUpdatedAt: 3 })).toMatchObject({ action: "manual-review" });
  });
});
