export type NotificationScope = {
  organizationId: number | null;
  branchId: number | null;
};

export function canAccessNotificationScope(args: {
  isAdmin: boolean;
  hasActiveOrganizationMembership: boolean;
  hasActiveBranchMembership?: boolean;
  requestedOrganizationId?: number | null;
  requestedBranchId?: number | null;
  notification: NotificationScope;
}) {
  if (args.isAdmin) return true;
  if (!args.hasActiveOrganizationMembership) return false;
  if (args.notification.organizationId !== null && args.requestedOrganizationId !== args.notification.organizationId) return false;
  if (args.notification.branchId !== null) {
    return args.hasActiveBranchMembership === true && args.requestedBranchId === args.notification.branchId;
  }
  return true;
}
