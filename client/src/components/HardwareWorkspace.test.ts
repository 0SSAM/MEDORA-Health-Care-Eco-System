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
