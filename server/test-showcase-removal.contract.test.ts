import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectFile = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

const appSource = projectFile("client/src/App.tsx");
const homeSource = projectFile("client/src/pages/Home.tsx");
const posSource = projectFile("client/src/components/PointOfSaleWorkspace.tsx");
const dbSource = projectFile("server/db.ts");
const routerSource = projectFile("server/routers.ts");
const erpSource = projectFile("server/routers/erp.ts");
const organizationSource = projectFile("server/routers/organizations.ts");
const trpcSource = projectFile("server/_core/trpc.ts");
const schemaSource = projectFile("drizzle/schema.ts");
const testSetupSource = projectFile("server/test.setup.ts");
const ciSource = projectFile(".github/workflows/ci.yml");

describe("retired Test account and isolated-workspace removal contract", () => {
  it("does not retain a runnable Test/showcase bootstrap, session-mode, or POS path", () => {
    const runtimeSources = [dbSource, routerSource, erpSource, homeSource, posSource];

    for (const source of runtimeSources) {
      expect(source).not.toMatch(
        /ensureShowcaseAccount|seedShowcaseDemoData|switchInternalSessionMode|sessionModes|commitShowcaseSale|demoCatalog|demoTrialInvoices|DemoExperienceWorkspace/iu,
      );
    }

    expect(routerSource).not.toMatch(/sessionMode|showcase/iu);
    expect(erpSource).not.toMatch(/sessionMode|showcase/iu);
    expect(homeSource).not.toMatch(/sessionMode|showcase/iu);
    expect(posSource).not.toMatch(/sessionMode|showcase/iu);
  });

  it("removes the retired identity from executable configuration and schema contracts", () => {
    for (const source of [dbSource, routerSource, schemaSource, testSetupSource, ciSource]) {
      expect(source).not.toMatch(
        /SHOWCASE_TEST_PASSWORD|medora-showcase|pharmacist\.demo|cashier\.demo/iu,
      );
    }

    expect(schemaSource).not.toMatch(/environment\("environment"\)|accountType\("accountType"\)|sessionMode\("sessionMode"\)|showcase_mutation_simulated/iu);
  });

  it("keeps the supported MEDORA surface and standard fail-closed guards", () => {
    for (const route of [
      "/login",
      "/workspace",
      "/sales",
      "/pos",
      "/operations",
      "/finance",
      "/admin",
    ]) {
      expect(appSource).toContain(`path={"${route}"}`);
    }

    expect(appSource).toContain("<NdaAccessGate><Router /></NdaAccessGate>");
    expect(trpcSource).toContain('throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG })');
    expect(trpcSource).toContain("hasCurrentNdaAcceptance");
    expect(trpcSource).toContain("export const protectedProcedure");
    expect(routerSource).toContain("internalLogin:");
    expect(routerSource).toContain("getInternalCredentialByUsername");
    expect(dbSource).toContain("eq(organizationMemberships.active, 1)");
    expect(dbSource).toContain("eq(branches.active, 1)");
    expect(dbSource).toContain("eq(branchUsers.active, 1)");
    expect(dbSource).toContain("eq(branchJurisdictions.jurisdictionId, internalSessions.jurisdictionId)");
    expect(organizationSource).toMatch(
      /organizationId:\s*z\.number\(\)\.int\(\)\.positive\(\).*branchId:\s*z\.number\(\)\.int\(\)\.positive\(\).*jurisdictionId:\s*z\.number\(\)\.int\(\)\.positive\(\)/u,
    );
  });
});
