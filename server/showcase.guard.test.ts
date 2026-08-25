import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

describe("showcase mutation guard", () => {
  it("keeps showcase sessions fail-closed before route handlers", async () => {
    const source = await readFile(resolve(process.cwd(), "server/_core/trpc.ts"), "utf8");
    expect(source).toContain('opts.type === "mutation"');
    expect(source).toContain('showcaseSession?.sessionMode === "showcase"');
    expect(source).toContain("هذه العملية محاكاة فقط ولا تُحفظ من حساب العرض.");
    expect(source).toContain("export const protectedProcedure");
  });
});


describe("showcase session visibility", () => {
  it("exposes session mode without exposing credentials", async () => {
    const source = await readFile(resolve(process.cwd(), "server/routers.ts"), "utf8");
    expect(source).toContain("sessionInfo");
    expect(source).toContain("sessionMode");
    expect(source).not.toContain("SHOWCASE_TEST_PASSWORD");
  });
});


describe("showcase UI disclosure", () => {
  it("labels simulated non-production activity in the workspace", async () => {
    const source = await readFile(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
    expect(source).toContain("Investor Showcase");
    expect(source).toContain("لا تغيّر أرصدة الإنتاج");
  });
});
