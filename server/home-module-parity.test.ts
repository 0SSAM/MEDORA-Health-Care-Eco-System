import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

describe("Home module parity", () => {
  it("routes inventory to the operational supply-chain workspace", () => {
    expect(homeSource).toContain('if (active === "inventory") return <SupplyChainWorkspace');
  });

  it("keeps organization module ids represented in the module catalog", () => {
    const catalogIds = new Set(
      [...homeSource.matchAll(/\{ id: "([A-Za-z0-9]+)", label:/g)].map((match) => match[1]),
    );
    const organizationModulesBlock = homeSource.match(
      /const organizationModules: Record<string, string\[\]> = (.*?);\s*const coreShortcuts/s,
    )?.[1];

    expect(organizationModulesBlock).toBeTruthy();
    const organizationModuleIds = new Set(
      [...(organizationModulesBlock ?? "").matchAll(/"([A-Za-z0-9]+)"/g)].map((match) => match[1]),
    );

    for (const moduleId of organizationModuleIds) {
      expect(catalogIds, `missing module catalog entry for ${moduleId}`).toContain(moduleId);
    }
  });
});
