/**
 * Delivery.tsx — لوحة التوصيل (Delivery Services): الطلبات | السائقون | المناطق | التتبع
 * حزمة MEDORA 2026-08-28.
 * صفحة قائمة بذاتها: تستدعي موجّه tRPC مباشرة عبر fetch (بدون اعتماد على خطافات داخلية),
 * وتقرأ organizationId من local storage (تُملأ عند الدخول في بقية التطبيق) مع افتراض 1.
 */
import { useCallback, useEffect, useState, type CSSProperties } from "react";

type Order = { id: number; customerName: string; customerPhone: string; addressText: string; feeEgp: number; status: string; driverName?: string; zoneName?: string; createdAt?: string };
type Driver = { id: number; nameAr: string; phone: string; vehicleType: string; status: string; active: boolean };
type Zone = { id: number; nameAr: string; nameEn: string; feeEgp: number; minOrderEgp: number; deliveryTimeMin: number; active: boolean };
type Track = { id: number; status: string; customerName: string; addressText: string; feeEgp: number; driverName?: string; driverPhone?: string; events: { eventType: string; noteAr?: string; createdAt?: string }[] };

const STATUS_AR: Record<string, string> = {
  created: "جديد", assigned: "عُيّن سائق", picked_up: "تم الالتقاط", in_transit: "في الطريق",
  delivered: "تم التسليم", cancelled: "ملغي", failed: "فشل",
};

function orgId(): number {
  try {
    const raw = localStorage.getItem("medora_organization_id");
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) && n > 0 ? n : 1;
  } catch { return 1; }
}

async function call(path: string, body: unknown = null): Promise<any> {
  const res = await fetch(`/api/trpc/${path}?batch=1`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ "0": { json: body } }),
    credentials: "same-origin",
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const data = await res.json();
  const item = data?.[0];
  if (item?.error) throw new Error(item.error?.message ?? "خطأ من الخادم");
  return item?.result?.data ?? null;
}

