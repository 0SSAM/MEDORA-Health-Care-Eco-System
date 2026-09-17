/**
 * Icd11.tsx — صفحة البحث في رموز ICD-11 (التصنيف الدولي للأمراض، الإصدار 11).
 * عربية RTL، نمط Delivery.tsx (fetch مباشر لـ tRPC). مرجعية فقط.
 */
import { useCallback, useEffect, useState, type CSSProperties } from "react";

type Stats = { total: number; version: string | null; releaseDate: string | null; isStarter: boolean; available: boolean };
type Row = { code: string; titleEn: string; titleAr: string | null; chapter: string | null; version: string | null; isStarter: number };
type Chapter = { chapter: string | null; count: number };

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

export default function Icd11() {
  const [stats, setStats] = useState<Stats>({ total: 0, version: null, releaseDate: null, isStarter: false, available: false });
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [searched, setSearched] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const refreshStats = useCallback(async () => {
    try { setStats((await call("icd11.stats", {})) ?? stats); setErr(""); }
    catch (e: any) { setErr(String(e?.message ?? e)); }
  }, []);

  useEffect(() => { refreshStats(); }, [refreshStats]);

  const doSearch = async () => {
    if (!q.trim()) return;
    try {
      const r = await call("icd11.search", { q: q.trim(), limit: 50 });
      setRows(r ?? []); setSearched(true); setErr("");
    } catch (e: any) { setErr(String(e?.message ?? e)); }
  };

  const loadChapters = async () => {
    try { setChapters((await call("icd11.listChapters", {})) ?? []); setErr(""); }
    catch (e: any) { setErr(String(e?.message ?? e)); }
  };

  return (
    <main dir="rtl" style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "system-ui, sans-serif", color: "#0f172a" }}>
      <header style={{ background: "linear-gradient(135deg,#064e3b,#0f766e)", color: "#fff", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>🏥 ICD-11 — التصنيف الدولي للأمراض</h1>
        <div style={{ fontSize: 13, opacity: 0.92 }}>
          {stats.available
            ? <> {stats.total.toLocaleString()} رمزًا · {stats.version}{stats.isStarter ? " · (مجموعة ابتدائية)" : " · خطية كاملة"}</>
            : "قاعدة البيانات غير محمّلة بعد"}
        </div>
      </header>

      <div style={{ padding: 18, maxWidth: 1000, margin: "0 auto" }}>
        {stats.isStarter && stats.available && (
          <div style={{ background: "#fef3c7", color: "#92400e", padding: "10px 14px", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>
            ⚠️ هذه مجموعة ابتدائية من الرموز الشائعة (مرجعية فقط). الخطية الكاملة (نحو 55,000 رمز) تتطلب مفاتيح WHO ICD-API — زرّعها عبر <code>scripts/seed-icd11.mjs --data &lt;full.json&gt;</code>.
          </div>
        )}
        {err && <div style={{ background: "#fee2e2", color: "#7f1d1d", padding: "10px 14px", borderRadius: 8, marginBottom: 12 }}>⚠️ {err}</div>}
        {msg && <div style={{ background: "#dcfce7", color: "#14532d", padding: "10px 14px", borderRadius: 8, marginBottom: 12 }}>{msg}</div>}

        <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input style={{ ...inputStyle, flex: 1, minWidth: 220 }} placeholder="ابحث برمز أو اسم — مثال: BA00 أو hypertension" value={q}
              onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doSearch()} />
            <button onClick={doSearch} style={{ background: "#0f766e", color: "#fff", border: 0, borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontWeight: 700 }}>بحث</button>
            <button onClick={loadChapters} style={{ background: "#e2e8f0", color: "#0f172a", border: 0, borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600 }}>الفصول</button>
          </div>
        </section>

        {chapters.length > 0 && (
          <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, margin: "0 0 8px" }}>📚 الفصول المتاحة</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {chapters.map((c) => (
                <span key={c.chapter ?? "blank"} style={{ background: "#ecfdf5", color: "#065f46", borderRadius: 999, padding: "4px 10px", fontSize: 12 }}>
                  {c.chapter ?? "—"}: {c.count}
                </span>
              ))}
            </div>
          </section>
        )}

        {searched && (
          <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
            <h2 style={{ fontSize: 15, margin: "0 0 8px" }}>نتائج البحث ({rows.length})</h2>
            {rows.length === 0 && <div style={{ fontSize: 13, color: "#64748b" }}>لا نتائج — جرّب رمزًا أو اسمًا آخر.</div>}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc", textAlign: "right" }}>
                  <th style={{ padding: 8, borderBottom: "1px solid #e2e8f0" }}>الرمز</th>
                  <th style={{ padding: 8, borderBottom: "1px solid #e2e8f0" }}>العنوان (عربي)</th>
                  <th style={{ padding: 8, borderBottom: "1px solid #e2e8f0" }}>العنوان (إنجليزي)</th>
                  <th style={{ padding: 8, borderBottom: "1px solid #e2e8f0" }}>الفصل</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.code}>
                    <td style={{ padding: 8, borderBottom: "1px solid #f1f5f9", fontWeight: 700, color: "#0f766e" }}>{r.code}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f1f5f9" }}>{r.titleAr ?? "—"}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f1f5f9", direction: "ltr", textAlign: "left" }}>{r.titleEn}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f1f5f9" }}>{r.chapter ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 14 }}>
          مرجعية فقط — لا تغني عن الحكم السريري ولا تُنهي تشخيصًا أو مطالبة. المصدر: WHO ICD-11 (MMS).
        </p>
      </div>
    </main>
  );
}
