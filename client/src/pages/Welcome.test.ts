// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
import { describe, expect, it } from "vitest";
import { welcomeRoutes } from "./Welcome";

describe("Welcome screen routes", () => {
  it("keeps public login and authenticated workspace destinations explicit", () => {
    expect(welcomeRoutes.login).toBe("/login");
    expect(welcomeRoutes.workspace).toBe("/workspace");
  });
});