const inputStyle: CSSProperties = { padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1", width: "100%", background: "#fff", color: "#0f172a" };

export default function Delivery() {
  const [tab, setTab] = useState<"orders" | "drivers" | "zones" | "track">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [track, setTrack] = useState<Track | null>(null);
  const [stats, setStats] = useState<{ orders?: Record<string, number>; drivers?: Record<string, number> }>({});
  const [msg, setMsg] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const [form, setForm] = useState({ customerName: "", customerPhone: "", addressText: "", zoneId: "", feeEgp: "0" });
  const [trackId, setTrackId] = useState<string>("");
  const [driverForm, setDriverForm] = useState({ nameAr: "", phone: "", vehicleType: "motorcycle" });
  const [zoneForm, setZoneForm] = useState({ nameAr: "", nameEn: "", feeEgp: "0", minOrderEgp: "0", deliveryTimeMin: "45" });

  const refresh = useCallback(async () => {
    try {
      const oid = orgId();
      const [o, d, z, s] = await Promise.all([
        call("delivery.listOrders", { organizationId: oid }),
        call("delivery.listDrivers", { organizationId: oid }),
        call("delivery.listZones", { organizationId: oid }),
        call("delivery.deliveryStats", { organizationId: oid }),
      ]);
      setOrders(o ?? []); setDrivers(d ?? []); setZones(z ?? []); setStats(s ?? {});
      setErr("");
    } catch (e: any) { setErr(String(e?.message ?? e)); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const act = async (fn: () => Promise<any>, okMsg: string) => {
    try { await fn(); setMsg(okMsg); setErr(""); refresh(); setTimeout(() => setMsg(""), 4000); }
    catch (e: any) { setErr(String(e?.message ?? e)); }
  };

  const count = (k: string) => stats?.orders?.[k] ?? 0;

  return (
    <div dir="rtl" style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px", fontFamily: "system-ui, sans-serif", color: "#0f172a" }}>
      <div style={{ background: "linear-gradient(135deg,#0f766e,#0e7490)", borderRadius: 16, padding: "22px 26px", color: "#fff", marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>🚚 خدمة التوصيل — MEDORA</h1>
        <div style={{ display: "flex", gap: 22, marginTop: 14, flexWrap: "wrap" }}>
          {[["جديد", count("created")], ["في الطريق", count("in_transit") + count("picked_up") + count("assigned")], ["تم التسليم", count("delivered")], ["ملغي/فاشل", count("cancelled") + count("failed")]].map(([k, v]) => (
            <div key={k} style={{ background: "rgba(255,255,255,.16)", borderRadius: 10, padding: "8px 16px", minWidth: 110 }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{v}</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>{k}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {([["orders", "الطلبات"], ["drivers", "السائقون"], ["zones", "المناطق"], ["track", "تتبع"] ] as const).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ padding: "9px 18px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, background: tab === k ? "#0f766e" : "#e2e8f0", color: tab === k ? "#fff" : "#334155" }}>
            {label}
          </button>
        ))}
      </div>

      {msg && <div style={{ background: "#dcfce7", color: "#166534", padding: "10px 14px", borderRadius: 10, marginBottom: 12 }}>{msg}</div>}
      {err && <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px 14px", borderRadius: 10, marginBottom: 12 }}>{err}</div>}

      {tab === "orders" && (
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 18, alignItems: "start" }}>
          <form onSubmit={(e) => { e.preventDefault(); act(() => call("delivery.createDelivery", { organizationId: orgId(), order: { customerName: form.customerName, customerPhone: form.customerPhone, addressText: form.addressText, zoneId: form.zoneId ? Number(form.zoneId) : undefined, feeEgp: Number(form.feeEgp) || 0 } }), "تم إنشاء طلب التوصيل"); }}
            style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: 16, display: "grid", gap: 10 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>+ طلب توصيل جديد</h3>
            <input style={inputStyle} placeholder="اسم العميل" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required />
            <input style={inputStyle} placeholder="هاتف العميل" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} required />
            <input style={inputStyle} placeholder="العنوان" value={form.addressText} onChange={(e) => setForm({ ...form, addressText: e.target.value })} required />
            <select style={inputStyle} value={form.zoneId} onChange={(e) => setForm({ ...form, zoneId: e.target.value })}>
              <option value="">بدون منطقة</option>
              {zones.filter((x) => x.active).map((z) => <option key={z.id} value={z.id}>{z.nameAr}</option>)}
            </select>
            <input style={inputStyle} type="number" placeholder="رسوم التوصيل (ج.م)" value={form.feeEgp} onChange={(e) => setForm({ ...form, feeEgp: e.target.value })} />
            <button type="submit" style={{ padding: "10px", borderRadius: 10, border: "none", background: "#0f766e", color: "#fff", fontWeight: 700, cursor: "pointer" }}>إنشاء التوصيل</button>
          </form>
          <div style={{ display: "grid", gap: 10 }}>
            {orders.length === 0 && <div style={{ color: "#64748b", padding: 20, textAlign: "center" }}>لا توجد طلبات توصيل بعد.</div>}
            {orders.map((o) => (
              <div key={o.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 16px", display: "grid", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <b>#{o.id} — {o.customerName}</b>
                  <span style={{ background: o.status === "delivered" ? "#dcfce7" : o.status === "cancelled" || o.status === "failed" ? "#fee2e2" : "#fef9c3", color: o.status === "delivered" ? "#166534" : o.status === "cancelled" || o.status === "failed" ? "#991b1b" : "#854d0e", padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>{STATUS_AR[o.status] ?? o.status}</span>
                </div>
                <div style={{ fontSize: 13, color: "#475569" }}>{o.addressText} {o.zoneName ? `(${o.zoneName})` : ""} — رسوم {o.feeEgp} ج.م</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                  {o.status === "created" && (
                    <button onClick={() => act(() => call("delivery.assignDelivery", { organizationId: orgId(), deliveryId: o.id, driverId: 0 }), "عُيّن سائق تلقائيًا")}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#0e7490", color: "#fff", cursor: "pointer", fontWeight: 600 }}>تعيين سائق تلقائي</button>
                  )}
                  {["assigned", "picked_up", "in_transit"].includes(o.status) && (
                    <button onClick={() => act(() => call("delivery.updateDeliveryStatus", { organizationId: orgId(), deliveryId: o.id, status: o.status === "assigned" ? "picked_up" : o.status === "picked_up" ? "in_transit" : "delivered" }), "تم تحديث الحالة")}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#16a34a", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
                      {o.status === "assigned" ? "التقاط الشحنة" : o.status === "picked_up" ? "في الطريق" : "تم التسليم"}
                    </button>
                  )}
                  {["created", "assigned"].includes(o.status) && (
                    <button onClick={() => act(() => call("delivery.cancelDelivery", { organizationId: orgId(), deliveryId: o.id }), "أُلغي الطلب")}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#dc2626", color: "#fff", cursor: "pointer", fontWeight: 600 }}>إلغاء</button>
                  )}
                  <button onClick={() => { setTab("track"); setTrackId(String(o.id)); }}
                    style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}>تتبع</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "drivers" && (
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 18, alignItems: "start" }}>
          <form onSubmit={(e) => { e.preventDefault(); act(() => call("delivery.registerDriver", { organizationId: orgId(), driver: { nameAr: driverForm.nameAr, phone: driverForm.phone, vehicleType: driverForm.vehicleType } }), "تمت إضافة السائق"); }}
            style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: 16, display: "grid", gap: 10 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>+ سائق جديد</h3>
            <input style={inputStyle} placeholder="اسم السائق" value={driverForm.nameAr} onChange={(e) => setDriverForm({ ...driverForm, nameAr: e.target.value })} required />
            <input style={inputStyle} placeholder="الهاتف" value={driverForm.phone} onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })} required />
            <select style={inputStyle} value={driverForm.vehicleType} onChange={(e) => setDriverForm({ ...driverForm, vehicleType: e.target.value })}>
              <option value="motorcycle">موتوسيكل</option><option value="car">سيارة</option><option value="van">فان</option><option value="bicycle">دراجة</option>
            </select>
            <button type="submit" style={{ padding: "10px", borderRadius: 10, border: "none", background: "#0f766e", color: "#fff", fontWeight: 700, cursor: "pointer" }}>إضافة السائق</button>
          </form>
          <div style={{ display: "grid", gap: 10 }}>
            {drivers.map((d) => (
              <div key={d.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div><b>{d.nameAr}</b> <span style={{ color: "#64748b", fontSize: 13 }}>{d.phone} — {d.vehicleType}</span></div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ background: d.status === "available" ? "#dcfce7" : d.status === "busy" ? "#fef9c3" : "#e2e8f0", color: d.status === "available" ? "#166534" : d.status === "busy" ? "#854d0e" : "#475569", padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
                    {d.status === "available" ? "متاح" : d.status === "busy" ? "مشغول" : "غير متصل"}
                  </span>
                </div>
              </div>
            ))}
            {drivers.length === 0 && <div style={{ color: "#64748b", padding: 20, textAlign: "center" }}>لا سائقون بعد — أضف السائق الأول.</div>}
          </div>
        </div>
      )}

      {tab === "zones" && (
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 18, alignItems: "start" }}>
          <form onSubmit={(e) => { e.preventDefault(); act(() => call("delivery.createZone", { organizationId: orgId(), zone: { nameAr: zoneForm.nameAr, nameEn: zoneForm.nameEn, feeEgp: Number(zoneForm.feeEgp) || 0, minOrderEgp: Number(zoneForm.minOrderEgp) || 0, deliveryTimeMin: Number(zoneForm.deliveryTimeMin) || 45 } }), "أُضيفت المنطقة"); }}
            style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: 16, display: "grid", gap: 10 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>+ منطقة جديدة</h3>
            <input style={inputStyle} placeholder="الاسم بالعربية" value={zoneForm.nameAr} onChange={(e) => setZoneForm({ ...zoneForm, nameAr: e.target.value })} required />
            <input style={inputStyle} placeholder="Name (EN)" value={zoneForm.nameEn} onChange={(e) => setZoneForm({ ...zoneForm, nameEn: e.target.value })} required />
            <input style={inputStyle} type="number" placeholder="الرسوم (ج.م)" value={zoneForm.feeEgp} onChange={(e) => setZoneForm({ ...zoneForm, feeEgp: e.target.value })} required />
            <input style={inputStyle} type="number" placeholder="حد أدنى للطلب (ج.م)" value={zoneForm.minOrderEgp} onChange={(e) => setZoneForm({ ...zoneForm, minOrderEgp: e.target.value })} />
            <input style={inputStyle} type="number" placeholder="مدة التوصيل (دقيقة)" value={zoneForm.deliveryTimeMin} onChange={(e) => setZoneForm({ ...zoneForm, deliveryTimeMin: e.target.value })} />
            <button type="submit" style={{ padding: "10px", borderRadius: 10, border: "none", background: "#0f766e", color: "#fff", fontWeight: 700, cursor: "pointer" }}>إضافة المنطقة</button>
          </form>
          <div style={{ display: "grid", gap: 10 }}>
            {zones.map((z) => (
              <div key={z.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 16px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div><b>{z.nameAr}</b> <span style={{ color: "#64748b", fontSize: 13 }}>({z.nameEn})</span></div>
                <div style={{ fontSize: 13, color: "#334155" }}>رسوم {z.feeEgp} ج.م · حد أدنى {z.minOrderEgp} ج.م · {z.deliveryTimeMin} دقيقة</div>
              </div>
            ))}
            {zones.length === 0 && <div style={{ color: "#64748b", padding: 20, textAlign: "center" }}>لا مناطق بعد — شغّل scripts/seed-delivery-zones.mjs أو أضف منطقة.</div>}
          </div>
        </div>
      )}

      {tab === "track" && (
        <div style={{ display: "grid", gap: 14 }}>
          <form onSubmit={(e) => { e.preventDefault(); act(async () => { setTrack(await call("delivery.trackDelivery", { organizationId: orgId(), deliveryId: Number(trackId) })); }, ""); }}
            style={{ display: "flex", gap: 8 }}>
            <input style={{ ...inputStyle, maxWidth: 200 }} placeholder="رقم التوصيل" value={trackId} onChange={(e) => setTrackId(e.target.value)} required />
            <button type="submit" style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: "#0e7490", color: "#fff", fontWeight: 700, cursor: "pointer" }}>تتبع</button>
          </form>
          {track && (
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                <div><b>#{track.id} — {track.customerName}</b> <span style={{ color: "#64748b", fontSize: 13 }}>{track.addressText}</span></div>
                <span style={{ background: "#fef9c3", color: "#854d0e", padding: "3px 12px", borderRadius: 999, fontSize: 13, fontWeight: 700 }}>{STATUS_AR[track.status] ?? track.status}</span>
              </div>
              {track.driverName && <div style={{ fontSize: 14, marginBottom: 12 }}>السائق: <b>{track.driverName}</b> {track.driverPhone ? `(${track.driverPhone})` : ""} · رسوم {track.feeEgp} ج.م</div>}
              <div style={{ display: "grid", gap: 10 }}>
                {track.events.map((ev, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 12, height: 12, borderRadius: 99, background: i === 0 ? "#0f766e" : "#94a3b8", marginTop: 5 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{ev.noteAr ?? ev.eventType}</div>
                      <div style={{ color: "#94a3b8", fontSize: 12 }}>{ev.createdAt ? String(ev.createdAt).slice(0, 19).replace("T", " ") : ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
