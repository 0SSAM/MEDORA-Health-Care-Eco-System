// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { emitManagerNotification, emitUnauthorizedAttemptAlert } from "../domain/notification-emitter";
import { writeDetailedAudit } from "../domain/audit-policy";

export const timeGuardRouter = router({
  /**
   * Returns the trusted server-side UTC time.
   * Used by the client to detect local time tampering.
   */
  getTrustedTime: publicProcedure.query(() => {
    return {
      utcTime: new Date().toISOString(),
      timestamp: Date.now(),
    };
  }),

  /**
   * Records a time tampering attempt and notifies the organization manager.
   */
  reportTampering: protectedProcedure
    .input(z.object({
      organizationId: z.number().int().positive(),
      branchId: z.number().int().positive().optional(),
      clientTime: z.string(),
      serverTime: z.string(),
      driftSeconds: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      // Log the tampering attempt in the audit trail
      await writeDetailedAudit(db, {
        userId: ctx.user.id,
        organizationId: input.organizationId,
        branchId: input.branchId ?? null,
        action: "security_time_tampering_detected",
        entityType: "security_event",
        entityId: ctx.user.id,
        metadata: {
          clientTime: input.clientTime,
          serverTime: input.serverTime,
          driftSeconds: input.driftSeconds,
        }
      });

      // Send a critical alert to managers
      await emitUnauthorizedAttemptAlert(db, {
        organizationId: input.organizationId,
        branchId: input.branchId ?? null,
        userId: ctx.user.id,
        action: "تلاعب في وقت النظام",
        resource: `ClientTime:${input.clientTime} | Drift:${input.driftSeconds}s`
      });

      return { success: true };
    }),
});
