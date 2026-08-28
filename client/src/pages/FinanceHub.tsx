import { useState } from "react";
import { trpc } from "@/lib/trpc";
const S = { organizationId: 1, branchId: 1, jurisdictionId: 0 };

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
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      <h1 className="text-2xl font-bold">المركز المالي</h1>
      {flash && <div className="rounded bg-slate-800 px-4 py-2 text-sm" data-testid="flash">{flash}</div>}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <h2 className="font-semibold mb-2">قيد يومية (مزدوج)</h2>
          <input value={memo} onChange={(e) => setMemo(e.target.value)} className="w-full bg-slate-800 rounded px-3 py-2 mb-2 text-sm" placeholder="البيان" />
          <div className="flex gap-2 mb-2">
            <select value={dAcc} onChange={(e) => setDAcc(e.target.value)} className="flex-1 bg-slate-800 rounded px-2 py-2 text-sm">
              {(coa.data?.accounts ?? []).map((a: any) => <option key={a.code} value={a.code}>{a.code} — {a.nameAr} (مدين)</option>)}
            </select>
            <select value={cAcc} onChange={(e) => setCAcc(e.target.value)} className="flex-1 bg-slate-800 rounded px-2 py-2 text-sm">
              {(coa.data?.accounts ?? []).map((a: any) => <option key={a.code} value={a.code}>{a.code} — {a.nameAr} (دائن)</option>)}
            </select>
          </div>
          <input type="number" value={amt} onChange={(e) => setAmt(Number(e.target.value))} className="w-full bg-slate-800 rounded px-3 py-2 mb-2 text-sm" />
          <button data-testid="post-journal" onClick={() => post.mutate({ ...S, memo, lines: [{ accountCode: dAcc, debit: amt, credit: 0 }, { accountCode: cAcc, debit: 0, credit: amt }] })}
            className="w-full px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-sm">ترحيل القيد</button>
        </div>

        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <h2 className="font-semibold mb-2">تسجيل دفعة</h2>
          <div className="flex gap-2 mb-2">
            <button onClick={() => setPayDir("in")} className={"flex-1 py-2 rounded text-sm " + (payDir === "in" ? "bg-cyan-600" : "bg-slate-800")}>قبض</button>
            <button onClick={() => setPayDir("out")} className={"flex-1 py-2 rounded text-sm " + (payDir === "out" ? "bg-rose-600" : "bg-slate-800")}>صرف</button>
          </div>
          <input type="number" value={payAmt} onChange={(e) => setPayAmt(Number(e.target.value))} className="w-full bg-slate-800 rounded px-3 py-2 mb-2 text-sm" />
          <button data-testid="record-payment" onClick={() => pay.mutate({ ...S, direction: payDir, amount: payAmt, method: "cash" })}
            className="w-full px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-sm">تسجيل</button>
          <div className="mt-3 text-sm space-y-1">
            <div>قبض: <b>{cash.data?.inflow ?? 0}</b> ج.م</div>
            <div>صرف: <b>{cash.data?.outflow ?? 0}</b> ج.م</div>
            <div className={(cash.data?.net ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"}>الصافي: <b>{cash.data?.net ?? 0}</b> ج.م</div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 md:row-span-2">
          <h2 className="font-semibold mb-2">ميزان المراجعة</h2>
          <div className="text-xs space-y-1 max-h-96 overflow-auto">
            {(tb.data?.rows ?? []).map((r: any) => (
              <div key={r.code} className="flex justify-between border-b border-slate-800 py-1">
                <span>{r.code} {r.nameAr}</span>
                <span dir="ltr" className={r.balance >= 0 ? "text-emerald-300" : "text-rose-300"}>{r.balance}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
