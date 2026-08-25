// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
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
