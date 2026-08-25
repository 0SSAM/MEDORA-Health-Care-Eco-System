// MEDORA | ميدورا — Integrated Health Care System
// Miscellaneous Expense Workspace
// Handles utilities, rent, supplies, and other operational expenses.

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Wallet, Receipt, Plus, History, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ScopeProps = { organizationId: number | null; branchId: number | null };

export function MiscellaneousExpenseWorkspace({ organizationId, branchId }: ScopeProps) {
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [category, setCategory] = useState<"utilities" | "rent" | "supplies" | "maintenance" | "marketing" | "other">("utilities");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const enabled = Boolean(organizationId && branchId);

  const expenses = trpc.miscellaneousExpense.list.useQuery(
    enabled ? { organizationId: organizationId!, branchId: branchId! } : { organizationId: 0 },
    { enabled }
  );

  const create = trpc.miscellaneousExpense.create.useMutation({
    onSuccess: async () => {
      setStatusMsg("تم تسجيل المصروف بنجاح.");
      setAmount("");
      setDescription("");
      setActiveTab("list");
      await expenses.refetch();
    },
    onError: (error) => setStatusMsg(`خطأ: ${error.message}`)
  });

  const updateStatus = trpc.miscellaneousExpense.updateStatus.useMutation({
    onSuccess: async () => {
      setStatusMsg("تم تحديث حالة المصروف.");
      await expenses.refetch();
    }
  });

  const handleCreate = () => {
    if (!amount || !description) {
      setStatusMsg("يرجى إدخال المبلغ والوصف.");
      return;
    }
    create.mutate({
      organizationId: organizationId!,
      branchId: branchId!,
      category,
      amount: parseFloat(amount),
      description,
    });
  };

  const catLabels: Record<string, string> = {
    utilities: "المرافق (كهرباء/ماء)",
    rent: "الإيجار",
    supplies: "أدوات مكتبية/استهلاكية",
    maintenance: "صيانة",
    marketing: "تسويق",
    other: "أخرى",
  };

  return (
    <Card className="overflow-hidden border-0 bg-white shadow-sm" dir="rtl">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-600" />
              <span>إدارة المصروفات التشغيلية | Operational Expenses</span>
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500">تسجيل ومتابعة المصروفات النثرية والتشغيلية للفرع.</p>
          </div>
          <div className="flex gap-2">
            <Button variant={activeTab === "list" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("list")}>
              <History className="ml-2 h-4 w-4" /> سجل المصروفات
            </Button>
            <Button variant={activeTab === "create" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("create")}>
              <Plus className="ml-2 h-4 w-4" /> تسجيل مصروف
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {statusMsg && <Badge variant="outline" className="mb-4 w-full justify-center py-2 text-sm">{statusMsg}</Badge>}

        {activeTab === "create" ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">الفئة</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                >
                  {Object.entries(catLabels).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">المبلغ (EGP)</label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الوصف / البيان</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="مثلاً: فاتورة الكهرباء لشهر أغسطس" />
            </div>
            <Button onClick={handleCreate} disabled={create.isPending} className="w-full bg-emerald-600 hover:bg-emerald-700">
              {create.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Receipt className="ml-2 h-4 w-4" />}
              تسجيل المصروف
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {expenses.data?.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-4 hover:bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{catLabels[exp.category]}</p>
                    <p className="text-sm font-bold text-emerald-700">{exp.amount} {exp.currency}</p>
                    <p className="text-xs text-slate-500 mt-1">{exp.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={cn(
                    exp.status === "paid" ? "border-emerald-200 text-emerald-700 bg-emerald-50" :
                    exp.status === "cancelled" ? "border-rose-200 text-rose-700 bg-rose-50" :
                    "border-amber-200 text-amber-700 bg-amber-50"
                  )}>
                    {exp.status === "paid" ? "تم الدفع" : exp.status === "cancelled" ? "ملغى" : "قيد الانتظار"}
                  </Badge>
                  {exp.status === "pending" && (
                    <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => updateStatus.mutate({ expenseId: exp.id, status: "paid" })}>
                      تأكيد الدفع
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {!expenses.data?.length && <p className="text-center py-10 text-slate-400">لا توجد مصروفات مسجلة.</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
