import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "../routers";
import { REQUIRED_COUNTRY_PACK_DOMAINS } from "../domain/country-pack-policy";
import type { TrpcContext } from "../_core/context";

const {
  getDbMock,
  hasCurrentNdaAcceptanceMock,
  recordAuthenticationEventMock,
} = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  hasCurrentNdaAcceptanceMock: vi.fn().mockResolvedValue(true),
  recordAuthenticationEventMock: vi.fn(),
}));

vi.mock("../db", () => ({
  getDb: getDbMock,
  hasCurrentNdaAcceptance: hasCurrentNdaAcceptanceMock,
  recordAuthenticationEvent: recordAuthenticationEventMock,
}));

type TestUser = NonNullable<TrpcContext["user"]>;

const completeRules = Object.fromEntries(
  REQUIRED_COUNTRY_PACK_DOMAINS.map((domain) => [domain, true]),
);
const completeEvidence = REQUIRED_COUNTRY_PACK_DOMAINS.map(
  (ruleKey, index) => ({
    id: 10 + index,
    packId: 44,
    ruleKey,
    verificationStatus: "verified",
  }),
);
const FUTURE_REVIEW_DUE_AT = new Date("2099-01-01T00:00:00.000Z");
const staffUser: TestUser = {
  id: 81,
  openId: "compliance-contract-user",
  email: "compliance-contract@example.com",
  name: "Compliance Contract User",
  loginMethod: "manus",
  role: "manager",
  createdAt: new Date(0),
  updatedAt: new Date(0),
  lastSignedIn: new Date(0),
};

function contextFor(user: TestUser): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("regional compliance protected router contracts", () => {
  beforeEach(() => getDbMock.mockReset());

  it("denies offline replay before opening the database when device trust is missing", async () => {
    const caller = appRouter.createCaller(contextFor(staffUser));
    await expect(
      caller.erp.offlineDrafts.replay({ draftId: 7 }),
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
    expect(getDbMock).not.toHaveBeenCalled();
  });

  it("denies non-admin pack creation before opening the database", async () => {
    const caller = appRouter.createCaller(contextFor(staffUser));
    await expect(
      caller.regional.createPack({
        jurisdictionId: 7,
        packVersion: "2026.1",
        authorityName: "Authority",
        sourceUrl: "https://authority.example/rules",
        effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
        rules: { catalog: true },
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(getDbMock).not.toHaveBeenCalled();
  });

  it("denies non-admin audit-history access before opening the database", async () => {
    const caller = appRouter.createCaller(contextFor(staffUser));
    await expect(
      caller.regional.listPackAudits({ packId: 7 }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(getDbMock).not.toHaveBeenCalled();
  });

  it("runs the protected pack lifecycle through audit listing with scoped mutations", async () => {
    const admin = { ...staffUser, id: 82, role: "admin" as const };
    const profile = [{ id: 3, countryCode: "EG", active: 1 }];
    const packReview = [{
      id: 44,
      jurisdictionId: 3,
      status: "review",
      rulesJson: JSON.stringify(completeRules),
      effectiveFrom: new Date("2026-01-01"),
      reviewDueAt: FUTURE_REVIEW_DUE_AT,
    }];
    const packApproved = [{ ...packReview[0], status: "approved" }];
    const packRolledBack = [{ ...packReview[0], status: "rolled_back" }];
    const evidenceReview = [{
      id: 9,
      packId: 44,
      jurisdictionId: 3,
      status: "review",
      ruleKey: "tax",
      verificationStatus: "review",
    }];
    const audit = [{ id: 1, packId: 44, action: "approved", actorUserId: 82 }];
    let selectCall = 0;

    type QueryResult = Promise<unknown[]> & {
      limit: () => Promise<unknown[]>;
      orderBy: () => Promise<unknown[]>;
    };

    const queryResult = (rows: unknown[]): QueryResult => {
      const promise = Promise.resolve(rows) as QueryResult;
      promise.limit = async () => rows;
      promise.orderBy = async () => rows;
      return promise;
    };

    const db = {
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => {
            selectCall += 1;
            const rows =
              selectCall === 1 ? profile :
              selectCall === 2 ? packReview :
              selectCall === 3 ? evidenceReview :
              selectCall === 4 ? packReview :
              selectCall === 5 ? completeEvidence :
              selectCall === 6 ? packApproved :
              selectCall === 7 ? packRolledBack : audit;
            return queryResult(rows);
          }),
        })),
      })),
      insert: vi.fn(() => ({
        values: vi.fn(async () => [{ insertId: 44 }]),
      })),
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(async () => []),
        })),
      })),
    };

    getDbMock.mockResolvedValue(db);
    const caller = appRouter.createCaller(contextFor(admin));

    await expect(
      caller.regional.createPack({
        jurisdictionId: 3,
        packVersion: "2026.1",
        authorityName: "EDA",
        sourceUrl: "https://eda.gov.eg/rules",
        effectiveFrom: new Date("2026-01-01"),
        rules: completeRules,
      }),
    ).resolves.toMatchObject({ packId: 44 });

    await expect(
      caller.regional.addEvidence({
        jurisdictionId: 3,
        packId: 44,
        operation: "invoice",
        ruleKey: "tax",
        authorityName: "EDA",
        sourceUrl: "https://eda.gov.eg/tax",
        sourceRetrievedAt: new Date("2026-01-01"),
      }),
    ).resolves.toMatchObject({ evidenceId: 44 });

    await expect(
      caller.regional.verifyEvidence({ evidenceId: 9, decision: "verified" }),
    ).resolves.toMatchObject({ status: "verified" });

    await expect(
      caller.regional.approvePack({ packId: 44 }),
    ).resolves.toMatchObject({ status: "approved" });

    await expect(
      caller.regional.rollbackPack({ packId: 44, reason: "Policy review" }),
    ).resolves.toMatchObject({ status: "rolled_back" });

    await expect(
      caller.regional.listPackAudits({ packId: 44 }),
    ).resolves.toHaveLength(1);

    expect(db.update).toHaveBeenCalled();
    expect(db.insert).toHaveBeenCalled();
  });

  it("rejects approval for a pack missing timezone or audit coverage before mutation or audit writes", async () => {
    const admin = { ...staffUser, id: 82, role: "admin" as const };
    const rows = [
      [{
        id: 7,
        status: "review",
        jurisdictionId: 3,
        rulesJson: JSON.stringify({ ...completeRules, timezone: false }),
        effectiveFrom: new Date("2026-01-01"),
        reviewDueAt: FUTURE_REVIEW_DUE_AT,
      }],
      completeEvidence.map((item) => ({ ...item, packId: 7 })),
    ];
    const next = () => rows.shift() ?? [];
    const db = {
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => {
            const promise = Promise.resolve(next()) as Promise<unknown[]> & {
              limit: () => Promise<unknown[]>;
            };
            promise.limit = async () => next();
            return promise;
          }),
        })),
      })),
      update: vi.fn(),
      insert: vi.fn(),
    };

    getDbMock.mockResolvedValue(db);
    const caller = appRouter.createCaller(contextFor(admin));

    await expect(
      caller.regional.approvePack({ packId: 7, reason: "stale pack" }),
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
    expect(db.update).not.toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();
  });
});
