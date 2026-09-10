import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("sync tenant-scope contract", () => {
  const source = readFileSync(resolve(process.cwd(), "server/routers/sync.ts"), "utf8");

  it("requires organization scope and active membership for every sync surface", () => {
    expect(source).toContain("organizationId: z.number().int().positive()" );
    expect(source).toContain("assertOrganizationMember(db, ctx.user.id, input.organizationId)" );
    expect(source).toContain("WHERE organization_id=${input.organizationId}" );
    expect(source).toContain("INSERT INTO sync_outbox (organization_id" );
    expect(source).toContain("sync_meta_v2" );
  });

  it("never exposes the legacy global outbox/meta queries", () => {
    expect(source).not.toContain("FROM sync_outbox WHERE ts >" );
    expect(source).not.toContain("FROM sync_meta ORDER BY updated_at" );
    expect(source).not.toContain("INSERT INTO sync_meta (device_id" );
  });
});
