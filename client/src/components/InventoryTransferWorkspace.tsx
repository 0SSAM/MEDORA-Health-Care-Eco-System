// MEDORA | ميدورا — Integrated Health Care System
// Inventory Transfer Workspace
// Provides a bilingual UI for inter-branch stock movements with item selection.

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeftRight, Package, ClipboardList, CheckCircle2, XCircle, Send, Search, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ScopeProps = { organizationId: number | null; branchId: number | null; jurisdictionId: number | null };

type TransferItem = {
  productId: number;
  batchId: number;
  nameAr: string;
  batchNumber: string;
  quantity: number;
  maxQuantity: number;
};

export function InventoryTransferWorkspace({ organizationId, branchId }: ScopeProps) {
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [transferNumber, setTransferNumber] = useState("");
  const [destBranchId, setDestBranchId] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<TransferItem[]>([]);

  const enabled = Boolean(organizationId && branchId);
  
  const branchesQuery = trpc.organizations.branches.useQuery(
    { organizationId: organizationId! },
    { enabled: !!organizationId }
  );

  const transfers = trpc.inventoryTransfer.list.useQuery(
    enabled ? { organizationId: organizationId!, branchId: branchId! } : { organizationId: 0 },
    { enabled }
  );

  const inventorySearch = trpc.inventoryTransfer.searchInventory.useQuery(
    { branchId: branchId!, query: searchQuery },
    { enabled: enabled && searchQuery.length > 2 }
  );

  const create = trpc.inventoryTransfer.create.useMutation({
    onSuccess: async () => {
      setStatus("تم إنشاء مسودة التحويل بنجاح.");
      setTransferNumber("");
      setDestBranchId("");
      setNotes("");
      setSelectedItems([]);
      setActiveTab("list");
      await transfers.refetch();
    },
    onError: (error) => {
      setStatus(`خطأ: ${error.message}`);
    }
  });

  const submit = trpc.inventoryTransfer.submit.useMutation({
    onSuccess: async () => {
      setStatus("تم إرسال طلب التحويل.");
      await transfers.refetch();
    }
  });

  const addItem = (item: any) => {
    if (selectedItems.find(i => i.batchId === item.batchId)) return;
    setSelectedItems([...selectedItems, {
      productId: item.productId,
      batchId: item.batchId,
      nameAr: item.nameAr,
      batchNumber: item.batchNumber,
      quantity: 1,
      maxQuantity: Number(item.quantity)
    }]);
    setSearchQuery("");
  };

  const removeItem = (batchId: number) => {
    setSelectedItems(selectedItems.filter(i => i.batchId !== batchId));
  };

  const updateItemQuantity = (batchId: number, qty: number) => {
    setSelectedItems(selectedItems.map(i => 
      i.batchId === batchId ? { ...i, quantity: Math.min(qty, i.maxQuantity) } : i
    ));
  };

  const handleCreate = async () => {
    if (!enabled || !destBranchId || !transferNumber || selectedItems.length === 0) {
      setStatus("يرجى إكمال البيانات المطلوبة واختيار صنف واحد على الأقل.");
      return;
    }
    create.mutate({
      organizationId: organizationId!,
      sourceBranchId: branchId!,
      destinationBranchId: parseInt(destBranchId),
      transferNumber,
      notes,
      items: selectedItems.map(i => ({
        productId: i.productId,
        batchId: i.batchId,
        quantity: i.quantity
      }))
    });
  };

  return (
    <Card className="overflow-hidden border-0 bg-white shadow-sm" dir="rtl">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-cyan-600" />
              <span>نقل الأصناف بين الفروع | Inter-Branch Transfer</span>
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              إدارة تحويل المخزون بين فروع الصيدلية مع تتبع كامل للحالة.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={activeTab === "list" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setActiveTab("list")}
              className={activeTab === "list" ? "bg-[#0d1b2a]" : ""}
            >
              <ClipboardList className="ml-2 h-4 w-4" />
              قائمة التحويلات
            </Button>
            <Button 
              variant={activeTab === "create" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setActiveTab("create")}
              className={activeTab === "create" ? "bg-[#0d1b2a]" : ""}
            >
              <Package className="ml-2 h-4 w-4" />
              طلب تحويل جديد
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {status && (
          <Badge variant="outline" className="mb-4 w-full justify-center py-2 text-sm">
            {status}
          </Badge>
        )}

        {activeTab === "create" ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">رقم التحويل | Transfer Number</label>
                <Input 
                  value={transferNumber} 
                  onChange={(e) => setTransferNumber(e.target.value)} 
                  placeholder="مثلاً: TRF-2026-001" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">الفرع المستلم | Destination Branch</label>
                <select 
                  value={destBranchId} 
                  onChange={(e) => setDestBranchId(e.target.value)} 
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                >
                  <option value="">اختر الفرع المستلم</option>
                  {branchesQuery.data?.filter(b => b.id !== branchId).map(b => (
                    <option key={b.id} value={b.id}>{b.nameAr} ({b.code})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-400" />
                <Input 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder="ابحث عن صنف أو رقم تشغيلة (3 أحرف على الأقل)..." 
                  className="border-0 bg-transparent p-0 focus-visible:ring-0"
                />
              </div>
              
              {inventorySearch.data && inventorySearch.data.length > 0 && (
                <div className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-100 bg-white shadow-sm">
                  {inventorySearch.data.map(item => (
                    <div key={item.batchId} className="flex items-center justify-between p-3 hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-slate-900">{item.nameAr}</p>
                        <p className="text-xs text-slate-500">تشغيلة: {item.batchNumber} · متاح: {item.quantity}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => addItem(item)}>
                        <Plus className="h-4 w-4 text-cyan-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {selectedItems.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">الأصناف المختارة</p>
                  {selectedItems.map(item => (
                    <div key={item.batchId} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{item.nameAr}</p>
                        <p className="text-xs text-slate-500">تشغيلة: {item.batchNumber}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">الكمية:</span>
                          <Input 
                            type="number" 
                            value={item.quantity} 
                            onChange={(e) => updateItemQuantity(item.batchId, Number(e.target.value))}
                            className="h-8 w-20"
                            min={1}
                            max={item.maxQuantity}
                          />
                          <span className="text-xs text-slate-400">/ {item.maxQuantity}</span>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => removeItem(item.batchId)}>
                          <Trash2 className="h-4 w-4 text-rose-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">ملاحظات | Notes</label>
              <Input 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="ملاحظات إضافية عن التحويل" 
              />
            </div>

            <Button 
              onClick={handleCreate} 
              disabled={create.isPending || !enabled || selectedItems.length === 0}
              className="w-full bg-[#0d1b2a]"
            >
              {create.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="ml-2 h-4 w-4" />}
              إنشاء مسودة طلب تحويل
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {transfers.isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
              </div>
            ) : transfers.data?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500">
                      <th className="pb-3 pr-2 font-medium">رقم التحويل</th>
                      <th className="pb-3 font-medium">من فرع</th>
                      <th className="pb-3 font-medium">إلى فرع</th>
                      <th className="pb-3 font-medium">الحالة</th>
                      <th className="pb-3 font-medium">التاريخ</th>
                      <th className="pb-3 pl-2 font-medium">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {transfers.data.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50">
                        <td className="py-4 pr-2 font-medium text-slate-900">{t.transferNumber}</td>
                        <td className="py-4 text-slate-600">
                          {branchesQuery.data?.find(b => b.id === t.sourceBranchId)?.nameAr || t.sourceBranchId}
                        </td>
                        <td className="py-4 text-slate-600">
                          {branchesQuery.data?.find(b => b.id === t.destinationBranchId)?.nameAr || t.destinationBranchId}
                        </td>
                        <td className="py-4">
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "font-normal",
                              t.status === "draft" && "bg-slate-100 text-slate-600",
                              t.status === "requested" && "bg-amber-100 text-amber-700",
                              t.status === "approved" && "bg-cyan-100 text-cyan-700",
                              t.status === "in_transit" && "bg-blue-100 text-blue-700",
                              t.status === "received" && "bg-emerald-100 text-emerald-700"
                            )}
                          >
                            {t.status}
                          </Badge>
                        </td>
                        <td className="py-4 text-slate-500">{new Date(t.createdAt).toLocaleDateString("ar-EG")}</td>
                        <td className="py-4 pl-2">
                          {t.status === "draft" && t.sourceBranchId === branchId && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 text-cyan-600 hover:bg-cyan-50 hover:text-cyan-700"
                              onClick={() => submit.mutate({ transferId: t.id })}
                            >
                              إرسال الطلب
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Package className="mb-4 h-12 w-12 opacity-20" />
                <p>لا توجد تحويلات مخزون مسجلة في هذا النطاق.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
