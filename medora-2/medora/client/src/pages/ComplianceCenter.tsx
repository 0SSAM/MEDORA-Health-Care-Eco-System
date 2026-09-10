import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { armCaptureProtection } from "@/lib/captureProtection";

const S = { organizationId: 1, branchId: 1, jurisdictionId: 0 };

export default function ComplianceCenterPage() {
  const [raw, setRaw] = useState("(01)06221234567890(17)281231(10)B123(21)S9F3");
  const [parsed, setParsed] = useState<any>(null);
  const [captureArmed, setCaptureArmed] = useState(false);
  const [attempts, setAttempts] = useState<string[]>([]);

  const readiness = trpc.pharmacyProfile.readiness.useQuery(S, { retry: false });
  const caps = trpc.pharmacyProfile.capabilities.useQuery(S, { retry: false });
  const gahar = trpc.pharmacyProfile.gaharReadiness.useQuery(S, { retry: false });
  const dm = trpc.pharmacyProfile.parseDataMatrix.useMutation({
    onSuccess: (d) => setParsed(d),
  });

  const wm = useMemo(() => `MEDORA•u1•o1•${new Date().toISOString().slice(0, 10)}`, []);
  useEffect(() => {
    if (!captureArmed) return;
    const off = armCaptureProtection({
      watermarkText: wm,
      onAttempt: (k) => setAttempts((a) => [`${new Date().toLocaleTimeString()} ${k}`, ...a].slice(0, 8)),
    });
    return off;
  }, [captureArmed, wm]);

  const modeLabel = (m?: string) =>
    m === "hospital_pharmacy" ? "صيدلية مستشفى" : m === "pharmacy_chain" ? "سلسلة صيدليات" : "صيدلية مفردة";

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مركز الجاهزية والامتثال</h1>
          <p className="text-slate-400 text-sm">
            النمط: <b>{modeLabel(readiness.data?.mode)}</b> · الفروع النشطة: <b>{readiness.data?.branchCount ?? 1}</b>
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-600/20 text-emerald-300 text-sm">GAHAR {gahar.data?.score ?? "…"}%</span>
      </header>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-900 p-4 border border-slate-800">
          <h2 className="font-semibold mb-2">DataMatrix — فحص عبوة دواء</h2>
          <div className="flex gap-2">
            <input value={raw} onChange={(e) => setRaw(e.target.value)}
              className="flex-1 bg-slate-800 rounded px-3 py-2 font-mono text-xs" dir="ltr" />
            <button onClick={() => dm.mutate({ ...S, raw })}
              className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-sm">تحقق</button>
          </div>
          {parsed && (
            <div className="mt-3 text-sm space-y-1">
              <div>GTIN: <code dir="ltr">{parsed.gtin ?? "—"}</code></div>
              <div>الصلاحية: <code dir="ltr">{parsed.expiry ?? "—"}</code></div>
              <div>التشغيلة: <code dir="ltr">{parsed.batch ?? "—"}</code></div>
              <div>التسلسلي: <code dir="ltr">{parsed.serial ?? "—"}</code></div>
              <div className={parsed.valid ? "text-emerald-400" : "text-rose-400"}>
                {parsed.valid ? "✓ صالح ومسجل" : "✗ غير مكتمل: " + (parsed.errors?.join(", ") ?? "")}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-slate-900 p-4 border border-slate-800">
          <h2 className="font-semibold mb-2">حماية الشاشة (لقطات / تسجيل)</h2>
          <button data-testid="toggle-capture"
            onClick={() => setCaptureArmed((v) => !v)}
            className={"px-4 py-2 rounded text-sm " + (captureArmed ? "bg-rose-600" : "bg-emerald-600")}>
            {captureArmed ? "إيقاف الحماية" : "تفعيل الحماية"}
          </button>
          <p className="text-xs text-slate-400 mt-2 leading-6">
            عند التفعيل: تمويه فوري عند فقدان التركيز، منع PrintScreen والاختصارات، منع النسخ،
            وعلامة مائية دوّارة باسم المستخدم لجعل أي صورة مسرّبة قابلة للتتبع. (كاميرا هاتف خارجية لا يمكن حجبها 100% — لذا التتبع والتدقيق).
          </p>
          <div className="mt-2 text-xs text-amber-300 space-y-0.5" data-testid="capture-attempts">
            {attempts.map((a, i) => <div key={i}>⚠ {a}</div>)}
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-slate-900 p-4 border border-slate-800">
        <h2 className="font-semibold mb-3">معايير GAHAR</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(readiness.data?.standards ?? []).map((st: any) => (
            <div key={st.code} className={"rounded-lg p-3 border " + (st.covered ? "border-emerald-700 bg-emerald-950/30" : "border-amber-700 bg-amber-950/20")}>
              <div className="text-sm font-bold" dir="ltr">{st.code}</div>
              <div className="text-sm">{st.titleAr}</div>
              <div className={"text-xs mt-1 " + (st.covered ? "text-emerald-400" : "text-amber-400")}>
                {st.covered ? "✓ مغطى بالكامل" : "… فجوة متبقية"}
              </div>
            </div>
          ))}
        </div>
        {gahar.data && gahar.data.gaps.length > 0 && (
          <div className="mt-3 text-xs text-amber-300">
            فجوات: {gahar.data.gaps.map((g: any) => `${g.code}(${g.missing.join("+")})`).join(" · ")}
          </div>
        )}
      </section>

      <section className="rounded-xl bg-slate-900 p-4 border border-slate-800">
        <h2 className="font-semibold mb-3">مصفوفة القدرات حسب النمط</h2>
        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <CapCard title="صيدلية مفردة" data={caps.data?.capabilities?.single_pharmacy} active={readiness.data?.mode === "single_pharmacy"} />
          <CapCard title="سلسلة صيدليات" data={caps.data?.capabilities?.pharmacy_chain} active={readiness.data?.mode === "pharmacy_chain"} />
          <CapCard title="صيدلية مستشفى" data={caps.data?.capabilities?.hospital_pharmacy} active={readiness.data?.mode === "hospital_pharmacy"} />
        </div>
      </section>
    </div>
  );
}

function CapCard({ title, data, active }: { title: string; data?: Record<string, boolean>; active?: boolean }) {
  return (
    <div className={"rounded-lg p-3 border " + (active ? "border-cyan-600 bg-cyan-950/20" : "border-slate-700 bg-slate-800/40")}>
      <div className="font-bold mb-1 flex items-center gap-2">{title}{active && <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-700">النمط الحالي</span>}</div>
      <ul className="space-y-1">
        {Object.entries(data ?? {}).map(([k, v]) => (
          <li key={k} className={v ? "text-emerald-300" : "text-slate-500"} dir="ltr">{v ? "✓" : "✗"} {k}</li>
        ))}
      </ul>
    </div>
  );
}
