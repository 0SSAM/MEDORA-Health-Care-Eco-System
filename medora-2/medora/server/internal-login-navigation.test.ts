import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("internal login navigation contract", () => {
  it("routes successful employee login to the authenticated landing workspace", () => {
    const loginSource = readFileSync(resolve(process.cwd(), "client/src/pages/Login.tsx"), "utf8");
    expect(loginSource).toContain("resetIdentityBoundClientState(queryClient);");
    expect(loginSource).toContain('window.location.assign("/workspace");');
    expect(loginSource).toContain("فتح مساحة العمل");
    expect(loginSource).toContain("أنت مسجل الدخول بالفعل");
  });
});

// This test intentionally checks the route contract at the source boundary because the
// page mutation is backed by generated tRPC hooks and is not rendered in the Node suite.
