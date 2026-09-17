import { afterEach, describe, expect, it, vi } from "vitest";

const { notifyOwnerMock } = vi.hoisted(() => ({ notifyOwnerMock: vi.fn() }));

vi.mock("./_core/env", () => ({
  ENV: { reportMailApiKey: "test-report-key", reportMailFrom: "MEDORA <reports@example.com>" },
}));
vi.mock("./_core/notification", () => ({ notifyOwner: notifyOwnerMock }));

import { recordEmailDelivery } from "./scheduled/reports";

const definition = {
  id: 81,
  organizationId: 10,
  jurisdictionId: 0,
  name: "Daily sales",
  recipientUserId: 143,
  recipientRole: "operations_manager",
  deliveryEnabled: 1,
} as any;

function deliveryDb() {
  const deliveryValues = vi.fn().mockResolvedValue([]);
  const insert = vi.fn(() => ({ values: deliveryValues }));
  const recipientLimit = vi.fn().mockResolvedValue([{ email: "authorized.recipient@example.com" }]);
  const select = vi.fn(() => ({
    from: vi.fn(() => ({
      innerJoin: vi.fn(() => ({
        where: vi.fn(() => ({ limit: recipientLimit })),
      })),
    })),
  }));
  return { db: { select, insert }, deliveryValues };
}

describe("scheduled report email delivery", () => {
  const fetchMock = vi.fn();

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("sends an aggregate report only to the eligible recipient and writes a delivered audit attempt", async () => {
    const { db, deliveryValues } = deliveryDb();
    fetchMock.mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await expect(recordEmailDelivery(db as any, definition, 901, { salesCount: 4, totalAmount: 120 }, new Date("2026-08-18T00:00:00.000Z"), new Date("2026-08-19T00:00:00.000Z"))).resolves.toEqual({ status: "delivered" });

    expect(fetchMock).toHaveBeenCalledWith("https://api.resend.com/emails", expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({ "Idempotency-Key": "medora-report-81-901" }),
    }));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ to: ["authorized.recipient@example.com"], subject: "MEDORA report ready: Daily sales" });
    expect(deliveryValues).toHaveBeenCalledWith(expect.objectContaining({ status: "delivered", channel: "email", recipientUserId: 143 }));
  });

  it("records a bounded delivery failure and returns a safe result without rethrowing to the scheduler", async () => {
    const { db, deliveryValues } = deliveryDb();
    fetchMock.mockResolvedValue({ ok: false, status: 502 });
    notifyOwnerMock.mockResolvedValue(false);
    vi.stubGlobal("fetch", fetchMock);

    await expect(recordEmailDelivery(db as any, definition, 902, { salesCount: 4 }, new Date("2026-08-18T00:00:00.000Z"), new Date("2026-08-19T00:00:00.000Z"))).resolves.toEqual({ status: "failed", reason: "email_delivery_failed" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(deliveryValues).toHaveBeenCalledWith(expect.objectContaining({ status: "failed", errorCode: "EMAIL_DELIVERY_FAILED", channel: "email" }));
    expect(notifyOwnerMock).toHaveBeenCalledWith(expect.objectContaining({ title: "MEDORA scheduled report delivery failed" }));
  });
});
