export const REVIEW_INBOX_SOURCES = ["procurement_request", "leave_request", "cash_closure", "other_expense", "inter_branch_transfer"] as const;
export type ReviewInboxSource = typeof REVIEW_INBOX_SOURCES[number];

export type ReviewInboxItem = {
  key: `${ReviewInboxSource}:${number}`;
  source: ReviewInboxSource;
  sourceLabel: string;
  recordId: number;
  status: "submitted" | "pending_review";
  createdAt: Date;
};

const sourceLabels: Record<ReviewInboxSource, string> = {
  procurement_request: "طلب شراء",
  leave_request: "طلب إجازة",
  cash_closure: "إقفال نقدي",
  other_expense: "مصروف آخر",
  inter_branch_transfer: "تحويل بين الفروع",
};

const sourceRank: Record<ReviewInboxSource, number> = {
  cash_closure: 0,
  other_expense: 1,
  inter_branch_transfer: 2,
  procurement_request: 3,
  leave_request: 4,
};

/**
 * Converts only safe workflow metadata into a unified review item.
 * Titles, justifications, amounts, patient data, and employee details are intentionally excluded.
 */
export function makeReviewInboxItem(input: { source: ReviewInboxSource; recordId: number; status: "submitted" | "pending_review"; createdAt: Date }): ReviewInboxItem {
  return {
    key: `${input.source}:${input.recordId}`,
    source: input.source,
    sourceLabel: sourceLabels[input.source],
    recordId: input.recordId,
    status: input.status,
    createdAt: input.createdAt,
  };
}

export function buildUnifiedReviewInbox(items: ReviewInboxItem[], limit: number) {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const orderedItems = [...items]
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime() || sourceRank[left.source] - sourceRank[right.source] || right.recordId - left.recordId)
    .slice(0, safeLimit);
  const counts = REVIEW_INBOX_SOURCES.reduce((accumulator, source) => {
    accumulator[source] = items.filter(item => item.source === source).length;
    return accumulator;
  }, {} as Record<ReviewInboxSource, number>);
  return { items: orderedItems, counts, totalCount: items.length };
}
