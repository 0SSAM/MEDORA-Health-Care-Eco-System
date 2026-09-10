import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalization } from "@/contexts/LocalizationContext";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { skipToken } from "@tanstack/react-query";
import { AlertTriangle, BarChart3, Boxes, CircleAlert, Clock3, CreditCard, Database, RefreshCw, ShoppingCart, WalletCards } from "lucide-react";

export function BranchAnalyticsDashboard({ branchId, jurisdictionId }: { branchId: number | null; jurisdictionId: number | null }) {
  const { t, direction, locale, formatCurrency } = useLocalization();
  const query = trpc.erp.analytics.branchOverview.useQuery(
    branchId ? { branchId, ...(jurisdictionId !== null ? { jurisdictionId } : {}), days: 7 } : skipToken,
    { enabled: Boolean(branchId), refetchInterval: 30_000, staleTime: 15_000, retry: 1 },
  );
  const data = query.data;
  const number = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
  const paymentLabels: Record<string, string> = {
    cash: t("branchAnalytics.paymentCash"),
    meeza: t("branchAnalytics.paymentMeeza"),
    instapay: t("branchAnalytics.paymentInstapay"),
    insurance: t("branchAnalytics.paymentInsurance"),
  };
  const severityLabels = { critical: t("branchAnalytics.severityCritical"), warning: t("branchAnalytics.severityWarning") } as const;
  const trendMax = Math.max(...(data?.trend.map(item => item.total) ?? [1]), 1);

  if (!branchId) return <Card className="border-amber-200 bg-amber-50/70"><CardContent className="flex items-center gap-3 p-5 text-sm text-amber-900"><CircleAlert className="h-5 w-5 shrink-0" />{t("branchAnalytics.selectBranch")}</CardContent></Card>;
  if (query.isLoading) return <Card><CardContent className="flex min-h-48 items-center justify-center gap-3 p-6 text-sm text-slate-500"><RefreshCw className="h-5 w-5 animate-spin" />{t("branchAnalytics.loading")}</CardContent></Card>;
  if (query.isError) return <Card className="border-rose-200 bg-rose-50"><CardContent className="flex flex-col gap-3 p-5 text-sm text-rose-900 sm:flex-row sm:items-center sm:justify-between"><span>{t("branchAnalytics.loadFailed")}</span><Button size="sm" variant="outline" onClick={() => void query.refetch()}>{t("branchAnalytics.retry")}</Button></CardContent></Card>;
  if (!data) return null;

  const metrics = [
    { label: t("branchAnalytics.totalSales"), value: formatCurrency(data.summary.totalSales), hint: `${number(data.period.days)} ${t("branchAnalytics.days")}`, icon: WalletCards, tone: "bg-cyan-50 text-cyan-700" },
    { label: t("branchAnalytics.invoiceCount"), value: number(data.summary.salesCount), hint: `${t("branchAnalytics.average")} ${formatCurrency(data.summary.averageSale)}`, icon: ShoppingCart, tone: "bg-violet-50 text-violet-700" },
    { label: t("branchAnalytics.inventoryAlerts"), value: number(data.inventory.alertCount), hint: `${number(data.inventory.criticalCount)} ${t("branchAnalytics.critical")}`, icon: AlertTriangle, tone: "bg-amber-50 text-amber-700" },
    { label: t("branchAnalytics.trackedItems"), value: number(data.inventory.totalTrackedProducts), hint: t("branchAnalytics.currentBranch"), icon: Boxes, tone: "bg-emerald-50 text-emerald-700" },
  ];

  return <div className="space-y-5" dir={direction}>
    <div className="flex flex-col gap-3 rounded-2xl border border-cyan-100 bg-gradient-to-l from-cyan-50 to-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div><div className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-cyan-700" /><h2 className="text-lg font-bold text-slate-900">{t("branchAnalytics.title")}</h2><Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">{t("branchAnalytics.refreshEvery")}</Badge></div><p className="mt-1 text-xs text-slate-500">{t("branchAnalytics.scopeDetail")}</p></div>
      <Button variant="outline" size="sm" className="w-full gap-2 bg-white sm:w-auto" onClick={() => void query.refetch()} disabled={query.isFetching}><RefreshCw className={cn("h-4 w-4", query.isFetching && "animate-spin")} />{t("branchAnalytics.refreshNow")}</Button>
    </div>

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(item => { const Icon = item.icon; return <Card key={item.label} className="border-0 shadow-sm"><CardContent className="p-4"><div className="flex items-start justify-between gap-3"><div className={cn("grid h-10 w-10 place-items-center rounded-xl", item.tone)}><Icon className="h-5 w-5" /></div><span className="text-[11px] text-slate-400">{t("branchAnalytics.live")}</span></div><p className="mt-4 text-xs text-slate-500">{item.label}</p><p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{item.value}</p><p className="mt-1 text-[11px] text-slate-400">{item.hint}</p></CardContent></Card>; })}</section>

    <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
      <Card><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="h-4 w-4 text-cyan-700" />{t("branchAnalytics.salesTrend")}</CardTitle><p className="mt-1 text-xs text-slate-500">{t("branchAnalytics.dailyTotal")}</p></div><Clock3 className="h-4 w-4 text-slate-400" /></CardHeader><CardContent>{data.trend.length ? <div className="flex min-h-48 items-end gap-2 overflow-x-auto pb-2">{data.trend.map(item => <div key={item.day} className="flex min-w-9 flex-1 flex-col items-center gap-2"><span className="text-[10px] font-semibold text-slate-500">{number(item.total)}</span><div className="flex h-32 w-full items-end rounded-lg bg-slate-100 p-1"><div className="w-full rounded-md bg-gradient-to-t from-cyan-700 to-cyan-300 transition-[height] duration-300" style={{ height: `${Math.max(8, (item.total / trendMax) * 100)}%` }} /></div><span className="text-[10px] text-slate-400">{item.day.slice(5)}</span></div>)}</div> : <div className="grid min-h-48 place-items-center rounded-xl bg-slate-50 p-4 text-sm text-slate-500">{t("branchAnalytics.noCompletedSales")}</div>}</CardContent></Card>
      <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><CreditCard className="h-4 w-4 text-violet-700" />{t("branchAnalytics.paymentMix")}</CardTitle></CardHeader><CardContent className="space-y-3">{data.paymentMix.length ? data.paymentMix.map(item => <div key={item.paymentMethod} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3 text-sm"><span className="font-medium text-slate-700">{paymentLabels[item.paymentMethod] ?? item.paymentMethod}</span><span className="text-left"><strong className="block text-slate-900">{formatCurrency(item.total)}</strong><small className="text-slate-400">{number(item.count)} {t("branchAnalytics.invoices")}</small></span></div>) : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">{t("branchAnalytics.noPaymentMovements")}</p>}</CardContent></Card>
    </div>

    <Card className="border-amber-100"><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle className="flex items-center gap-2 text-base"><Database className="h-4 w-4 text-amber-700" />{t("branchAnalytics.inventoryTitle")}</CardTitle><p className="mt-1 text-xs text-slate-500">{t("branchAnalytics.inventoryDetail")}</p></div><Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">{number(data.inventory.alertCount)}</Badge></CardHeader><CardContent>{data.inventory.alerts.length ? <div className="grid gap-2 sm:grid-cols-2">{data.inventory.alerts.map(item => <div key={item.productId} className={cn("rounded-xl border p-3", item.severity === "critical" ? "border-rose-200 bg-rose-50/70" : "border-amber-200 bg-amber-50/60")}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{item.nameAr}</p><p className="mt-1 text-[11px] text-slate-500">{t("branchAnalytics.sku")}: {item.sku}</p></div><Badge className={item.severity === "critical" ? "bg-rose-600 text-white hover:bg-rose-600" : "bg-amber-500 text-white hover:bg-amber-500"}>{severityLabels[item.severity as keyof typeof severityLabels]}</Badge></div><div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600"><span>{t("branchAnalytics.balance")}: {number(item.quantityOnHand)}</span><span>{t("branchAnalytics.reorder")}: {number(item.reorderPoint)}</span>{item.daysToExpiry !== null && <span>{t("branchAnalytics.expiry")}: {item.daysToExpiry < 0 ? t("branchAnalytics.expired") : `${number(item.daysToExpiry)} ${t("branchAnalytics.day")}`}</span>}</div></div>)}</div> : <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800"><Boxes className="h-4 w-4" />{t("branchAnalytics.noCriticalAlerts")}</div>}</CardContent></Card>
  </div>;
}
