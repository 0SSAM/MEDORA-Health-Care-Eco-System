import { describe, expect, it } from "vitest";
import { assertNotificationDeliveryReady, notificationDeliveryReadiness, type NotificationDeliveryContext } from "./notification-policy";

const complete: NotificationDeliveryContext = {
  recipientScopeVerified: true,
  consentOrPreferenceVerified: true,
  channelAllowed: true,
  quietHoursHandled: true,
  localizedContentVerified: true,
  auditMetadataConfigured: true,
};

describe("notification delivery readiness", () => {
  it("blocks delivery when recipient, consent, channel, quiet-hours, localization, or audit gates are missing", () => {
    expect(notificationDeliveryReadiness(null)).toBe("BLOCKED");
    expect(notificationDeliveryReadiness({ ...complete, recipientScopeVerified: false })).toBe("BLOCKED");
    expect(notificationDeliveryReadiness({ ...complete, quietHoursHandled: false })).toBe("BLOCKED");
    expect(() => assertNotificationDeliveryReady({ ...complete, channelAllowed: false })).toThrow(/not ready/);
  });

  it("allows delivery only when every notification gate is verified", () => {
    expect(notificationDeliveryReadiness(complete)).toBe("READY");
    expect(assertNotificationDeliveryReady(complete)).toBe(true);
  });
});
