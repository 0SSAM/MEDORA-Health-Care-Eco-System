import { describe, expect, it } from "vitest";
import { evaluatePunch, haversineMeters, punchHash } from "./attendance-tamper-policy";

const fence = { lat: 30.0444, lng: 31.2357, radiusMeters: 500 };
const base = {
  deviceId: "dev-t1", mockLocationAttested: false, emulatorAttested: false,
  punchTs: 1_700_000_000_000, serverNow: 1_700_000_000_000,
  biometricMethod: "fingerprint", biometricVerifiedAt: 1_700_000_000_000,
  allowedClockSkewMs: 5 * 60_000, requireBiometric: true, type: "check_in" as const,
};

describe("attendance tamper policy", () => {
  it("computes haversine distance", () => {
    expect(haversineMeters(30.0444, 31.2357, 30.0444, 31.2357)).toBe(0);
    const d = haversineMeters(30.0444, 31.2357, 30.05, 31.24);
    expect(d).toBeGreaterThan(0);
    expect(d).toBeLessThan(1500);
  });

  it("accepts a valid in-geofence punch with fresh biometric", () => {
    expect(evaluatePunch({ ...base, lat: 30.0444, lng: 31.2357, fence }).reason).toBe("ok");
  });

  it("rejects out-of-geofence", () => {
    const r = evaluatePunch({ ...base, lat: 31.2, lng: 29.9, fence });
    expect(r.reason).toBe("out_of_geofence");
  });

  it("rejects mock location / emulator even inside fence", () => {
    expect(evaluatePunch({ ...base, lat: 30.0444, lng: 31.2357, fence, mockLocationAttested: true }).reason).toBe("mock_location");
    expect(evaluatePunch({ ...base, lat: 30.0444, lng: 31.2357, fence, emulatorAttested: true }).reason).toBe("mock_location");
  });

  it("rejects clock skew beyond tolerance", () => {
    const r = evaluatePunch({ ...base, punchTs: 1_700_000_000_000 + 10 * 60_000, lat: 30.0444, lng: 31.2357, fence });
    expect(r.reason).toBe("clock_skew");
  });

  it("rejects missing or stale biometric when required", () => {
    expect(evaluatePunch({ ...base, biometricMethod: "none", lat: 30.0444, lng: 31.2357, fence }).reason).toBe("biometric_failed");
    expect(evaluatePunch({ ...base, biometricVerifiedAt: 1_700_000_000_000 - 300_000, lat: 30.0444, lng: 31.2357, fence }).reason).toBe("biometric_stale");
  });

  it("rejects when no geofence configured", () => {
    expect(evaluatePunch({ ...base, lat: 30.0444, lng: 31.2357, fence: null }).reason).toBe("no_geofence");
  });

  it("punch hash is deterministic and type/device scoped", () => {
    expect(punchHash(1, 7, "2026-08-28", "check_in", "d1")).toBe(punchHash(1, 7, "2026-08-28", "check_in", "d1"));
    expect(punchHash(1, 7, "2026-08-28", "check_in", "d1")).not.toBe(punchHash(1, 7, "2026-08-28", "check_out", "d1"));
    expect(punchHash(1, 7, "2026-08-28", "check_in", "d1")).not.toBe(punchHash(1, 7, "2026-08-28", "check_in", "d2"));
  });
});
