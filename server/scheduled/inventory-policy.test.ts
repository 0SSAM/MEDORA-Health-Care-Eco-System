import { describe, expect, it } from "vitest";
import { safeInventoryTransportError } from "./inventory";

describe("inventory alert transport policy", () => {
  it("returns only a fixed error code for internal failures", () => {
    const response = safeInventoryTransportError(new Error("password=secret url=/private taskUid=hidden"));
    expect(response).toEqual({ error: "inventory-alert-execution-failed" });
    expect(JSON.stringify(response)).not.toContain("password");
    expect(JSON.stringify(response)).not.toContain("/private");
    expect(JSON.stringify(response)).not.toContain("taskUid");
  });
});
