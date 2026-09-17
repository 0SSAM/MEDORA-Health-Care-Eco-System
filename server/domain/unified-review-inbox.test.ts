import { describe, expect, it } from "vitest";
import { buildUnifiedReviewInbox, makeReviewInboxItem } from "./unified-review-inbox";

describe("unified review inbox policy", () => {
  it("orders newest items deterministically without carrying sensitive workflow fields", () => {
    const earlier = makeReviewInboxItem({ source: "other_expense", recordId: 9, status: "pending_review", createdAt: new Date("2026-08-10T09:00:00.000Z") });
    const later = makeReviewInboxItem({ source: "cash_closure", recordId: 3, status: "submitted", createdAt: new Date("2026-08-11T09:00:00.000Z") });

    const result = buildUnifiedReviewInbox([earlier, later], 50);

    expect(result.items).toEqual([later, earlier]);
    expect(result.counts).toMatchObject({ cash_closure: 1, other_expense: 1, procurement_request: 0, leave_request: 0, inter_branch_transfer: 0 });
    expect(result.items[0]).not.toHaveProperty("title");
    expect(result.items[0]).not.toHaveProperty("amount");
    expect(result.items[0]).not.toHaveProperty("justification");
  });

  it("caps the display list but keeps source counts based on the authorized query result", () => {
    const items = [1, 2, 3].map(recordId => makeReviewInboxItem({ source: "procurement_request", recordId, status: "submitted", createdAt: new Date(`2026-08-1${recordId}T09:00:00.000Z`) }));
    const result = buildUnifiedReviewInbox(items, 2);

    expect(result.items.map(item => item.recordId)).toEqual([3, 2]);
    expect(result.totalCount).toBe(3);
    expect(result.counts.procurement_request).toBe(3);
  });
});
