import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(import.meta.dirname, "LocalizationContext.tsx"), "utf8");

describe("workspace scope bootstrap contract", () => {
  it("uses the server-authorized branch registry only after current NDA acceptance", () => {
    expect(source).toContain("const ndaStatusQuery = trpc.nda.status.useQuery");
    expect(source).toContain("const hasAcceptedCurrentNda = ndaStatusQuery.data?.accepted === true");
    expect(source).toContain("enabled: Boolean(user) && hasAcceptedCurrentNda");
    expect(source).toContain("branchRegistry.refetch()");
  });

  it("does not create a client-side fallback scope or retain session-mode switching", () => {
    expect(source).toContain("const confirmedBranch = branches.length ?");
    expect(source).toContain(': "branch_missing"');
    expect(source).toContain("value > 0");
    expect(source).not.toMatch(/sessionMode|sessionModes|switchSessionMode|showcase/iu);
  });
});
