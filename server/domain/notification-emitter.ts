import { notifications } from "../../drizzle/schema";

export async function emitManagerNotification(db: any, input: {
  organizationId: number;
  branchId?: number | null;
  severity: "info" | "success" | "warning" | "critical";
  title: string;
  body: string;
  createdByUserId?: number;
}) {
  // Target managers and org admins
  const roles: ("org_admin" | "operations_manager")[] = ["org_admin", "operations_manager"];
  
  for (const role of roles) {
    await db.insert(notifications).values({
      organizationId: input.organizationId,
      branchId: input.branchId ?? null,
      audienceRole: role,
      severity: input.severity,
      title: input.title,
      body: input.body,
      createdByUserId: input.createdByUserId ?? null,
      active: 1,
    });
  }
}

export async function emitUnauthorizedAttemptAlert(db: any, input: {
  organizationId: number;
  branchId?: number | null;
  userId: number;
  action: string;
  resource: string;
}) {
  await emitManagerNotification(db, {
    organizationId: input.organizationId,
    branchId: input.branchId,
    severity: "critical",
    title: "محاولة وصول غير مصرح بها",
    body: `قام المستخدم (ID: ${input.userId}) بمحاولة غير مصرح بها لـ ${input.action} على ${input.resource}. تم تسجيل هذه المحاولة في سجل التدقيق.`,
  });
}
