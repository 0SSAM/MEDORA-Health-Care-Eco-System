import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectFile = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const appSource = projectFile("client/src/App.tsx");
const demoSource = projectFile("client/src/pages/DemoWorkspace.tsx");
const welcomeSource = projectFile("client/src/pages/Welcome.tsx");
const dbSource = projectFile("server/db.ts");
const routerSource = projectFile("server/routers.ts");
const trpcSource = projectFile("server/_core/trpc.ts");

describe("anonymous visitor sandbox contract", () => {
  it("provides a public demo route without creating a production identity", () => {
    expect(appSource).toContain('path={"/demo"} component={DemoWorkspace}');
    expect(appSource).toContain("isPublicSurface");
    expect(appSource).toContain("NdaAccessGate");
    expect(demoSource).toContain('const STORAGE_KEY = "medora-demo-sandbox-v1"');
    expect(demoSource).toContain("sessionStorage.getItem(STORAGE_KEY)");
    expect(demoSource).toContain("sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))");
    expect(demoSource).toContain("sessionStorage.removeItem(STORAGE_KEY)");
    expect(demoSource).toContain("Anonymous Admin Sandbox");
    expect(demoSource).toContain("No username");
    expect(demoSource).toContain("No password");
  });

  it("keeps the visitor surface explicitly separated from production authentication", () => {
    expect(welcomeSource).toContain("Public preview must stay independent of production auth/tRPC APIs.");
    expect(welcomeSource).not.toContain("useAuth");
    expect(demoSource).not.toContain("SHOWCASE_TEST_PASSWORD");
    expect(demoSource).not.toContain("DATABASE_URL");
    expect(dbSource).not.toMatch(/ensureShowcaseAccount|seedShowcaseDemoData|medora-showcase|pharmacist\.demo|cashier\.demo/iu);
    expect(routerSource).not.toMatch(/ensureShowcaseAccount|seedShowcaseDemoData|medora-showcase|pharmacist\.demo|cashier\.demo/iu);
  });

  it("preserves fail-closed production authentication and authorization", () => {
    expect(trpcSource).toContain('throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG })');
    expect(trpcSource).toContain("hasCurrentNdaAcceptance");
    expect(trpcSource).toContain("export const protectedProcedure");
    expect(routerSource).toContain("internalLogin:");
    expect(routerSource).toContain("getInternalCredentialByUsername");
  });
});
