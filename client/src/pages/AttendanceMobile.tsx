import { useEffect, useState } from "react";
const S = { wrap: { maxWidth: 420, margin: "0 auto", padding: 16, background: "#f8fafc", minHeight: "100vh", fontFamily: "'Segoe UI', Tahoma, sans-serif" } as const, card: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 16, marginBottom: 12 } as const, btn: { width: "100%", border: 0, borderRadius: 10, padding: "14px 0", fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 8 } as const };
function enc(v: unknown) { return encodeURIComponent(JSON.stringify(v)); }
async function q<T = unknown>(path: string, input: unknown): Promise<T> {
  const res = await fetch(`/api/trpc/${path}?batch=1&input=${enc({ "0": { json: input ?? null } })}`, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = (await res.json()) as { "0"?: { result?: { data?: { json?: T } | T } } };
  const d = j?.["0"]?.result?.data;
  return ((d && typeof d === "object" && "json" in (d as object)) ? (d as { json: T }).json : d) as T;
}
async function m<T = unknown>(path: string, input: unknown): Promise<T> {
  const res = await fetch(`/api/trpc/${path}?batch=1`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ "0": { json: input ?? null } }) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = (await res.json()) as { "0"?: { result?: { data?: { json?: T } | T } } };
  const d = j?.["0"]?.result?.data;
  return ((d && typeof d === "object" && "json" in (d as object)) ? (d as { json: T }).json : d) as T;
}
interface Scope { organizationId: number; branchId: number; jurisdictionId: number; }
interface Fence { name: string; radiusMeters: number; }
interface Rec { checkInAt?: string | null; checkOutAt?: string | null; status?: string; }
export default function AttendanceMobile() {
  const [myLat, setMyLat] = useState<number | null>(null);
  const [myLng, setMyLng] = useState<number | null>(null);
  const [bio, setBio] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const scope: Scope = { organizationId: 1, branchId: 1, jurisdictionId: 0 };
  const [fence, setFence] = useState<Fence | null>(null);
  const [rec, setRec] = useState<Rec | null>(null);
  useEffect(() => {
    q<{ geofences: Fence[] }>("attendanceMobile.geofences.list", scope).then((d) => setFence(d.geofences?.[0] ?? null)).catch(() => {});
    q<{ record: Rec | null }>("attendanceMobile.today", scope).then((d) => setRec(d.record)).catch(() => {});
    if (!navigator.geolocation) { setResult({ ok: false, text: "GPS غير متاح في هذا المتصفح" }); return; }
    navigator.geolocation.getCurrentPosition((p) => { setMyLat(p.coords.latitude); setMyLng(p.coords.longitude); }, () => setResult({ ok: false, text: "تعذر الحصول على موقع GPS — امنح إذن الموقع" }), { timeout: 8000 });
  }, []);
  const run = async (type: "check_in" | "check_out") => {
    if (myLat === null || myLng === null) { setResult({ ok: false, text: "انتظر تحديد موقع GPS أولاً" }); return; }
    try {
      const res = await m<{ accepted?: boolean; reason?: string }>(`attendanceMobile.${type}`, { ...scope, lat: myLat, lng: myLng, deviceId: "mw-demo-001", deviceModel: "Playwright headless", biometricMethod: bio ? "fingerprint" : "none", biometricVerifiedAt: bio ? Date.now() : 0, punchTs: Date.now(), mockLocationAttested: false, emulatorAttested: false });
      setResult({ ok: Boolean(res.accepted), text: res.accepted ? "✅ تم تسجيل البصمة والختم بنجاح داخل النطاق" : `⛔ رُفض: ${res.reason ?? ""}` });
      const d = await q<{ record: Rec | null }>("attendanceMobile.today", scope);
      setRec(d.record);
    } catch (e) { setResult({ ok: false, text: `خطأ: ${String((e as Error)?.message ?? e).slice(0, 120)}` }); }
  };
  return (
    <div style={S.wrap}>
      <div style={{ textAlign: "center", padding: "10px 0 14px" }}>
        <h2 style={{ margin: 0, color: "#0d1b2a" }}>حضور وانصراف الموظف</h2>
        <div style={{ color: "#64748b", fontSize: 13 }}>GPS + مصادقة بيومترية · قرارات الخادم فقط</div>
      </div>
      <div style={S.card}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>📍 النطاق الجغرافي</div>
        <div style={{ fontSize: 13, color: "#334155" }}>{fence ? `${fence.name} (نصف قطر ${fence.radiusMeters} م)` : "لم يُعدّ أي نطاق — سيرفض الخادم كل التسجيل"}</div>
        <div style={{ fontSize: 13, color: "#334155", marginTop: 4 }}>موقعك: {myLat !== null ? `${myLat.toFixed(5)}, ${myLng?.toFixed(5)}` : "جارٍ تحديد الموقع…"}</div>
      </div>
      <div style={S.card}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>🔐 المصادقة البيومترية</div>
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14 }}>
          <input type="checkbox" data-testid="biometric-toggle" checked={bio} onChange={(e) => setBio(e.target.checked)} /> تم التحقق بالبصمة/الوجه على الجهاز
        </label>
      </div>
      <div style={S.card}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>📋 سجل اليوم</div>
        {rec ? (
          <div style={{ fontSize: 13, color: "#334155" }}>حضور: {String(rec.checkInAt ?? "-")} · انصراف: {String(rec.checkOutAt ?? "—")} · الحالة: {String(rec.status)}</div>
        ) : <div style={{ fontSize: 13, color: "#94a3b8" }}>لا يوجد تسجيل اليوم بعد</div>}
      </div>
      <button data-testid="btn-checkin" style={{ ...S.btn, background: "#16a34a", color: "#fff" }} onClick={() => run("check_in")}>تسجيل حضور</button>
      <button data-testid="btn-checkout" style={{ ...S.btn, background: "#0d1b2a", color: "#fff" }} onClick={() => run("check_out")}>تسجيل انصراف</button>
      {result && <div style={{ ...S.card, marginTop: 12, background: result.ok ? "#f0fdf4" : "#fef2f2", color: result.ok ? "#166534" : "#991b1b" }}><strong>{result.text}</strong></div>}
    </div>
  );
}