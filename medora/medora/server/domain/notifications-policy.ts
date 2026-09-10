export type NotificationAudience = "all" | "admin" | "manager" | "pharmacist" | "cashier" | "org_admin" | "clinical_lead" | "operations_manager" | "staff" | "auditor";

export function canViewNotification(audienceRole: NotificationAudience, userRole: string | null | undefined) {
  if (audienceRole === "all") return Boolean(userRole);
  if (!userRole) return false;
  if (audienceRole === "admin") return userRole === "admin";
  return audienceRole === userRole;
}
