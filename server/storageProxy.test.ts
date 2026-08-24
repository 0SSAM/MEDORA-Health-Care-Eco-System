import { describe, expect, it } from "vitest";
import { storageProxyInternals } from "./_core/storageProxy";

describe("storage proxy boundaries", () => {
  it("joins the named Express 5 wildcard segments without accepting other parameter shapes", () => {
    expect(storageProxyInternals.getStorageKeyParam({ key: ["public", "medora-system-icon_1c63a72c.png"] })).toBe("public/medora-system-icon_1c63a72c.png");
    expect(storageProxyInternals.getStorageKeyParam({ key: "medora-system-icon_1c63a72c.png" })).toBe("medora-system-icon_1c63a72c.png");
    expect(storageProxyInternals.getStorageKeyParam({ 0: "legacy-wildcard" })).toBeUndefined();
    expect(storageProxyInternals.getStorageKeyParam({ key: ["safe", 4] })).toBeUndefined();
  });

  it("accepts only the known public icon key", () => {
    expect(storageProxyInternals.isSafeStorageKey("medora-system-icon_1c63a72c.png")).toBe(true);
    expect(storageProxyInternals.isSafeStorageKey("prescriptions/1/scan.png")).toBe(true);
    expect(storageProxyInternals.isSafeStorageKey("../secrets")).toBe(false);
    expect(storageProxyInternals.isSafeStorageKey("prescriptions/../secret")).toBe(false);
    expect(storageProxyInternals.isSafeStorageKey("prescriptions/1/scan\n.png")).toBe(false);
  });
});
