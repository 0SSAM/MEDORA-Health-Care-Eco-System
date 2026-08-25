// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
import { describe, expect, it } from "vitest";
import { connectionLabels, printerModels } from "./HardwareWorkspace";

describe("HardwareWorkspace production boundary", () => {
  it("keeps the supported printer catalog explicit and bounded", () => {
    expect(new Set(printerModels.map(model => model.family)).size).toBe(3);
    expect(printerModels.every(model => model.transports.length > 0 && model.media.length > 0)).toBe(true);
    expect(Object.keys(connectionLabels)).toEqual(expect.arrayContaining(["local-bridge", "usb", "bluetooth", "network-ipps", "browser-download"]));
  });

  it("does not expose executable device actions before an approved connector exists", async () => {
    const module = await import("./HardwareWorkspace");
    expect(Object.keys(module)).toEqual(expect.arrayContaining(["HardwareWorkspace", "printerModels", "connectionLabels"]));
    expect(Object.keys(module)).not.toContain("simulateScan");
    expect(Object.keys(module)).not.toContain("simulatePrint");
  });
});
