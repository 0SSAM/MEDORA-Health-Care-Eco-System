import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyScopedManifest } from "./routers/backup";

const manifest = {
  format: "MEDORA-SCOPED-BACKUP-V1",
  generatedAt: "2026-08-17T00:00:00.000Z",
  scope: { organizationId: 7, branchId: 3 },
  data: {
    organization: [{ id: 7 }],
    branches: [{ id: 3 }],
    products: [],
    inventoryBatches: [],
    sales: [],
    purchaseOrders: [],
    auditLogs: [],
  },
};

function encoded(value: unknown) {
  return Buffer.from(JSON.stringify(value));
}

describe("isolated backup restore verification", () => {
  it("accepts a valid scoped manifest and returns an auditable summary", () => {
    const bytes = encoded(manifest);
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    expect(verifyScopedManifest(bytes, sha256, 7, 3)).toMatchObject({
      format: "MEDORA-SCOPED-BACKUP-V1",
      scope: { organizationId: 7, branchId: 3 },
      sha256,
      recordCount: 2,
    });
  });

  it("rejects tampered bytes and cross-scope payloads", () => {
    const bytes = encoded(manifest);
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    expect(() => verifyScopedManifest(Buffer.from(`${bytes.toString("utf8")}x`), sha256, 7, 3)).toThrow("backup-integrity-mismatch");
    expect(() => verifyScopedManifest(bytes, sha256, 8, 3)).toThrow("backup-scope-mismatch");
  });
});
