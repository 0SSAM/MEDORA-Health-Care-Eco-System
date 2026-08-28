import { describe, it, expect, vi } from "vitest";
import { ConflictResolver, SyncEngine } from "./sync-engine";

describe("MEDORA sync engine (Outbox + LWW)", () => {
  it("enqueues a local change into the outbox", () => {
    const e = new SyncEngine("dev-1");
    const c = e.enqueue("customer", "42", "upsert", { name: "x" });
    expect(e.pending).toHaveLength(1);
    expect(c.entityType).toBe("customer");
    expect(c.entityId).toBe("42");
  });
  it("push() forwards the batch to onPush and empties the outbox", async () => {
    const onPush = vi.fn(async () => {});
    const e = new SyncEngine("dev-1", onPush);
    e.enqueue("customer", "1", "upsert", {});
    e.enqueue("customer", "2", "upsert", {});
    await e.push();
    expect(onPush).toHaveBeenCalledOnce();
    expect(onPush.mock.calls[0][0]).toHaveLength(2);
    expect(e.pending).toHaveLength(0);
  });
  it("resolves conflicts by last-write-wins (later ts wins)", () => {
    const r = new ConflictResolver();
    const local = { entityType: "c", entityId: "1", op: "upsert", payload: { v: 1 }, version: 1, deviceId: "a", ts: 100 };
    const remote = { entityType: "c", entityId: "1", op: "upsert", payload: { v: 2 }, version: 2, deviceId: "b", ts: 200 };
    expect(r.resolveLww(local, remote)).toBe(remote);
    expect(r.resolveLww(remote, local)).toBe(remote);
  });
  it("merge() combines local and remote keeping newest per entity", () => {
    const e = new SyncEngine("dev-1");
    const merged = e.merge(
      [{ entityType: "c", entityId: "1", op: "upsert", payload: { v: 1 }, version: 1, deviceId: "a", ts: 100 }],
      [{ entityType: "c", entityId: "1", op: "upsert", payload: { v: 9 }, version: 9, deviceId: "b", ts: 900 }],
    );
    expect(merged).toHaveLength(1);
    expect(merged[0]).toEqual({ entityType: "c", entityId: "1", op: "upsert", payload: { v: 9 }, version: 9, deviceId: "b", ts: 900 });
  });
  it("delete op survives merge when it is the newest change", () => {
    const e = new SyncEngine("dev-1");
    const merged = e.merge(
      [{ entityType: "c", entityId: "1", op: "upsert", payload: { v: 5 }, version: 5, deviceId: "a", ts: 500 }],
      [{ entityType: "c", entityId: "1", op: "delete", payload: null, version: 6, deviceId: "b", ts: 600 }],
    );
    expect(merged).toHaveLength(1);
    expect(merged[0].op).toBe("delete");
  });
});
