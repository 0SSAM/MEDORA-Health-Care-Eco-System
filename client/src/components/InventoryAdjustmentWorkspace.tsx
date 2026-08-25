// MEDORA | ميدورا — Integrated Health Care System
// Inventory Adjustment Workspace
// Handles expired, damaged, lost, and found medications.

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, AlertTriangle, Trash2, Search, Plus, CheckCircle2, XCircle, History } from "lucide-react";
import { cn } from "@/lib/utils";

type ScopeProps = { organizationId: number | null; branchId: number | null };

export function InventoryAdjustmentWorkspace({ organizationId, branchId }: ScopeProps) {
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [adjustmentType, setAdjustmentType] = useState<"expired" | "damaged" | "lost" | "found" | "correction">("expired");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const enabled = Boolean(organizationId && branchId);

  const adjustments = trpc.inventoryAdjustment.list.useQuery(
    enabled ? { organizationId: organizationId!, branchId: branchId! } : { organizationId: 0 },
    { enabled }
  );

  const inventorySearch = trpc.inventoryTransfer.searchInventory.useQuery(
    { branchId: branchId!, query: searchQuery },
    { enabled: enabled && searchQuery.length > 2 }
  );

  const create = trpc.inventoryAdjustment.create.useMutation({
    onSuccess: async () => {
      setStatusMsg("تم تسجيل طلب تسوية المخزون بنجاح. بانتظار اعتماد المدير.");
      setSelectedBatch(null);
      setQuantity("1");
      setReason("");
      setActiveTab("list");
      await adjustments.refetch();
    },
    onError: (error) => setStatusMsg(`خطأ: ${error.message}`)
  });

  const approve = trpc.inventoryAdjustment.approve.useMutation({
    onSuccess: async () => {
      setStatusMsg("تم اعتماد التسوية وتحديث المخزون.");
      await adjustments.refetch();
    }
  });

  const reject = trpc.inventoryAdjustment.reject.useMutation({
    onSuccess: async () => {
      setStatusMsg("تم رفض طلب التسوية.");
      await adjustments.refetch();
    }
  });

  const handleCreate = () => {
    if (!selectedBatch || !quantity || !reason) {
      setStatusMsg("يرجى اختيار صنف وتحديد الكمية والسبب.");
      return;
    }
    create.mutate({
      organizationId: organizationId!,
      branchId: branchId!,
      productId: selectedBatch.productId,
      batchId: selectedBatch.batchId,
      adjustmentType,
      quantity: parseFloat(quantity),
      reason,
    });
  };

  const typeLabels: Record<string, { ar: string, color: string }> = {
    expired: { ar: "منتهي الصلاحية", color: "text-rose-600 bg-rose-50" },
    damaged: { ar: "تالف", color: "text-orange-600 bg-orange-50" },
    lost: { ar: "مفقود", color: "text-slate-600 bg-slate-50" },
    found: { ar: "فائض/موجود", color: "text-emerald-600 bg-emerald-50" },
    correction: { ar: "تصحيح مخزني", color: "text-blue-600 bg-blue-50" },
  };

  return (
    <Card className="overflow-hidden border-0 bg-white shadow-sm" dir="rtl">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
              <span>تسوية وتصحيح المخزون | Inventory Adjustment</span>
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500">معالجة الأدوية منتهية الصلاحية، التالفة، أو المفقودة.</p>
          </div>
          <div className="flex gap-2">
            <Button variant={activeTab === "list" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("list")}>
              <History className="ml-2 h-4 w-4" /> سجل التسويات
            </Button>
            <Button variant={activeTab === "create" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("create")}>
              <Plus className="ml-2 h-4 w-4" /> إضافة تسوية
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {statusMsg && <Badge variant="outline" className="mb-4 w-full justify-center py-2 text-sm">{statusMsg}</Badge>}

        {activeTab === "create" ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-400" />
                <Input 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder="ابحث عن الصنف المتأثر (3 أحرف على الأقل)..." 
                  className="border-0 bg-transparent p-0 focus-visible:ring-0"
                />
              </div>
              {inventorySearch.data?.map(item => (
                <div key={item.batchId} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer" onClick={() => setSelectedBatch(item)}>
                  <div>
                    <p className="text-sm font-medium">{item.nameAr}</p>
                    <p className="text-xs text-slate-500">تشغيلة: {item.batchNumber} · رصيد: {item.quantity}</p>
                  </div>
                  {selectedBatch?.batchId === item.batchId && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                </div>
              ))}
            </div>

            {selectedBatch && (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">نوع التسوية</label>
                  <select 
                    value={adjustmentType} 
                    onChange={(e) => setAdjustmentType(e.target.value as any)}
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                  >
                    <option value="expired">منتهي الصلاحية</option>
                    <option value="damaged">تالف</option>
                    <option value="lost">مفقود</option>
                    <option value="found">فائض (موجود)</option>
                    <option value="correction">تصحيح يدوي</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">الكمية المتأثرة</label>
                  <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="0.001" step="0.001" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">السبب / التفاصيل</label>
                  <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="مثلاً: كسر أثناء النقل" />
                </div>
              </div>
            )}

            <Button onClick={handleCreate} disabled={create.isPending || !selectedBatch} className="w-full bg-rose-600 hover:bg-rose-700">
              {create.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="ml-2 h-4 w-4" />}
              تسجيل التسوية للمراجعة
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {adjustments.data?.map(({ adjustment, productName, batchNumber }) => (
              <div key={adjustment.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-4 hover:bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className={cn("rounded-lg p-2", typeLabels[adjustment.adjustmentType].color)}>
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{productName}</p>
                    <p className="text-xs text-slate-500">تشغيلة: {batchNumber} · كمية: {adjustment.quantity} · {typeLabels[adjustment.adjustmentType].ar}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{adjustment.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={cn(
                    adjustment.status === "approved" ? "border-emerald-200 text-emerald-700 bg-emerald-50" :
                    adjustment.status === "rejected" ? "border-rose-200 text-rose-700 bg-rose-50" :
                    "border-amber-200 text-amber-700 bg-amber-50"
                  )}>
                    {adjustment.status === "approved" ? "تم الاعتماد" : adjustment.status === "rejected" ? "مرفوض" : "قيد الانتظار"}
                  </Badge>
                  {adjustment.status === "pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => approve.mutate({ adjustmentId: adjustment.id })}>
                        اعتماد
                      </Button>
                      <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => {
                        const reason = prompt("سبب الرفض:");
                        if (reason) reject.mutate({ adjustmentId: adjustment.id, reason });
                      }}>
                        رفض
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {!adjustments.data?.length && <p className="text-center py-10 text-slate-400">لا توجد سجلات تسوية مخزنية.</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
