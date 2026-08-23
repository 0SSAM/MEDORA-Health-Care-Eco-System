import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("MEDORA NDA access-gate contract", () => {
  it("keeps the only pre-acceptance API surface limited to signed-in status and explicit acceptance", () => {
    const router = read("server/routers/nda.ts");
    expect(router).toContain("status: authenticatedProcedure.query");
    expect(router).toContain("accept: authenticatedProcedure.input");
    expect(router).toContain("confirmed: z.literal(true)");
    expect(router).toContain("NDA_DOCUMENT_VERSION_MISMATCH");
  });

  it("blocks protected and admin data procedures until both the current NDA version and hash are accepted", () => {
    const trpc = read("server/_core/trpc.ts");
    expect(trpc).toContain("MEDORA_NDA_HASH, MEDORA_NDA_VERSION");
    expect(trpc).toContain("hasCurrentNdaAcceptance(user.id, MEDORA_NDA_VERSION, MEDORA_NDA_HASH)");
    expect(trpc).toContain("export const protectedProcedure = authenticatedProcedure.use(requireCurrentNda)");
    expect(trpc).toContain(").use(requireCurrentNda).use(blockShowcaseMutations)");
  });

  it("places the access gate above workspace routes and preserves an explicit refusal path", () => {
    const app = read("client/src/App.tsx");
    const gate = read("client/src/components/NdaAccessGate.tsx");
    const trpc = read("server/_core/trpc.ts");
    expect(app).toContain("NdaAccessGate");
    expect(trpc).toContain("NDA_ACCEPTANCE_REQUIRED");
    expect(gate).toContain("تسجيل الخروج");
    expect(gate).toContain("Decline and sign out");
    expect(gate).toContain("await logout()");
    expect(gate).toContain('window.location.assign("/login")');
  });

  it("does not bootstrap branch or session workspace context before the server confirms acceptance", () => {
    const localization = read("client/src/contexts/LocalizationContext.tsx");
    expect(localization).toContain("const ndaStatusQuery = trpc.nda.status.useQuery");
    expect(localization).toContain("const hasAcceptedCurrentNda = ndaStatusQuery.data?.accepted === true");
    expect(localization).toContain("enabled: Boolean(user) && hasAcceptedCurrentNda");
  });

  it("keeps the agreement card, consent text, and decision buttons within a narrow mobile viewport", () => {
    const gate = read("client/src/components/NdaAccessGate.tsx");
    expect(gate).toContain("w-full min-w-0 max-w-full");
    expect(gate).toContain("overflow-x-hidden");
    expect(gate).toContain("[overflow-wrap:anywhere]");
    expect(gate).toContain("w-full whitespace-normal");
  });
});
