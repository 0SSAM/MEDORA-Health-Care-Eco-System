import { z } from "zod";

/** Read-only POS catalog input for an assigned, active legal jurisdiction. */
export const availableStockInputSchema = z.object({
  branchId: z.number().int().positive(),
  jurisdictionId: z.number().int().positive(),
  query: z.string().trim().max(120).default(""),
});
