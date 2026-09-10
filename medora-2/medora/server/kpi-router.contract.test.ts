import { beforeEach, describe, expect, it, vi } from "vitest";

const { hasCurrentNdaAcceptanceMock, recordAuthenticationEventMock } = vi.hoisted(() => ({
  hasCurrentNdaAcceptanceMock: vi.fn(),
  recordAuthenticationEventMock: vi.fn(),
}));

vi.mock("./db", () => ({
  hasCurrentNdaAcceptance: hasCurrentNdaAcceptanceMock,
  recordAuthenticationEvent: recordAuthenticationEventMock,
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function contextForScope(scope: { organizationId: number; branchId: number; jurisdictionId: number }): TrpcContext {
  return {
    user: { id: 901, openId: "kpi-scope-user", email: "kpi@example.com", name: "KPI Scope User", loginMethod: "internal", role: "manager", createdAt: new Date(0), updatedAt: new Date(0), lastSignedIn: new Date(0) },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
    internalSession: { session: { ...scope } as never, user: undefined as never },
  };
}

describe("KPI role template router contract", () => {
  beforeEach(() => {
    hasCurrentNdaAcceptanceMock.mockResolvedValue(true);
    recordAuthenticationEventMock.mockResolvedValue(undefined);
  });

  it("returns the three bilingual templates only for the matching session scope", async () => {
    const scope = { organizationId: 7, branchId: 11, jurisdictionId: 0 };
    const result = await appRouter.createCaller(contextForScope(scope)).kpi.listRoleTemplates(scope);
    expect(result.scope).toEqual(scope);
    expect(result.templates.map(template => template.role)).toEqual(["doctor", "customer_service", "warehouse_manager"]);
    expect(result.applyMode).toBe("preview-and-human-approval");
  });

  it("rejects a mismatched organization, branch, or jurisdiction before returning templates", async () => {
    const sessionScope = { organizationId: 7, branchId: 11, jurisdictionId: 0 };
    const caller = appRouter.createCaller(contextForScope(sessionScope));
    await expect(caller.kpi.previewRoleTemplate({ organizationId: 8, branchId: 11, jurisdictionId: 0, role: "doctor" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.kpi.previewRoleTemplate({ organizationId: 7, branchId: 12, jurisdictionId: 0, role: "customer_service" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.kpi.previewRoleTemplate({ organizationId: 7, branchId: 11, jurisdictionId: 3, role: "warehouse_manager" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
