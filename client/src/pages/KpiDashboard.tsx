import { useEffect, useState } from "react";
const S = { wrap: { maxWidth: 920, margin: "0 auto", padding: 16, background: "#f8fafc", minHeight: "100vh", fontFamily: "'Segoe UI', Tahoma, sans-serif" } as const, card: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 16 } as const, btn: { width: "100%", border: 0, borderRadius: 10, padding: "14px 0", fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 8 } as const };
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
interface Kpi { code: string; nameAr: string; value: number; target: number; unit: string; achieved: boolean; achievedPct: number; }
export default function KpiDashboard() {
  const scope: Scope = { organizationId: 1, branchId: 1, jurisdictionId: 0 };
  const [kpis, setKpis] = useState<Kpi[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [defs, setDefs] = useState<string[]>([]);
  useEffect(() => {
    q<{ kpis: Kpi[]; generatedAt: string }>("kpi.dashboard", scope).then((d) => setKpis(d.kpis)).catch((e) => setErr(String((e as Error)?.message ?? e).slice(0, 160)));
    q<{ definitions: Array<{ code: string }> }>("kpi.definitions", scope).then((d) => setDefs((d.definitions ?? []).map((x) => x.code))).catch(() => {});
  }, []);
  return (
    <div style={S.wrap}>
      <div style={{ textAlign: "center", padding: "10px 0 16px" }}>
        <h2 style={{ margin: 0, color: "#0d1b2a" }}>لوحة مؤشرات الأداء KPI</h2>
        <div style={{ color: "#64748b", fontSize: 13 }}>قيم محسوبة من البيانات الحية</div>
      </div>
      {err && <div style={{ ...S.card, background: "#fef2f2", color: "#991b1b" }}>تعذر تحميل المؤشرات: {err}</div>}
      {!kpis && !err && <div style={{ ...S.card, color: "#64748b" }}>جارٍ حساب المؤشرات…</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
        {(kpis ?? []).map((k) => (
          <div key={k.code} style={S.card}>
            <div style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>{k.nameAr}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#0d1b2a", margin: "6px 0" }}>{k.value} <span style={{ fontSize: 13, fontWeight: 500, color: "#64748b" }}>{k.unit}</span></div>
            <div style={{ fontSize: 12, color: "#64748b" }}>الهدف: {k.target} · الإنجاز {k.achievedPct}%</div>
            <div style={{ marginTop: 8 }}><span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: k.achieved ? "#dcfce7" : "#fee2e2", color: k.achieved ? "#166534" : "#991b1b" }}>{k.achieved ? "✔ محقق" : "✖ دون الهدف"}</span></div>
          </div>
        ))}
      </div>
      <div style={{ ...S.card, marginTop: 14 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>التعاريف (المصادر)</div>
        <div style={{ fontSize: 13, color: "#334155" }}>{defs.join(" · ") || "لا توجد تعريفات"}</div>
      </div>
    </div>
  );
}