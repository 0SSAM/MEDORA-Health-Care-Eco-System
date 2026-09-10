import { useState } from "react";
import { trpc } from "@/lib/trpc";
const S = { organizationId: 1, branchId: 1, jurisdictionId: 0 };

export default function SupplyHubPage() {
  const [item, setItem] = useState("PARA-500");
  const [qty, setQty] = useState(100);
  const [batch, setBatch] = useState("B001");
  const [expiry, setExpiry] = useState("2026-12-31");
  const [flash, setFlash] = useState("");
  const [poQty, setPoQty] = useState(50);
  const [poCost, setPoCost] = useState(12.5);

  const wh = trpc.supplyChain.warehouses.useQuery(S, { retry: false });
  const levels = trpc.supplyChain.stockLevels.useQuery(S, { retry: false });
  const expiring = trpc.supplyChain.expiringSoon.useQuery({ ...S, days: 180 }, { retry: false });
  const pos = trpc.purchasing.listPurchaseOrders.useQuery(S, { retry: false });
  const suppliers = trpc.purchasing.suppliers.useQuery(S, { retry: false });

  const move = trpc.supplyChain.moveStock.useMutation({
    onSuccess: (d) => { setFlash(`✓ حركة رقم ${d.movementId}`); levels.refetch(); expiring.refetch(); },
    onError: (e) => setFlash("✗ " + e.message),
  });
  const createPo = trpc.purchasing.createPurchaseOrder.useMutation({
    onSuccess: (d) => { setFlash(`✓ أمر شراء ${d.orderNumber} بإجمالي ${d.totalAmount}`); pos.refetch(); },
    onError: (e) => setFlash("✗ " + e.message),
  });
  const approvePo = trpc.purchasing.approvePurchaseOrder.useMutation({ onSuccess: () => { setFlash("✓ اعتُمد"); pos.refetch(); }, onError: (e) => setFlash("✗ " + e.message) });
  const receivePo = trpc.purchasing.receivePurchaseOrder.useMutation({
    onSuccess: (d) => { setFlash(`✓ استلام (${d.status}) سند رقم ${d.goodsReceiptId}`); pos.refetch(); levels.refetch(); },
    onError: (e) => setFlash("✗ " + e.message),
  });

  const firstWh = (wh.data?.warehouses ?? [])[0]?.id ?? 1;
  const firstSupplier = (suppliers.data?.suppliers ?? [])[0]?.id ?? 1;

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      <h1 className="text-2xl font-bold">سلسلة الإمداد والمشتريات</h1>
      {flash && <div className="rounded bg-slate-800 px-4 py-2 text-sm" data-testid="flash">{flash}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <h2 className="font-semibold mb-2">حركة مخزون (وارد/تشغيلة)</h2>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input value={item} onChange={(e) => setItem(e.target.value)} className="bg-slate-800 rounded px-3 py-2 text-sm" dir="ltr" placeholder="كود الصنف" />
            <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="bg-slate-800 rounded px-3 py-2 text-sm" placeholder="الكمية" />
            <input value={batch} onChange={(e) => setBatch(e.target.value)} className="bg-slate-800 rounded px-3 py-2 text-sm" dir="ltr" placeholder="التشغيلة" />
            <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="bg-slate-800 rounded px-3 py-2 text-sm" dir="ltr" />
          </div>
          <button data-testid="stock-in" onClick={() => move.mutate({ ...S, warehouseId: firstWh, itemCode: item, qty, direction: "in", batchNo: batch, expiryDate: expiry, reason: "وارد" })}
            className="w-full px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-sm">إدخال وارد</button>
        </div>

        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <h2 className="font-semibold mb-2">أمر شراء جديد</h2>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input type="number" value={poQty} onChange={(e) => setPoQty(Number(e.target.value))} className="bg-slate-800 rounded px-3 py-2 text-sm" placeholder="كمية" />
            <input type="number" value={poCost} onChange={(e) => setPoCost(Number(e.target.value))} className="bg-slate-800 rounded px-3 py-2 text-sm" placeholder="تكلفة الوحدة" />
          </div>
          <button data-testid="create-po" onClick={() => createPo.mutate({ ...S, supplierId: firstSupplier, lines: [{ productId: 1, orderedQuantity: poQty, unitCost: poCost }] })}
            className="w-full px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-sm">إنشاء أمر شراء</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <h2 className="font-semibold mb-2">أوامر الشراء</h2>
          <div className="text-sm space-y-2 max-h-64 overflow-auto">
            {(pos.data?.orders ?? []).map((o: any) => (
              <div key={o.id} className="flex items-center justify-between border-b border-slate-800 py-1">
                <span dir="ltr">{o.orderNumber}</span>
                <span>{o.supplier}</span>
                <span dir="ltr">{o.totalAmount} {o.currencyCode}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800">{o.status}</span>
                {o.status === "draft" && <button data-testid={`approve-${o.id}`} onClick={() => approvePo.mutate({ ...S, purchaseOrderId: o.id })} className="text-xs px-2 py-1 rounded bg-amber-600">اعتماد</button>}
                {o.status === "approved" && <button data-testid={`receive-${o.id}`} onClick={() => receivePo.mutate({ ...S, purchaseOrderId: o.id, warehouseId: firstWh, receipts: [{ productId: 1, itemCode: item, qty: 1, batchNo: batch, expiryDate: expiry }] })} className="text-xs px-2 py-1 rounded bg-emerald-600">استلام</button>}
              </div>
            ))}
            {(pos.data?.orders ?? []).length === 0 && <div className="text-slate-500 text-xs">لا أوامر بعد</div>}
          </div>
        </div>

        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <h2 className="font-semibold mb-2">قرب انتهاء الصلاحية (FEFO)</h2>
          <div className="text-sm space-y-1 max-h-64 overflow-auto">
            {(expiring.data?.batches ?? []).map((b: any, i: number) => (
              <div key={i} className="flex justify-between border-b border-slate-800 py-1">
                <span dir="ltr">{b.itemCode} / {b.batchNo}</span>
                <span dir="ltr">{String(b.expiryDate).slice(0, 10)}</span>
                <span className="text-amber-300">{b.remaining}</span>
              </div>
            ))}
            {(expiring.data?.batches ?? []).length === 0 && <div className="text-slate-500 text-xs">لا تشغيلات قريبة الانتهاء</div>}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
        <h2 className="font-semibold mb-2">أرصدة المخازن</h2>
        <div className="text-sm space-y-1">
          {(levels.data?.levels ?? []).map((l: any, i: number) => (
            <div key={i} className="flex justify-between border-b border-slate-800 py-1">
              <span>{l.warehouse}</span><span dir="ltr">{l.itemCode}</span><b>{l.onHand}</b>
            </div>
          ))}
          {(levels.data?.levels ?? []).length === 0 && <div className="text-slate-500 text-xs">لا حركات بعد</div>}
        </div>
      </div>
    </div>
  );
}
