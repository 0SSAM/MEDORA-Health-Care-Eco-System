import { useState } from "react";
import { trpc } from "@/lib/trpc";

const S = { organizationId: 1, branchId: 1, jurisdictionId: 0 };

const statusLabel: Record<string, string> = {
  draft: "مسودة",
  in_review: "قيد الفحص",
  accepted: "مقبول",
  held: "محجوز",
  rejected: "مرفوض",
  rework: "إعادة تشغيل",
  released: "أُطلق",
};

export default function QualityCenterPage() {
  const [warehouseId, setWarehouseId] = useState(1);
  const [itemCode, setItemCode] = useState("PARA-500");
  const [batchNo, setBatchNo] = useState("B001");
  const [sampleSize, setSampleSize] = useState(10);
  const [inspectionId, setInspectionId] = useState<number | null>(null);
  const [acceptedUnits, setAcceptedUnits] = useState(10);
  const [rejectedUnits, setRejectedUnits] = useState(0);
  const [flash, setFlash] = useState("");

  const warehouses = trpc.supplyChain.warehouses.useQuery(S, { retry: false });
  const inspections = trpc.supplyChain.quality.list.useQuery(S, { retry: false });
  const create = trpc.supplyChain.quality.createInspection.useMutation({ onSuccess: (d) => { setInspectionId(d.inspectionId); setFlash(`تم إنشاء الفحص #${d.inspectionId}`); inspections.refetch(); } , onError: (e) => setFlash(e.message) });
  const start = trpc.supplyChain.quality.startReview.useMutation({ onSuccess: () => { setFlash("بدأت المراجعة"); inspections.refetch(); }, onError: (e) => setFlash(e.message) });
  const record = trpc.supplyChain.quality.recordResult.useMutation({ onSuccess: () => { setFlash("تم حفظ نتيجة العينة"); inspections.refetch(); }, onError: (e) => setFlash(e.message) });
  const decide = trpc.supplyChain.quality.decide.useMutation({ onSuccess: (d) => { setFlash(`تم القرار: ${statusLabel[d.status] ?? d.status}`); inspections.refetch(); }, onError: (e) => setFlash(e.message) });
  const release = trpc.supplyChain.quality.releaseHold.useMutation({ onSuccess: () => { setFlash("تم إطلاق الحجز بعد مراجعة مستقلة"); inspections.refetch(); }, onError: (e) => setFlash(e.message) });

  const selected = (inspections.data?.inspections ?? []).find((x: any) => x.id === inspectionId) ?? (inspections.data?.inspections ?? [])[0];

  return (
    <main dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-2xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-cyan-400">MEDORA / QMS</div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">مركز إدارة الجودة</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">فحص → نتيجة → قرار مستقل → حجز جودة → إطلاق مضبوط. كل خطوة مرتبطة بالنطاق التشغيلي ومخزون الفرع.</p>
            </div>
            <div className="rounded-xl border border-emerald-800/70 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">Fail-closed · Maker / Checker</div>
          </div>
        </header>

        {flash && <div role="status" className="rounded-xl border border-cyan-900 bg-cyan-950/30 px-4 py-3 text-sm text-cyan-200">{flash}</div>}

        <section className="grid gap-4 lg:grid-cols-[1fr_1.25fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold">إنشاء فحص</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-sm"><span className="text-slate-400">المخزن</span><select value={warehouseId} onChange={(e) => setWarehouseId(Number(e.target.value))} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2">{(warehouses.data?.warehouses ?? []).map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label>
              <label className="space-y-1 text-sm"><span className="text-slate-400">كود الصنف</span><input value={itemCode} onChange={(e) => setItemCode(e.target.value)} dir="ltr" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
              <label className="space-y-1 text-sm"><span className="text-slate-400">التشغيلة</span><input value={batchNo} onChange={(e) => setBatchNo(e.target.value)} dir="ltr" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
              <label className="space-y-1 text-sm"><span className="text-slate-400">حجم العينة</span><input type="number" min={1} value={sampleSize} onChange={(e) => setSampleSize(Number(e.target.value))} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
            </div>
            <button disabled={create.isPending} onClick={() => create.mutate({ ...S, warehouseId, itemCode, batchNo, sampleSize })} className="mt-4 w-full rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-medium hover:bg-cyan-500 disabled:opacity-50">{create.isPending ? "جارٍ الإنشاء…" : "إنشاء فحص جديد"}</button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">دورة القرار</h2>{selected && <span className="rounded-full bg-slate-800 px-3 py-1 text-xs">#{selected.id} · {statusLabel[selected.status] ?? selected.status}</span>}</div>
            {!selected ? <div className="mt-8 text-sm text-slate-500">أنشئ فحصاً أو اختر فحصاً من القائمة.</div> : <>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="space-y-1 text-sm"><span className="text-slate-400">مقبول</span><input type="number" min={0} value={acceptedUnits} onChange={(e) => setAcceptedUnits(Number(e.target.value))} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
                <label className="space-y-1 text-sm"><span className="text-slate-400">مرفوض</span><input type="number" min={0} value={rejectedUnits} onChange={(e) => setRejectedUnits(Number(e.target.value))} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {selected.status === "draft" && <button onClick={() => start.mutate({ ...S, inspectionId: selected.id })} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm">بدء المراجعة</button>}
                {selected.status === "in_review" && <button onClick={() => record.mutate({ ...S, inspectionId: selected.id, acceptedUnits, rejectedUnits })} className="rounded-lg bg-cyan-600 px-3 py-2 text-sm">حفظ النتيجة</button>}
                {selected.status === "in_review" && <><button onClick={() => decide.mutate({ ...S, inspectionId: selected.id, disposition: "release" })} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm">إطلاق</button><button onClick={() => decide.mutate({ ...S, inspectionId: selected.id, disposition: "hold" })} className="rounded-lg bg-amber-600 px-3 py-2 text-sm">حجز جودة</button><button onClick={() => decide.mutate({ ...S, inspectionId: selected.id, disposition: "reject" })} className="rounded-lg bg-rose-600 px-3 py-2 text-sm">رفض</button><button onClick={() => decide.mutate({ ...S, inspectionId: selected.id, disposition: "rework" })} className="rounded-lg bg-violet-600 px-3 py-2 text-sm">إعادة تشغيل</button></>}
                {selected.status === "held" && <button onClick={() => release.mutate({ ...S, inspectionId: selected.id, reason: "مراجعة مستقلة مكتملة" })} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm">إطلاق الحجز</button>}
              </div>
            </>}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">سجل الفحوص</h2><button onClick={() => inspections.refetch()} className="text-xs text-cyan-400 hover:text-cyan-300">تحديث</button></div>
          <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead className="text-right text-xs text-slate-500"><tr><th className="pb-3">#</th><th>الصنف</th><th>التشغيلة</th><th>العينة</th><th>مقبول</th><th>مرفوض</th><th>الحالة</th><th /></tr></thead><tbody>{(inspections.data?.inspections ?? []).map((x: any) => <tr key={x.id} className="border-t border-slate-800/80"><td className="py-3">{x.id}</td><td dir="ltr">{x.itemCode}</td><td dir="ltr">{x.batchNo ?? "—"}</td><td>{x.sampleSize}</td><td className="text-emerald-300">{x.acceptedUnits}</td><td className="text-rose-300">{x.rejectedUnits}</td><td><span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs">{statusLabel[x.status] ?? x.status}</span></td><td><button onClick={() => setInspectionId(x.id)} className="text-xs text-cyan-400">اختيار</button></td></tr>)}</tbody></table>{(inspections.data?.inspections ?? []).length === 0 && <div className="py-10 text-center text-sm text-slate-500">لا توجد فحوص مسجلة في هذا النطاق.</div>}</div>
        </section>
      </div>
    </main>
  );
}
