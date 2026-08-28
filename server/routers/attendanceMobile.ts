import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getRawPool } from "../channels/db";
import { evaluatePunch, punchHash, type PunchReason } from "../domain/attendance-tamper-policy";

const scope = z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive(), jurisdictionId: z.number().int().nonnegative() });

function assertSessionScope(ctx: { internalSession: { session: { organizationId: number; branchId: number; jurisdictionId: number } } | null }, input: z.infer<typeof scope>) {
  const s = ctx.internalSession?.session;
  if (!s || s.organizationId !== input.organizationId || s.branchId !== input.branchId || s.jurisdictionId !== input.jurisdictionId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "نطاق جلسة الحضور لا يطابق المؤسسة أو الفرع أو الاختصاص." });
  }
}

const SKEW_MS = Number(process.env.ATTENDANCE_ALLOWED_CLOCK_SKEW_MINUTES ?? 5) * 60_000;
const REQUIRE_BIO = (process.env.ATTENDANCE_REQUIRE_BIOMETRIC ?? "true") === "true";

async function profileForUser(pool: ReturnType<typeof getRawPool>, userId: number, orgId: number): Promise<{ id: number; organizationId: number; branchId: number } | null> {
  const [rows] = await pool.query("SELECT id, organizationId, branchId FROM employee_profiles WHERE userId=? AND organizationId=? AND employmentStatus='active' LIMIT 1", [userId, orgId]);
  return (rows as Array<{ id: number; organizationId: number; branchId: number }>)[0] ?? null;
}

async function activeFence(pool: ReturnType<typeof getRawPool>, orgId: number, branchId: number) {
  const [rows] = await pool.query("SELECT lat, lng, radiusMeters FROM attendance_geofences WHERE organizationId=? AND branchId=? AND active=1 ORDER BY id LIMIT 1", [orgId, branchId]);
  const r = (rows as Array<{ lat: number; lng: number; radiusMeters: number }>)[0];
  return r ? { lat: Number(r.lat), lng: Number(r.lng), radiusMeters: Number(r.radiusMeters) } : null;
}

async function recordEvent(pool: ReturnType<typeof getRawPool>, ev: {
  orgId: number; branchId: number; employeeProfileId: number; type: "check_in" | "check_out";
  outcome: "accepted" | "rejected"; reason: string; hash: string; lat: number; lng: number; deviceId: string;
  biometricMethod: string; mock: boolean; emulator: boolean; skewSeconds: number;
}) {
  await pool.query(
    "INSERT INTO attendance_events (organizationId,branchId,employeeProfileId,eventType,outcome,reason,punchHash,lat,lng,deviceId,biometricMethod,mockLocationAttested,emulatorAttested,clockSkewSeconds) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [ev.orgId, ev.branchId, ev.employeeProfileId, ev.type, ev.outcome, ev.reason, ev.hash, ev.lat, ev.lng, ev.deviceId, ev.biometricMethod, ev.mock ? 1 : 0, ev.emulator ? 1 : 0, ev.skewSeconds],
  );
}

const punchInput = scope.extend({
  lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180),
  deviceId: z.string().min(8).max(128), deviceModel: z.string().max(80).optional(),
  biometricMethod: z.enum(["platform_webauthn", "face", "fingerprint", "none"]),
  biometricVerifiedAt: z.number().int().nonnegative(),
  punchTs: z.number().int().nonnegative(),
  mockLocationAttested: z.boolean().default(false),
  emulatorAttested: z.boolean().default(false),
});

