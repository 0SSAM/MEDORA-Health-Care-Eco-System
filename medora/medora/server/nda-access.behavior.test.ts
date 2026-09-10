import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getDbMock,
  getCurrentNdaAcceptanceMock,
  hasCurrentNdaAcceptanceMock,
  recordAuthenticationEventMock,
  recordNdaAcceptanceMock,
} = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  getCurrentNdaAcceptanceMock: vi.fn(),
  hasCurrentNdaAcceptanceMock: vi.fn(),
  recordAuthenticationEventMock: vi.fn(),
  recordNdaAcceptanceMock: vi.fn(),
}));

vi.mock("./db", () => ({
  getDb: getDbMock,
  getCurrentNdaAcceptance: getCurrentNdaAcceptanceMock,
  hasCurrentNdaAcceptance: hasCurrentNdaAcceptanceMock,
  recordAuthenticationEvent: recordAuthenticationEventMock,
  recordNdaAcceptance: recordNdaAcceptanceMock,
}));

import type { TrpcContext } from "./_core/context";
import { MEDORA_NDA_HASH, MEDORA_NDA_VERSION } from "./domain/nda-policy";
import { appRouter } from "./routers";

const context: TrpcContext = {
  user: {
    id: 991,
    openId: "nda-unaccepted-user",
    email: "nda-unaccepted@example.com",
    name: "NDA Unaccepted User",
    loginMethod: "internal",
    role: "manager",
    createdAt: new Date(0),
    updatedAt: new Date(0),
    lastSignedIn: new Date(0),
  },
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
  internalSession: {
    session: { organizationId: 7, branchId: 11, jurisdictionId: 0 } as never,
    user: undefined as never,
  },
};

describe("MEDORA NDA behavioral access boundary", () => {
  beforeEach(() => {
    getDbMock.mockReset();
    getCurrentNdaAcceptanceMock.mockReset();
    hasCurrentNdaAcceptanceMock.mockReset();
    recordAuthenticationEventMock.mockReset();
    recordNdaAcceptanceMock.mockReset();
    hasCurrentNdaAcceptanceMock.mockResolvedValue(false);
    getCurrentNdaAcceptanceMock.mockResolvedValue(undefined);
    recordAuthenticationEventMock.mockResolvedValue(undefined);
  });

  it("rejects an unaccepted user before the protected procedure reaches its domain database work", async () => {
    const caller = appRouter.createCaller(context);

    await expect(caller.kpi.listRoleTemplates({ organizationId: 7, branchId: 11, jurisdictionId: 0 }))
      .rejects.toMatchObject({ code: "FORBIDDEN", message: "NDA_ACCEPTANCE_REQUIRED" });

    expect(hasCurrentNdaAcceptanceMock).toHaveBeenCalledWith(context.user!.id, MEDORA_NDA_VERSION, MEDORA_NDA_HASH);
    expect(getDbMock).not.toHaveBeenCalled();
  });

  it("allows the authenticated status endpoint before acceptance and refuses a stale document without recording it", async () => {
    const caller = appRouter.createCaller(context);

    await expect(caller.nda.status()).resolves.toMatchObject({
      accepted: false,
      document: { version: MEDORA_NDA_VERSION, hash: MEDORA_NDA_HASH },
    });
    await expect(caller.nda.accept({
      version: "2026-01-01",
      hash: MEDORA_NDA_HASH,
      locale: "en",
      surface: "web",
      confirmed: true,
    })).rejects.toMatchObject({ code: "BAD_REQUEST", message: "NDA_DOCUMENT_VERSION_MISMATCH" });

    expect(recordNdaAcceptanceMock).not.toHaveBeenCalled();
    expect(getDbMock).not.toHaveBeenCalled();
  });

  it("records an explicit first acceptance only for the authenticated user and current document", async () => {
    recordNdaAcceptanceMock.mockResolvedValue({ id: 1 });
    const caller = appRouter.createCaller(context);

    await expect(caller.nda.accept({
      version: MEDORA_NDA_VERSION,
      hash: MEDORA_NDA_HASH,
      locale: "ar",
      surface: "mobile_webview",
      confirmed: true,
    })).resolves.toMatchObject({ accepted: true });

    expect(recordNdaAcceptanceMock).toHaveBeenCalledWith(expect.objectContaining({
      userId: context.user!.id,
      documentVersion: MEDORA_NDA_VERSION,
      documentHash: MEDORA_NDA_HASH,
      locale: "ar",
      declaredSurface: "mobile_webview",
    }));
    expect(getDbMock).not.toHaveBeenCalled();
  });

  it("does not allow an unaccepted caller to use a different organization input as a protected-data bypass", async () => {
    const caller = appRouter.createCaller(context);

    await expect(caller.kpi.listRoleTemplates({ organizationId: 999, branchId: 1, jurisdictionId: 0 }))
      .rejects.toMatchObject({ code: "FORBIDDEN", message: "NDA_ACCEPTANCE_REQUIRED" });

    expect(hasCurrentNdaAcceptanceMock).toHaveBeenCalledWith(context.user!.id, MEDORA_NDA_VERSION, MEDORA_NDA_HASH);
    expect(getDbMock).not.toHaveBeenCalled();
  });
});
