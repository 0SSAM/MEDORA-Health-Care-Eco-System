export type NotificationDeliveryContext = {
  recipientScopeVerified: boolean;
  consentOrPreferenceVerified: boolean;
  channelAllowed: boolean;
  quietHoursHandled: boolean;
  localizedContentVerified: boolean;
  auditMetadataConfigured: boolean;
};

export function notificationDeliveryReadiness(context: NotificationDeliveryContext | null) {
  if (!context) return "BLOCKED" as const;
  return Object.values(context).every(Boolean) ? "READY" as const : "BLOCKED" as const;
}

export function assertNotificationDeliveryReady(context: NotificationDeliveryContext | null) {
  if (notificationDeliveryReadiness(context) !== "READY") throw new Error("Notification delivery is not ready");
  return true as const;
}