async function handlePunch(ctx: { internalSession: { session: { organizationId: number; branchId: number; jurisdictionId: number } } | null; user: { id: number } }, input: z.infer<typeof punchInput>, type: "check_in" | "check_out") {
  assertSessionScope(ctx, input);
  const pool = getRawPool();
  const profile = await profileForUser(pool, ctx.user.id, input.organizationId);
  if (!profile) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "لا يوجد ملف موظف نشط مرتبط بهذا المستخدم." });
  const fence = await activeFence(pool, input.organizationId, input.branchId);
  const dateStr = new Date().toISOString().slice(0, 10);
  const hash = punchHash(input.organizationId, profile.id, dateStr, type, input.deviceId);

  const evalRes = evaluatePunch({
    lat: input.lat, lng: input.lng, fence, deviceId: input.deviceId,
    mockLocationAttested: input.mockLocationAttested, emulatorAttested: input.emulatorAttested,
    punchTs: input.punchTs, serverNow: Date.now(),
    biometricMethod: input.biometricMethod, biometricVerifiedAt: input.biometricVerifiedAt,
    allowedClockSkewMs: SKEW_MS, requireBiometric: REQUIRE_BIO, type,
  });

  if (evalRes.reason !== "ok") {
    await recordEvent(pool, { orgId: input.organizationId, branchId: input.branchId, employeeProfileId: profile.id, type, outcome: "rejected", reason: evalRes.reason, hash, lat: input.lat, lng: input.lng, deviceId: input.deviceId, biometricMethod: input.biometricMethod, mock: input.mockLocationAttested, emulator: input.emulatorAttested, skewSeconds: evalRes.clockSkewSeconds });
    return { accepted: false, code: evalRes.reason as PunchReason, reason: evalRes.reason, distanceMeters: evalRes.distanceMeters };
  }

  const [dup] = await pool.query("SELECT id FROM attendance_events WHERE punchHash=? AND outcome='accepted' LIMIT 1", [hash]);
  if ((dup as Array<{ id: number }>).length > 0) {
    await recordEvent(pool, { orgId: input.organizationId, branchId: input.branchId, employeeProfileId: profile.id, type, outcome: "rejected", reason: "duplicate", hash, lat: input.lat, lng: input.lng, deviceId: input.deviceId, biometricMethod: input.biometricMethod, mock: input.mockLocationAttested, emulator: input.emulatorAttested, skewSeconds: 0 });
    return { accepted: false, code: "duplicate", reason: "duplicate", distanceMeters: evalRes.distanceMeters };
  }

  await recordEvent(pool, { orgId: input.organizationId, branchId: input.branchId, employeeProfileId: profile.id, type, outcome: "accepted", reason: "ok", hash, lat: input.lat, lng: input.lng, deviceId: input.deviceId, biometricMethod: input.biometricMethod, mock: input.mockLocationAttested, emulator: input.emulatorAttested, skewSeconds: 0 });

  const isOut = type === "check_out";
  const risk = [input.mockLocationAttested ? "mock" : "", input.emulatorAttested ? "emulator" : ""].filter(Boolean).join(",") || null;
  const latCol = isOut ? "checkOutLat" : "checkInLat";
  const lngCol = isOut ? "checkOutLng" : "checkInLng";
  const [rows] = await pool.query("SELECT id FROM employee_attendance WHERE organizationId=? AND employeeProfileId=? AND DATE(workDate)=CURDATE() LIMIT 1", [input.organizationId, profile.id]);
  const existing = (rows as Array<{ id: number }>)[0];
  if (isOut && !existing) {
    await recordEvent(pool, { orgId: input.organizationId, branchId: input.branchId, employeeProfileId: profile.id, type, outcome: "rejected", reason: "no_check_in", hash, lat: input.lat, lng: input.lng, deviceId: input.deviceId, biometricMethod: input.biometricMethod, mock: input.mockLocationAttested, emulator: input.emulatorAttested, skewSeconds: 0 });
    return { accepted: false, code: "no_check_in", reason: "checkout_without_checkin", distanceMeters: evalRes.distanceMeters };
  }
  let attendanceId: number;
  if (existing) {
    if (!isOut) {
      await recordEvent(pool, { orgId: input.organizationId, branchId: input.branchId, employeeProfileId: profile.id, type, outcome: "rejected", reason: "duplicate", hash, lat: input.lat, lng: input.lng, deviceId: input.deviceId, biometricMethod: input.biometricMethod, mock: input.mockLocationAttested, emulator: input.emulatorAttested, skewSeconds: 0 });
      return { accepted: false, code: "duplicate", reason: "already_checked_in", distanceMeters: evalRes.distanceMeters };
    }
    attendanceId = existing.id;
    await pool.query(`UPDATE employee_attendance SET checkOutAt=NOW(), ${latCol}=?, ${lngCol}=?, geofenceStatus='in', distanceMeters=?, serverReceivedAt=NOW(), riskFlags=COALESCE(riskFlags, ?) WHERE id=?`, [input.lat, input.lng, evalRes.distanceMeters, risk, attendanceId]);
  } else {
    const ins = await pool.query(
      "INSERT INTO employee_attendance (organizationId,branchId,jurisdictionId,employeeProfileId,workDate,checkInAt,status,source,reviewedByUserId,checkInLat,checkInLng,deviceId,deviceModel,biometricMethod,biometricVerifiedAt,geofenceStatus,distanceMeters,serverReceivedAt,riskFlags) VALUES (?,?,?,?,NOW(),NOW(),'present','verified_device',?,?,?,?,?,?,?,?,?,NOW(),?)",
      [input.organizationId, input.branchId, input.jurisdictionId, profile.id, ctx.user.id, input.lat, input.lng, input.deviceId, input.deviceModel ?? null, input.biometricMethod, new Date(input.biometricVerifiedAt), "in", evalRes.distanceMeters, risk],
    );
    attendanceId = Number((ins as unknown as { insertId: number }).insertId);
  }
  await pool.query("UPDATE employee_attendance SET deviceId=?, biometricMethod=?, biometricVerifiedAt=? WHERE id=?", [input.deviceId, input.biometricMethod, new Date(input.biometricVerifiedAt), attendanceId]);
  return { accepted: true, code: "ok", attendanceId, distanceMeters: evalRes.distanceMeters, geofenceStatus: "in" };
}

