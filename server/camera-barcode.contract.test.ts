import { describe, expect, it, vi } from "vitest";
import { cameraResultToRaw, cameraUnavailableReason, CAMERA_FORMATS, stopCameraStream } from "../client/src/lib/cameraBarcodeScanner";

describe("camera barcode scanner contract", () => {
  it("preserves the complete decoded payload without trimming or truncation", () => {
    const raw = "0195012345678901727010110BATCH-أ-123";
    expect(cameraResultToRaw({ rawValue: raw, format: "data_matrix" })).toBe(raw);
  });

  it("declares common pharmacy barcode and Data Matrix formats", () => {
    expect(CAMERA_FORMATS).toContain("data_matrix");
    expect(CAMERA_FORMATS).toContain("ean_13");
    expect(CAMERA_FORMATS).toContain("code_128");
  });

  it("returns a safe reason when camera APIs are unavailable in the test runtime", () => {
    expect(cameraUnavailableReason()).toBe("unsupported");
  });

  it("stops every camera track when the scanner closes", () => {
    const stop = vi.fn();
    stopCameraStream({ getTracks: () => [{ stop }, { stop }] } as unknown as MediaStream);
    expect(stop).toHaveBeenCalledTimes(2);
  });
});
