/**
 * attendance-tamper-policy.ts — سيادة الخادم على تسجيل الحضور عبر GPS + المصادقة البيومترية.
 * جميع قرارات القبول/الرفض تُتخذ هنا من جانب الخادم حصراً؛ أي قيمة يرسلها العميل هي ادعاء يُدقق.
 */
import { createHash } from "node:crypto";

export type PunchReason = "ok" | "no_geofence" | "out_of_geofence" | "mock_location" | "clock_skew" | "biometric_failed" | "biometric_stale" | "duplicate";

export interface Geofence { lat: number; lng: number; radiusMeters: number; }

export function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

export function punchHash(orgId: number, employeeProfileId: number, dateStr: string, type: "check_in" | "check_out", deviceId: string): string {
  return createHash("sha256").update(`${orgId}:${employeeProfileId}:${dateStr}:${type}:${deviceId}`).digest("hex");
}

export interface PunchEval {
  lat: number; lng: number; fence: Geofence | null;
  deviceId: string; mockLocationAttested: boolean; emulatorAttested: boolean;
  punchTs: number; serverNow: number;
  biometricMethod: string; biometricVerifiedAt: number;
  allowedClockSkewMs: number; requireBiometric: boolean; type: "check_in" | "check_out";
}

export function evaluatePunch(e: PunchEval): { reason: PunchReason; distanceMeters: number; clockSkewSeconds: number } {
  const skew = Math.abs(e.punchTs - e.serverNow);
  if (skew > e.allowedClockSkewMs) return { reason: "clock_skew", distanceMeters: 0, clockSkewSeconds: Math.round(skew / 1000) };
  if (e.mockLocationAttested || e.emulatorAttested) return { reason: "mock_location", distanceMeters: 0, clockSkewSeconds: 0 };
  if (!e.fence) return { reason: "no_geofence", distanceMeters: 0, clockSkewSeconds: 0 };
  const d = haversineMeters(e.lat, e.lng, e.fence.lat, e.fence.lng);
  if (d > e.fence.radiusMeters) return { reason: "out_of_geofence", distanceMeters: d, clockSkewSeconds: 0 };
  if (e.requireBiometric) {
    if (e.biometricMethod === "none" || e.biometricMethod === "") return { reason: "biometric_failed", distanceMeters: d, clockSkewSeconds: 0 };
    if (Math.abs(e.serverNow - e.biometricVerifiedAt) > 120_000) return { reason: "biometric_stale", distanceMeters: d, clockSkewSeconds: 0 };
  }
  return { reason: "ok", distanceMeters: d, clockSkewSeconds: 0 };
}
