import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { authenticatedProcedure, router } from "../_core/trpc";
import { getCurrentNdaAcceptance, recordNdaAcceptance } from "../db";
import { getNdaDocument, MEDORA_NDA_HASH, MEDORA_NDA_VERSION } from "../domain/nda-policy";

const surfaceSchema = z.enum(["web", "mobile_webview", "desktop_wrapper", "unknown"]);

export const ndaRouter = router({
  status: authenticatedProcedure.query(async ({ ctx }) => {
    const acceptance = await getCurrentNdaAcceptance(ctx.user.id, MEDORA_NDA_VERSION);
    return {
      document: getNdaDocument(),
      accepted: Boolean(acceptance && acceptance.documentHash === MEDORA_NDA_HASH),
      acceptedAt: acceptance?.acceptedAt ?? null,
      declaredSurface: acceptance?.declaredSurface ?? null,
    };
  }),
  accept: authenticatedProcedure.input(z.object({
    version: z.string().trim().max(32),
    hash: z.string().trim().length(64),
    locale: z.enum(["ar", "en"]),
    surface: surfaceSchema,
    confirmed: z.literal(true),
  })).mutation(async ({ ctx, input }) => {
    if (input.version !== MEDORA_NDA_VERSION || input.hash !== MEDORA_NDA_HASH) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "NDA_DOCUMENT_VERSION_MISMATCH" });
    }
    const acceptance = await recordNdaAcceptance({
      userId: ctx.user.id,
      documentVersion: MEDORA_NDA_VERSION,
      documentHash: MEDORA_NDA_HASH,
      locale: input.locale,
      declaredSurface: input.surface,
    });
    return { accepted: true as const, acceptedAt: acceptance?.acceptedAt ?? new Date() };
  }),
});
