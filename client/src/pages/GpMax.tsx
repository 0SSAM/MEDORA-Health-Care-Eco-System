/**
 * GpMax.tsx — لوحة تدقيق النمو GP MAX (L0–L7): الطبقات | التدقيق | النتائج | خطة 30 يوم.
 * نمط Delivery.tsx: fetch مباشر لموجّه tRPC بدون خطافات داخلية، organizationId من local storage.
 */
import { useCallback, useEffect, useState, type CSSProperties } from "react";

type Layer = { id: number; layerCode: string; layerNameAr: string; layerNameEn: string; description?: string; sortOrder: number };
type Checkpoint = { id: number; code: string; layerCode: string; titleAr: string; titleEn: string; category?: string; weight: number; passingCriteria?: string };
type Rec = { id: number; assessmentId: number; checkpointId?: number; priority: string; recommendationAr?: string; resolved: number };
type Assessment = { id: number; status: string; score: number; summary?: string; createdAt?: string; recommendations?: Rec[] };
type PlanWeek = { week: number; title: string; items: { id: number; priority: string; recommendationAr?: string }[] };

const LAYER_AR: Record<string, string> = { L0: "الأساس", L1: "الظهور", L2: "الجذب", L3: "التحويل", L4: "الإيرادات", L5: "التوسع", L6: "التحسين", L7: "تشغيل النمو" };

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

