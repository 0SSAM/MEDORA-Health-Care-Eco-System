import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

const { getDbMock, hasCurrentNdaAcceptanceMock, recordAuthenticationEventMock } = vi.hoisted(() => ({ getDbMock: vi.fn(), hasCurrentNdaAcceptanceMock: vi.fn().mockResolvedValue(true), recordAuthenticationEventMock: vi.fn() }));
vi.mock("../db", () => ({ getDb: getDbMock, hasCurrentNdaAcceptance: hasCurrentNdaAcceptanceMock, recordAuthenticationEvent: recordAuthenticationEventMock }));
vi.mock("../storage", () => ({ storagePut: vi.fn(), storageGetSignedUrl: vi.fn() }));

type TestUser = NonNullable<TrpcContext["user"]>;

const user: TestUser = {
  id: 81,
  openId: "prescription-country-contract-user",
  email: "prescription@example.com",
  name: "Prescription Contract User",
  loginMethod: "manus",
  role: "pharmacist",
  createdAt: new Date(0),
  updatedAt: new Date(0),
  lastSignedIn: new Date(0),
};

function contextFor(): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function queuedDb(results: unknown[][]) {
  const queue = [...results];
  return {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => {
          const rows = [...(queue.shift() ?? [])] as unknown[] & { limit?: () => Promise<unknown[]> };
          rows.limit = async () => rows;
          return rows;
        }),
      })),
    })),
  };
}

describe("prescription country router contracts", () => {
  beforeEach(() => getDbMock.mockReset());

  it("rejects a pharmacist whose assigned branch has no matching jurisdiction membership before storage", async () => {
    getDbMock.mockResolvedValue(
      queuedDb([
        [{ branchId: 9, jurisdictionId: 2, active: 1 }],
        [{ branchId: 9 }],
        [{ branchId: 9 }],
        [],
      ]),
    );

    const caller = appRouter.createCaller(contextFor());
    await expect(
      caller.erp.prescription.upload({
        branchId: 9,
        fileName: "prescription.png",
        mimeType: "image/png",
        dataUrl: "data:image/png;base64,AA==",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
