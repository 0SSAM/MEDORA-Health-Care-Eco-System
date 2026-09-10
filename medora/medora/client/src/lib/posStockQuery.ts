export type PosScope = {
  branchId: number | null;
  jurisdictionId: number | null;
};

/**
 * POS inventory is valid only inside a concrete server-recognized assignment.
 * IDs are deliberately checked as positive integers, matching the protected
 * server procedure rather than relying on loose browser truthiness.
 */
export function hasValidPosScope({ branchId, jurisdictionId }: PosScope) {
  return Number.isInteger(branchId) && (branchId ?? 0) > 0 && Number.isInteger(jurisdictionId) && (jurisdictionId ?? 0) > 0;
}

/**
 * A fresh POS mount must re-request stock after an identity boundary. This
 * prevents a prior user's cached error from blocking a permitted cashier.
 */
export const POS_STOCK_QUERY_OPTIONS = {
  retry: false,
  refetchOnMount: "always" as const,
};
