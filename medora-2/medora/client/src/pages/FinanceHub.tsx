import { useState } from "react";
import { trpc } from "@/lib/trpc";

const S = { organizationId: 1, branchId: 1, jurisdictionId: 0 };

const surface = "rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] backdrop-blur";
const field = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200";

export default function FinanceHubPage() {
  const [memo, setMemo] = useState("قيد يومية");
  const [dAcc, setDAcc] = useState("1100");
  const [cAcc, setCAcc] = useState("4100");
  const [amt, setAmt] = useState(500);
  const [payDir, setPayDir] = useState<"in" | "out">("in");
  const [payAmt, setPayAmt] = useState(300);
  const [flash, setFlash] = useState("");

  const coa = trpc.finance.chartOfAccounts.useQuery(S, { retry: false });
  const tb = trpc.finance.trialBalance.useQuery(S, { retry: false });
  const cash = trpc.finance.cashPosition.useQuery(S, { retry: false });
  const post = trpc.finance.postJournal.useMutation({
    onSuccess: (d) => { setFlash(`✓ قيد رقم ${d.journalEntryId} بإجمالي ${d.total}`); tb.refetch(); },
    onError: (e) => setFlash("✗ " + e.message),
  });
  const pay = trpc.finance.recordPayment.useMutation({
    onSuccess: (d) => { setFlash(`✓ دفعة رقم ${d.paymentId}`); cash.refetch(); },
    onError: (e) => setFlash("✗ " + e.message),
  });

  return (
    <main dir="rtl" className="min-h-screen bg-[linear-gradient(145deg,#f7f9fb,#eef2f5)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">MEDORA / FINANCE</div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">المركز المالي</h1>
            <p className="mt-1 text-sm text-slate-500">قيود مزدوجة، حركة نقدية وميزان مراجعة ضمن النطاق المؤسسي المحدد.</p>
          </div>
          <div className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600">EGP · Branch {S.branchId}</div>
        </header>

        {flash && <div role="status" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium shadow-sm">{flash}</div>}

        <section className="grid gap-5 lg:grid-cols-3">
          <div className={surface}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div><h2 className="font-semibold text-slate-950">قيد يومية</h2><p className="mt-1 text-xs text-slate-500">Double-entry posting</p></div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">GL</span>
            </div>
            <div className="space-y-3">
              <input value={memo} onChange={(e) => setMemo(e.target.value)} className={field} placeholder="البيان" />
              <div className="grid gap-2 sm:grid-cols-2">
                <select value={dAcc} onChange={(e) => setDAcc(e.target.value)} className={field}>
                  {(coa.data?.accounts ?? []).map((a: any) => <option key={a.code} value={a.code}>{a.code} — {a.nameAr} (مدين)</option>)}
                </select>
                <select value={cAcc} onChange={(e) => setCAcc(e.target.value)} className={field}>
                  {(coa.data?.accounts ?? []).map((a: any) => <option key={a.code} value={a.code}>{a.code} — {a.nameAr} (دائن)</option>)}
                </select>
              </div>
              <input type="number" min="0" value={amt} onChange={(e) => setAmt(Number(e.target.value))} className={field} aria-label="مبلغ القيد" />
              <button disabled={post.isPending} data-testid="post-journal" onClick={() => post.mutate({ ...S, memo, lines: [{ accountCode: dAcc, debit: amt, credit: 0 }, { accountCode: cAcc, debit: 0, credit: amt }] })} className="w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
                {post.isPending ? "جارٍ الترحيل…" : "ترحيل القيد"}
              </button>
            </div>
          </div>

          <div className={surface}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div><h2 className="font-semibold text-slate-950">النقدية والمدفوعات</h2><p className="mt-1 text-xs text-slate-500">Cash movement</p></div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">CASH</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setPayDir("in")} className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${payDir === "in" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-600"}`}>قبض</button>
              <button onClick={() => setPayDir("out")} className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${payDir === "out" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-600"}`}>صرف</button>
            </div>
            <input type="number" min="0" value={payAmt} onChange={(e) => setPayAmt(Number(e.target.value))} className={`${field} mt-3`} aria-label="مبلغ الدفع" />
            <button disabled={pay.isPending} data-testid="record-payment" onClick={() => pay.mutate({ ...S, direction: payDir, amount: payAmt, method: "cash" })} className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:opacity-50">{pay.isPending ? "جارٍ الحفظ…" : "تسجيل الحركة"}</button>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-slate-50 p-3"><div className="text-slate-500">قبض</div><b className="mt-1 block text-slate-950">{cash.data?.inflow ?? 0}</b></div>
              <div className="rounded-xl bg-slate-50 p-3"><div className="text-slate-500">صرف</div><b className="mt-1 block text-slate-950">{cash.data?.outflow ?? 0}</b></div>
              <div className="rounded-xl bg-slate-950 p-3 text-white"><div className="text-slate-300">الصافي</div><b className="mt-1 block">{cash.data?.net ?? 0}</b></div>
            </div>
          </div>

          <div className={`${surface} lg:row-span-2`}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div><h2 className="font-semibold text-slate-950">ميزان المراجعة</h2><p className="mt-1 text-xs text-slate-500">Trial balance · live query</p></div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">TB</span>
            </div>
            <div className="max-h-[34rem] space-y-1 overflow-auto pr-1 text-xs">
              {(tb.data?.rows ?? []).map((r: any) => (
                <div key={r.code} className="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5">
                  <span className="min-w-0 truncate font-medium text-slate-700">{r.code} {r.nameAr}</span>
                  <span dir="ltr" className="shrink-0 font-semibold text-slate-900">{r.balance}</span>
                </div>
              ))}
              {!tb.data?.rows?.length && <div className="rounded-xl bg-slate-50 p-6 text-center text-slate-500">لا توجد أرصدة لعرضها ضمن النطاق الحالي.</div>}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