export default function GpMax() {
  const [tab, setTab] = useState<"layers" | "audit" | "results" | "plan">("layers");
  const [layers, setLayers] = useState<Layer[]>([]);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [report, setReport] = useState<string>("");
  const [perLayer, setPerLayer] = useState<Record<string, { met: number; total: number; score: number }>>({});
  const [plan, setPlan] = useState<PlanWeek[]>([]);
  const [planNote, setPlanNote] = useState<string>("");
  const [msg, setMsg] = useState<string>("");
  const [err, setErr] = useState<string>("");

  const refresh = useCallback(async () => {
    try {
      const oid = orgId();
      const [l, c] = await Promise.all([
        call("gpMax.listLayers", {}),
        call("gpMax.listCheckpoints", {}),
      ]);
      setLayers(l ?? []);
      setCheckpoints(c ?? []);
      setErr("");
      const latest = await call("gpMax.latestAssessment", { organizationId: oid });
      if (latest) { setAssessment(latest); try { setPerLayer(JSON.parse(latest.summary ?? "{}")); } catch { setPerLayer({}); } }
    } catch (e: any) { setErr(String(e?.message ?? e)); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const act = async (fn: () => Promise<any>, okMsg: string) => {
    try { const r = await fn(); setMsg(okMsg); setErr(""); return r; }
    catch (e: any) { setErr(String(e?.message ?? e)); return null; }
    finally { setTimeout(() => setMsg(""), 5000); }
  };

  const runAudit = async () => {
    const oid = orgId();
    const r = await act(async () => call("gpMax.runAssessment", { organizationId: oid, answers }), "اكتمل التدقيق ✅");
    if (r) { setReport(r.reportMarkdown); setPerLayer(r.perLayer); setAssessment({ id: r.assessmentId, status: "completed", score: r.overall }); await refresh(); setTab("results"); }
  };

  const doPlan = async () => {
    const oid = orgId();
    const r = await act(async () => call("gpMax.generate30DayPlan", { organizationId: oid, weeks: 4 }), "تم توليد خطة 30 يومًا ✅");
    if (r) { setPlan(r.plan ?? []); setPlanNote(r.note ?? ""); setTab("plan"); }
  };

  const resolveRec = async (id: number) => {
    await act(async () => call("gpMax.resolveRecommendation", { id }), "أُغلقت التوصية ✅");
    await refresh();
    const oid = orgId();
    const latest = await call("gpMax.latestAssessment", { organizationId: oid });
    if (latest) setAssessment(latest);
  };

  const allLayers = Array.from(new Set(checkpoints.map((c) => c.layerCode))).sort();

  return (
    <main dir="rtl" style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "system-ui, sans-serif", color: "#0f172a" }}>
      <header style={{ background: "linear-gradient(135deg,#0d1b2a,#1b4965)", color: "#fff", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>📈 تدقيق النمو GP MAX</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {["layers", "audit", "results", "plan"].map((t) => (
            <button key={t} onClick={() => setTab(t as any)} style={{ background: tab === t ? "#24a0ed" : "rgba(255,255,255,.12)", color: "#fff", border: 0, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 600 }}>
              {t === "layers" ? "الطبقات" : t === "audit" ? "تدقيق جديد" : t === "results" ? "النتائج" : "خطة 30 يوم"}
            </button>
          ))}
        </div>
      </header>

      <div style={{ padding: 18, maxWidth: 1000, margin: "0 auto" }}>
        {msg && <div style={{ background: "#dcfce7", color: "#14532d", padding: "10px 14px", borderRadius: 8, marginBottom: 12 }}>{msg}</div>}
        {err && <div style={{ background: "#fee2e2", color: "#7f1d1d", padding: "10px 14px", borderRadius: 8, marginBottom: 12 }}>⚠️ {err}</div>}

        {tab === "layers" && (
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
            {layers.map((l) => (
              <div key={l.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 13, color: "#0369a1", fontWeight: 700 }}>{l.layerCode} — {l.layerNameEn}</div>
                <div style={{ fontSize: 17, fontWeight: 800, margin: "4px 0" }}>{l.layerNameAr}</div>
                <div style={{ fontSize: 12, color: "#475569" }}>{l.description}</div>
                <div style={{ fontSize: 12, color: "#0369a1", marginTop: 6 }}>{checkpoints.filter((c) => c.layerCode === l.layerCode).length} نقطة فحص</div>
              </div>
            ))}
          </section>
        )}

        {tab === "audit" && (
          <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
            <h2 style={{ fontSize: 18, margin: "0 0 6px" }}>🧾 التدقيق التفاعلي</h2>
            <p style={{ fontSize: 13, color: "#475569", margin: "0 0 14px" }}>علّم ما تم إنجازه فعليًا لكل نقطة فحص — والدرجة تُحسب تلقائيًا (0–100 لكل طبقة).</p>
            {allLayers.map((lc) => (
              <fieldset key={lc} style={{ border: "1px solid #e2e8f0", borderRadius: 10, marginBottom: 12, padding: "10px 12px" }}>
                <legend style={{ fontWeight: 800, fontSize: 14, color: "#0d1b2a", padding: "0 6px" }}>{lc} — {LAYER_AR[lc] ?? lc}</legend>
                {checkpoints.filter((c) => c.layerCode === lc).map((c) => (
                  <label key={c.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 0", cursor: "pointer", fontSize: 14 }}>
                    <input type="checkbox" style={{ marginTop: 3, width: 16, height: 16 }} checked={answers[c.code] ?? false}
                      onChange={(e) => setAnswers((p) => ({ ...p, [c.code]: e.target.checked }))} />
                    <span><b>{c.titleAr}</b> <span style={{ color: "#64748b", fontSize: 12 }}>— {c.code} · وزن {c.weight}</span></span>
                  </label>
                ))}
              </fieldset>
            ))}
            <button onClick={runAudit} style={{ background: "#0d1b2a", color: "#fff", border: 0, borderRadius: 10, padding: "12px 24px", fontSize: 15, cursor: "pointer", fontWeight: 700 }}>تشغيل التدقيق وحساب الدرجة</button>
          </section>
        )}

        {tab === "results" && (
          <section style={{ display: "grid", gap: 12 }}>
            {assessment && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span style={{ fontSize: 13, color: "#475569" }}>الدرجة الكلية</span>
                  <span style={{ fontSize: 34, fontWeight: 900, color: (assessment.score ?? 0) >= 70 ? "#15803d" : (assessment.score ?? 0) >= 40 ? "#b45309" : "#b91c1c" }}>{assessment.score ?? "—"}/100</span>
                </div>
                {Object.entries(perLayer).map(([lc, v]) => (
                  <div key={lc} style={{ marginTop: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span><b>{lc} — {LAYER_AR[lc] ?? lc}</b> ({v.met}/{v.total})</span>
                      <span>{v.score}/100</span>
                    </div>
                    <div style={{ background: "#e2e8f0", borderRadius: 6, height: 8, marginTop: 3 }}>
                      <div style={{ background: v.score >= 70 ? "#22c55e" : v.score >= 40 ? "#f59e0b" : "#ef4444", width: `${v.score}%`, height: 8, borderRadius: 6 }} />
                    </div>
                  </div>
                ))}
                {report && <pre style={{ background: "#0f172a", color: "#e2e8f0", borderRadius: 10, padding: 14, fontSize: 12, whiteSpace: "pre-wrap", direction: "rtl", marginTop: 12 }}>{report}</pre>}
              </div>
            )}
            {assessment?.recommendations && assessment.recommendations.length > 0 && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
                <h3 style={{ margin: "0 0 10px", fontSize: 16 }}>🎯 التوصيات ({assessment.recommendations.filter((r) => !r.resolved).length} مفتوحة)</h3>
                {assessment.recommendations.map((r) => (
                  <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", padding: "8px 0" }}>
                    <span style={{ fontSize: 13 }}><b style={{ color: r.priority === "P0" ? "#b91c1c" : r.priority === "P1" ? "#b45309" : "#0369a1" }}>{r.priority}</b> {r.recommendationAr}</span>
                    {r.resolved ? <span style={{ color: "#15803d", fontSize: 12 }}>✔ منفّذة</span> : <button onClick={() => resolveRec(r.id)} style={{ background: "#e0f2fe", color: "#0369a1", border: 0, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 12 }}>إغلاق</button>}
                  </div>
                ))}
              </div>
            )}
            <button onClick={doPlan} style={{ background: "#0d1b2a", color: "#fff", border: 0, borderRadius: 10, padding: "12px 24px", fontSize: 15, cursor: "pointer", fontWeight: 700 }}>توليد خطة 30 يومًا</button>
          </section>
        )}

        {tab === "plan" && (
          <section style={{ display: "grid", gap: 12 }}>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
              <h2 style={{ fontSize: 18, margin: "0 0 4px" }}>🗓️ خطة 30 يومًا</h2>
              <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{planNote}</p>
            </div>
            {plan.map((w) => (
              <div key={w.week} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
                <h3 style={{ margin: "0 0 8px", fontSize: 15, color: "#0d1b2a" }}>📅 {w.title}</h3>
                {w.items.length === 0 ? <span style={{ fontSize: 13, color: "#94a3b8" }}>لا بنود</span> :
                  w.items.map((it) => (
                    <div key={it.id} style={{ borderTop: "1px solid #f1f5f9", padding: "7px 0", fontSize: 13, display: "flex", gap: 8 }}>
                      <b style={{ color: "#0369a1" }}>{it.priority}</b> <span>{it.recommendationAr}</span>
                    </div>
                  ))}
              </div>
            ))}
            {plan.length === 0 && !planNote && <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, fontSize: 13 }}>شغّل تدقيقًا أولًا ثم ولّد الخطة.</div>}
          </section>
        )}
      </div>
    </main>
  );
}
