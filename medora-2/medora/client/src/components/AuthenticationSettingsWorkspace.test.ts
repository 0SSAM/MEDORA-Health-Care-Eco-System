import { describe, expect, it } from "vitest";
import { authSecurityReadinessFallback } from "./AuthenticationSettingsWorkspace";

describe("authentication security readiness", () => {
  it("does not advertise 2FA as active before provider setup", () => {
    expect(authSecurityReadinessFallback.twoFactorState).toBe("deferred");
    expect(authSecurityReadinessFallback.externalActivation).toBe("blocked");
  });

  it("keeps recovery email disabled until an institutional provider is configured", () => {
    expect(authSecurityReadinessFallback.recoveryChannelState).toBe("deferred");
    expect(authSecurityReadinessFallback.emailProviderConfigured).toBe(false);
  });
});