export const attendanceMobileRouter = router({
  checkIn: protectedProcedure.input(punchInput).mutation(({ ctx, input }) => handlePunch(ctx, input, "check_in")),
  checkOut: protectedProcedure.input(punchInput).mutation(({ ctx, input }) => handlePunch(ctx, input, "check_out")),
  today: protectedProcedure.input(scope).query(async ({ ctx, input }) => {
    assertSessionScope(ctx, input);
    const pool = getRawPool();
    const profile = await profileForUser(pool, ctx.user.id, input.organizationId);
    if (!profile) return { record: null };
    const [rows] = await pool.query("SELECT id,checkInAt,checkOutAt,status,source,deviceId,biometricMethod,geofenceStatus,distanceMeters,riskFlags FROM employee_attendance WHERE organizationId=? AND employeeProfileId=? AND DATE(workDate)=CURDATE() LIMIT 1", [input.organizationId, profile.id]);
    const r = (rows as Array<Record<string, unknown>>)[0];
    return { record: r ?? null, requireBiometric: REQUIRE_BIO, allowedClockSkewMinutes: SKEW_MS / 60_000 };
  }),
  geofences: router({
    list: protectedProcedure.input(scope).query(async ({ ctx, input }) => {
      assertSessionScope(ctx, input);
      const pool = getRawPool();
      const [rows] = await pool.query("SELECT id,name,lat,lng,radiusMeters,active FROM attendance_geofences WHERE organizationId=? AND branchId=? ORDER BY id", [input.organizationId, input.branchId]);
      return { geofences: rows };
    }),
    save: protectedProcedure.input(scope.extend({ name: z.string().min(2).max(120), lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180), radiusMeters: z.number().int().min(50).max(10000) })).mutation(async ({ ctx, input }) => {
      assertSessionScope(ctx, input);
      const pool = getRawPool();
      await pool.query("INSERT INTO attendance_geofences (organizationId,branchId,name,lat,lng,radiusMeters,active) VALUES (?,?,?,?,?,?,1) ON DUPLICATE KEY UPDATE name=VALUES(name), lat=VALUES(lat), lng=VALUES(lng), radiusMeters=VALUES(radiusMeters), active=1", [input.organizationId, input.branchId, input.name, input.lat, input.lng, input.radiusMeters]);
      return { saved: true };
    }),
  }),
});
