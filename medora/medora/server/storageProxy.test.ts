import { describe, expect, it } from "vitest";
import { storageProxyInternals } from "./_core/storageProxy";

describe("storage proxy boundaries", () => {
  it("accepts only the known public icon key", () => {
    expect(storageProxyInternals.isSafeStorageKey("aldo-system-icon_1c63a72c.png")).toBe(true);
    expect(storageProxyInternals.isSafeStorageKey("prescriptions/1/scan.png")).toBe(true);
    expect(storageProxyInternals.isSafeStorageKey("../secrets")).toBe(false);
    expect(storageProxyInternals.isSafeStorageKey("prescriptions/../secret")).toBe(false);
    expect(storageProxyInternals.isSafeStorageKey("prescriptions/1/scan\n.png")).toBe(false);
  });
});
