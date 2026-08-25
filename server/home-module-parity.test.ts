import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

describe("Home module parity", () => {
  it("routes core modules to their respective workspaces", () => {
    const requiredRoutes = [
      { id: "inventory", components: ["InventoryTransferWorkspace", "InventoryAdjustmentWorkspace"] },
      { id: "finance", components: ["FinanceWorkspace", "ReportsWorkspace", "MiscellaneousExpenseWorkspace"] },
      { id: "hr", components: ["OrganizationWorkspace", "OperationsManagementWorkspace"] },
      { id: "crm", components: ['section="crm"'] },
      { id: "procurement", components: ['section="procurement"'] },
      { id: "employeeDashboard", components: ["EmployeeDashboard"] },
    ];

    for (const route of requiredRoutes) {
      expect(homeSource, `missing routing for ${route.id}`).toContain(`if (active === "${route.id}") return`);
      for (const component of route.components) {
        expect(homeSource, `missing component ${component} for ${route.id}`).toContain(component);
      }
    }
  });

  it("ensures no duplicate module IDs in the catalog", () => {
    const matches = [...homeSource.matchAll(/\{ id: "([A-Za-z0-9]+)", label:/g)];
    const ids = matches.map((match) => match[1]);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    expect(duplicates, `duplicate module IDs found: ${duplicates.join(", ")}`).toHaveLength(0);
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

  it("verifies all catalog modules have a defined workspace panel or route", () => {
    const catalogIds = [...homeSource.matchAll(/\{ id: "([A-Za-z0-9]+)", label:/g)].map((match) => match[1]);
    for (const id of catalogIds) {
      if (id === "overview") continue;
      const hasPanelEntry = homeSource.includes(`${id}: { title:`);
      const hasRoute = homeSource.includes(`if (active === "${id}") return`);
      expect(hasPanelEntry || hasRoute, `module ${id} has neither a panel entry nor a route`).toBe(true);
    }
  });
});
