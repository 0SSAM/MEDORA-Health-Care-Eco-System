import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("showcase account bootstrap contract", () => {
  it("creates only fixed, isolated showcase identities from the managed server secret", async () => {
    const source = await readFile(new URL("./db.ts", import.meta.url), "utf8");
    expect(source).toContain("const SHOWCASE_IDENTITIES = [");
    expect(source).toContain('username: "test"');
    expect(source).toContain('openId: "medora-showcase-manager-v1"');
    expect(source).toContain('role: "manager" as const');
    expect(source).toContain('organizationRole: "org_admin" as const');
    expect(source).toContain('username: "pharmacist.demo"');
    expect(source).toContain('username: "cashier.demo"');
    expect(source).toContain('role: "pharmacist" as const');
    expect(source).toContain('role: "cashier" as const');
    expect(source).toContain('const identity = SHOWCASE_IDENTITIES.find(item => item.username === username)');
    expect(source).toContain("if (!identity) return false");
    expect(source).toContain("process.env.SHOWCASE_TEST_PASSWORD");
    expect(source).toContain("hashInternalPassword(configuredPassword)");
    expect(source).toContain('environment: "showcase"');
    expect(source).toContain('accountType: "showcase"');
    expect(source).toContain("taxProfile: SHOWCASE_TAX_PROFILE");
    expect(source).toContain("organizationRole: identity.organizationRole");
  });

  it("seeds database-backed synthetic inventory only inside showcase organizations", async () => {
    const source = await readFile(new URL("./db.ts", import.meta.url), "utf8");
    expect(source).toContain("seedShowcaseDemoData");
    expect(source).toContain('organization.environment !== "showcase"');
    expect(source).toContain('DEMO-PARACETAMOL-500');
    expect(source).toContain('بيانات تجريبية');
    expect(source).toContain("inventoryBatches");
    expect(source).toContain("Demo data is restricted to showcase organizations");
  });

  it("runs Demo seeding only after the authenticated showcase scope is resolved", async () => {
    const source = await readFile(new URL("./routers.ts", import.meta.url), "utf8");
    const scopeIndex = source.indexOf("const scope = await getInternalScopeForUser(credential.userId)");
    const seedIndex = source.indexOf("await seedShowcaseDemoData");
    expect(scopeIndex).toBeGreaterThan(-1);
    expect(seedIndex).toBeGreaterThan(scopeIndex);
    expect(source).toContain('credential.accountType === "showcase" && scope');
  });

  it("does not turn an optional fixture bootstrap failure into a login failure", async () => {
    const source = await readFile(new URL("./routers.ts", import.meta.url), "utf8");
    const seedBlock = source.slice(source.indexOf("if (credential.accountType === \"showcase\" && scope)"), source.indexOf("if (!scope)", source.indexOf("if (credential.accountType === \"showcase\" && scope)")));
    expect(seedBlock).toContain("try {");
    expect(seedBlock).toContain("catch (error)");
    expect(seedBlock).toContain("showcase fixture bootstrap deferred");
    expect(source.indexOf("await createInternalSession")).toBeGreaterThan(source.indexOf("showcase fixture bootstrap deferred"));
  });

  it("derives the visible Demo account type from the persisted session mode", async () => {
    const source = await readFile(new URL("./routers.ts", import.meta.url), "utf8");
    expect(source).toContain('ctx.internalSession?.session.sessionMode === "showcase"');
    expect(source).not.toContain('openId === "showcase-test-user"');
  });

  it("provisions the reserved showcase account before the credential lookup", async () => {
    const source = await readFile(new URL("./routers.ts", import.meta.url), "utf8");
    expect(source.indexOf("await ensureShowcaseAccount(username)")).toBeGreaterThan(-1);
    expect(source.indexOf("await ensureShowcaseAccount(username)")).toBeLessThan(source.indexOf("getInternalCredentialByUsername(username)"));
  });

  it("returns an application role separately from the scoped organization role", async () => {
    const source = await readFile(new URL("./routers.ts", import.meta.url), "utf8");
    expect(source).toContain("getUserById");
    expect(source).toContain("const applicationRole = authenticatedUser.role");
    expect(source).toContain("role: applicationRole");
    expect(source).toContain("organizationRole: scope.role");
  });

  it("keeps Test out of the global application-admin role while granting the showcase organization role", async () => {
    const source = await readFile(new URL("./db.ts", import.meta.url), "utf8");
    const identityBlock = source.slice(source.indexOf('username: "test"'), source.indexOf('username: "pharmacist.demo"'));
    expect(identityBlock).toContain('role: "manager" as const');
    expect(identityBlock).toContain('organizationRole: "org_admin" as const');
    expect(identityBlock).not.toContain('role: "admin" as const');
  });

  it("does not initiate showcase login from the client without explicit form submission", async () => {
    const source = await readFile(new URL("../client/src/pages/Login.tsx", import.meta.url), "utf8");
    expect(source).toContain("internalLogin.mutate({ username, password })");
    expect(source).not.toContain('internalLogin.mutate({ username: "test"');
    expect(source).not.toContain("SHOWCASE_TEST_PASSWORD");
  });
});
