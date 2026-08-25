// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Cloud, CloudOff, Loader2, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { listDurableOfflineDrafts, updateOfflineDraft, type OfflineDraft } from "@/lib/offlineQueue";

type OfflineStatusIndicatorProps = {
  online: boolean;
  drafts: OfflineDraft[];
  serverPendingCount?: number;
  onRefresh: () => void | Promise<void>;
  onRetryConflict?: (draft: OfflineDraft) => void | Promise<void>;
};

export function OfflineStatusIndicator({ online, drafts, serverPendingCount = 0, onRefresh, onRetryConflict }: OfflineStatusIndicatorProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(() => {
    const value = Number(localStorage.getItem("medora-last-sync-at"));
    return Number.isFinite(value) && value > 0 ? value : null;
  });
  const queued = useMemo(() => drafts.filter(item => item.status !== "conflict" && item.status !== "failed").length, [drafts]);
  const blocked = useMemo(() => drafts.filter(item => item.status === "conflict" || item.status === "failed").length, [drafts]);
  const totalPending = queued + blocked + serverPendingCount;
  const progress = totalPending === 0 ? 100 : online ? 50 : 10;

  useEffect(() => {
    if (!online) return;
    let cancelled = false;
    const refresh = async () => {
      try {
        await listDurableOfflineDrafts();
        if (!cancelled) {
          const now = Date.now();
          setLastSyncAt(now);
          localStorage.setItem("medora-last-sync-at", String(now));
        }
      } catch {
        // The indicator remains fail-safe and does not claim a successful sync.
      }
    };
    void refresh();
    return () => { cancelled = true; };
  }, [online]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      navigator.serviceWorker?.controller?.postMessage({ type: "MEDORA_SYNC_STATUS" });
      await onRefresh();
      if (online) {
        const now = Date.now();
        setLastSyncAt(now);
        localStorage.setItem("medora-last-sync-at", String(now));
      }
    } finally {
      setRefreshing(false);
    }
  };

  const title = online ? "متصل بالإنترنت" : "لا يوجد اتصال";
  const detail = online
    ? totalPending === 0 ? "المسودات المحلية متزامنة ولا توجد عناصر معلقة." : "الاتصال متاح؛ المسودات تنتظر تحققاً خادمياً قبل اعتمادها."
    : "تعمل المساحة المحدودة محلياً؛ العمليات المنظمة لا تُعتمد دون اتصال.";
  const StatusIcon = online ? Cloud : CloudOff;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm shadow-slate-200/60" aria-live="polite" aria-label="حالة الاتصال والمزامنة">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${online ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
            {online ? <StatusIcon className="h-5 w-5" aria-hidden="true" /> : <WifiOff className="h-5 w-5" aria-hidden="true" />}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
              <Badge variant="outline" className={online ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}>{online ? "Online" : "Offline"}</Badge>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-600">{detail}</p>
          </div>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={() => void handleRefresh()} disabled={refreshing} className="gap-2">
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
          تحديث الحالة
        </Button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500"><span>تقدم المزامنة / Sync progress</span><span>{progress}%</span></div>
          <Progress value={progress} aria-label={`تقدم المزامنة ${progress}%`} className="h-2" />
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
          <span className="rounded-lg bg-slate-50 px-2 py-1">معلق محلياً: {queued}</span>
          <span className="rounded-lg bg-rose-50 px-2 py-1 text-rose-700">تعارض/فشل: {blocked}</span>
          <span className="rounded-lg bg-cyan-50 px-2 py-1 text-cyan-800">خادمي: {serverPendingCount}</span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
        {totalPending === 0 ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" /> : <Cloud className="h-3.5 w-3.5 text-cyan-700" aria-hidden="true" />}
        آخر تحقق: {lastSyncAt ? new Date(lastSyncAt).toLocaleString() : "لم يتم بعد"}
      </div>
      {blocked > 0 && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/70 p-3" role="region" aria-label="سجل تعارضات المزامنة">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-rose-900">سجل التعارضات / Conflict review</p>
            <Badge variant="outline" className="border-rose-200 text-rose-700">{blocked}</Badge>
          </div>
          <div className="mt-2 space-y-2">
            {drafts.filter(item => item.status === "conflict" || item.status === "failed").slice(0, 5).map(draft => (
              <div key={draft.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-rose-100 bg-white/80 p-2 text-[11px]">
                <div className="min-w-0"><p className="font-medium text-slate-800">{draft.module}</p><p className="truncate text-rose-700">{draft.conflictReason ?? draft.lastError ?? "يلزم مراجعة يدوية"}</p></div>
                <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={() => { void updateOfflineDraft(draft.id, { status: "queued", conflictReason: undefined, lastError: undefined, lastAttemptAt: Date.now() }).then(() => onRetryConflict?.(draft)); }}>إعادة المحاولة</Button>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-5 text-rose-800">لا يتم اعتماد أي عملية مالية أو وصفة أو فاتورة من هذا المسار دون تحقق خادمي وصلاحيات مناسبة.</p>
        </div>
      )}
    </section>
  );
}
