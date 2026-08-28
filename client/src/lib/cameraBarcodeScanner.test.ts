import { afterEach, describe, expect, it, vi } from "vitest";
import { cameraUnavailableReason, isCameraBarcodeSupported } from "./cameraBarcodeScanner";

const originalWindow = globalThis.window;
const originalNavigator = globalThis.navigator;

afterEach(() => {
  vi.stubGlobal("window", originalWindow);
  vi.stubGlobal("navigator", originalNavigator);
  vi.unstubAllGlobals();
});

describe("camera capability fallback contract", () => {
  it("reports unsupported outside a browser context", () => {
    vi.stubGlobal("window", undefined);
    expect(cameraUnavailableReason()).toBe("unsupported");
  });

  it("reports insecure when browser APIs exist outside HTTPS", () => {
    vi.stubGlobal("window", { isSecureContext: false, BarcodeDetector: class {} });
    vi.stubGlobal("navigator", { mediaDevices: { getUserMedia: vi.fn() } });
    expect(cameraUnavailableReason()).toBe("insecure");
  });

  it("reports unsupported when BarcodeDetector is unavailable", () => {
    vi.stubGlobal("window", { isSecureContext: true });
    vi.stubGlobal("navigator", { mediaDevices: { getUserMedia: vi.fn() } });
    expect(isCameraBarcodeSupported()).toBe(false);
    expect(cameraUnavailableReason()).toBe("unsupported");
  });

  it("reports camera-ready only when all browser capabilities exist", () => {
    vi.stubGlobal("window", { isSecureContext: true, BarcodeDetector: class {} });
    vi.stubGlobal("navigator", { mediaDevices: { getUserMedia: vi.fn() } });
    expect(isCameraBarcodeSupported()).toBe(true);
    expect(cameraUnavailableReason()).toBeNull();
  });
});
