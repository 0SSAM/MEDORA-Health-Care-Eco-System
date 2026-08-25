import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("showcase account bootstrap contract", () => {
  it("creates only an isolated showcase account from the managed server secret", async () => {
    const source = await readFile(new URL("./db.ts", import.meta.url), "utf8");
    expect(source).toContain('const SHOWCASE_USERNAME = "test"');
    expect(source).toContain("process.env.SHOWCASE_TEST_PASSWORD");
    expect(source).toContain("hashInternalPassword(configuredPassword)");
    expect(source).toContain('environment: "showcase"');
    expect(source).toContain('accountType: "showcase"');
    expect(source).toContain('taxProfile: "SHOWCASE_NOT_REGULATORY"');
    expect(source).toContain('if (username !== SHOWCASE_USERNAME) return false');
  });

  it("provisions the reserved showcase account before the credential lookup", async () => {
    const source = await readFile(new URL("./routers.ts", import.meta.url), "utf8");
    expect(source.indexOf("await ensureShowcaseAccount(username)")).toBeGreaterThan(-1);
    expect(source.indexOf("await ensureShowcaseAccount(username)")).toBeLessThan(source.indexOf("getInternalCredentialByUsername(username)"));
  });

  it("does not initiate showcase login from the client without explicit form submission", async () => {
    const source = await readFile(new URL("../client/src/pages/Login.tsx", import.meta.url), "utf8");
    expect(source).toContain("internalLogin.mutate({ username, password })");
    expect(source).not.toContain('internalLogin.mutate({ username: "test"');
    expect(source).not.toContain("SHOWCASE_TEST_PASSWORD");
  });
});
