import { describe, expect, it } from "vitest";
import { hashAuditRecord } from "./domain/internal-auth";

describe("audit secret API health", () => {
  it("uses the managed audit secret and serves the public auth endpoint", async () => {
    expect(process.env.AUDIT_SIGNING_KEY, "AUDIT_SIGNING_KEY must be injected by managed secrets").toMatch(/^.{32,}$/);
    const signature = hashAuditRecord({ eventType: "secret_health", userId: 1, organizationId: 1, branchId: null, jurisdictionId: null, requestId: "health", createdAt: "2026-08-16T00:00:00.000Z" });
    expect(signature).toMatch(/^[a-f0-9]{64}$/);
    const response = await fetch("http://127.0.0.1:3000/api/trpc/auth.me?input=%7B%22json%22%3Anull%7D");
    expect(response.status).toBeLessThan(500);
  });
});
