import { z } from "zod";

/**
 * Read-only POS catalog input. Jurisdiction identifiers are database keys, so
 * `0` is valid when it represents an assigned showcase/non-regulatory scope.
 * Authorization is still enforced by the procedure against branch assignments.
 */
export const availableStockInputSchema = z.object({
  branchId: z.number().int().positive(),
  jurisdictionId: z.number().int().nonnegative(),
  query: z.string().trim().max(120).default(""),
});
