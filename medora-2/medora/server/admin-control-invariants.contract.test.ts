import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const adminConsole = readFileSync(join(root, "client/src/pages/AdminConsole.tsx"), "utf8");
const rbac = readFileSync(join(root, "server/routers/rbac.ts"), "utf8");
const adminAccount = readFileSync(join(root, "server/routers/adminAccount.ts"), "utf8");

const sourceSlice = (source: string, start: string, end: string) => {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  expect(from).toBeGreaterThanOrEqual(0);
  expect(to).toBeGreaterThan(from);
  return source.slice(from, to);
};

describe("platform-admin control invariants", () => {
  it("keeps the user-control console restricted to the platform admin", () => {
    expect(adminConsole).toContain('user.role !== "admin"');
    expect(adminConsole).toContain("Platform Admin Only");
    expect(adminConsole).toContain("الادمن فقط");
  });

  it("keeps the platform admin represented as a super permission set", () => {
    expect(rbac).toContain('if (user.role === "admin") return { codes: ["*"], isSuper: true }');
  });

  it("keeps admin self-account mutations behind an explicit admin-only guard", () => {
    expect(adminAccount).toContain('ctx.user.role !== "admin"');
    expect(adminAccount).toContain("requireAdminSession");
    expect(adminAccount).toContain("changeUsername");
    expect(adminAccount).toContain("changePassword");
  });

  it("does not allow the normal employee console to create an org_admin", () => {
    const organizations = readFileSync(join(root, "server/routers/organizations.ts"), "utf8");
    const createSlice = sourceSlice(organizations, "createEmployee:", "updateEmployee:");
    expect(createSlice).toContain('input.organizationRole === "org_admin"');
    expect(createSlice).toContain("Only platform administration can create organization administrators");
  });
});
