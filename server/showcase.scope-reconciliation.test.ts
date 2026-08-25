import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) => readFile(resolve(process.cwd(), relativePath), "utf8");

describe("internal scope isolation", () => {
  it("resolves scope only through active membership, branch, and jurisdiction joins", async () => {
    const source = await read("server/db.ts");
    expect(source).toContain("export async function getInternalScopeForUser");
    expect(source).toContain("innerJoin(branchUsers");
    expect(source).toContain("innerJoin(branches");
    expect(source).toContain("innerJoin(branchJurisdictions");
    expect(source).toContain("eq(organizationMemberships.active, 1)");
    expect(source).toContain("eq(branchUsers.active, 1)");
    expect(source).toContain("eq(branches.active, 1)");
    expect(source).toContain("organizationId: organizationMemberships.organizationId");
  });

  it("creates sessions with explicit organization, branch, jurisdiction, role, and mode", async () => {
    const source = await read("server/db.ts");
    expect(source).toContain("export async function createInternalSession");
    expect(source).toContain("organizationId: number");
    expect(source).toContain("branchId: number");
    expect(source).toContain("jurisdictionId: number");
    expect(source).toContain('sessionMode?: "production" | "showcase"');
  });

  it("revalidates active scope and organization state when reading a session", async () => {
    const source = await read("server/db.ts");
    expect(source).toContain("export async function getInternalSession");
    expect(source).toContain("eq(organizations.status, \"active\")");
    expect(source).toContain("eq(organizationMemberships.active, 1)");
    expect(source).toContain("eq(branches.active, 1)");
    expect(source).toContain("eq(branchUsers.active, 1)");
    expect(source).toContain("isNull(internalSessions.revokedAt)");
  });
});
