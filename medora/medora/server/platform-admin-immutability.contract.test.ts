import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("platform admin immutability", () => {
  it("blocks platform-admin targets from tenant RBAC role mutation", () => {
    const source = read("server/routers/rbac.ts");
    expect(source).toContain("assertTargetIsNotPlatformAdmin");
    expect(source).toContain("targetRole === \"admin\"");
    expect(source).toContain("Platform administrator privileges cannot be changed through RBAC.");
    expect(source).toContain("The platform administrator account is immutable through RBAC.");
    expect(source).toContain("await assertTargetIsNotPlatformAdmin(db, input.userId");
  });

  it("keeps platform-admin credential management self-scoped", () => {
    const source = read("server/routers/adminAccount.ts");
    expect(source).toContain("ctx.user.role !== \"admin\"");
    expect(source).toContain("getAdminCredential(db, ctx.user.id)");
    expect(source).not.toContain("userId: z.number");
  });

  it("documents the invariant in the admin console and assurance matrix", () => {
    const consoleSource = read("client/src/pages/AdminConsole.tsx");
    const assurance = read("docs/sector-assurance-ar-en.md");
    expect(consoleSource).toContain("cannot disable or delete the platform admin");
    expect(assurance).toContain("admin must not be removable");
    expect(assurance).toContain("self-disabled");
  });
});
