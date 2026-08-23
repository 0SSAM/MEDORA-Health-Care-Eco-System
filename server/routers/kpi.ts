import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getKpiRoleTemplate, listKpiRoleTemplates } from "../domain/kpi-role-templates";

const scopeInput = z.object({
  organizationId: z.number().int().positive(),
  branchId: z.number().int().positive(),
  jurisdictionId: z.number().int().nonnegative(),
});

const templateRole = z.enum(["doctor", "customer_service", "warehouse_manager"]);

function assertSessionScope(ctx: { internalSession: { session: { organizationId: number; branchId: number; jurisdictionId: number } } | null }, input: z.infer<typeof scopeInput>) {
  const session = ctx.internalSession?.session;
  if (!session || session.organizationId !== input.organizationId || session.branchId !== input.branchId || session.jurisdictionId !== input.jurisdictionId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "نطاق جلسة KPI لا يطابق المؤسسة أو الفرع أو الاختصاص القانوني الحالي." });
  }
}

export const kpiRouter = router({
  listRoleTemplates: protectedProcedure.input(scopeInput).query(({ ctx, input }) => {
    assertSessionScope(ctx, input);
    return {
      scope: input,
      templateCount: listKpiRoleTemplates().length,
      templates: listKpiRoleTemplates(),
      applyMode: "preview-and-human-approval" as const,
    };
  }),
  previewRoleTemplate: protectedProcedure.input(scopeInput.extend({ role: templateRole })).query(({ ctx, input }) => {
    assertSessionScope(ctx, input);
    return {
      scope: { organizationId: input.organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId },
      template: getKpiRoleTemplate(input.role),
      applyMode: "preview-and-human-approval" as const,
      note: "هذه المعاينة لا تنشئ تعييناً ولا تستبدل مؤشرات مخصصة؛ يلزم اعتماد بشري في مسار إدارة الأداء.",
    };
  }),
});
