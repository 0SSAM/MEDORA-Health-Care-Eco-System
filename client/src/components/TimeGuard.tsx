// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ShieldAlert, Clock, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Maximum allowed drift in seconds (e.g., 5 minutes)
const MAX_DRIFT_SECONDS = 300;

export function TimeGuard({ children, organizationId, branchId }: { children: React.ReactNode, organizationId?: number | null, branchId?: number | null }) {
  const { user } = useAuth();
  const [isTimeTampered, setIsTimeTampered] = useState(false);
  const [driftInfo, setDriftInfo] = useState<{ client: string, server: string, drift: number } | null>(null);
  
  const timeQuery = trpc.timeGuard.getTrustedTime.useQuery(undefined, {
    refetchInterval: 60000, // Check every minute
    retry: 3,
  });

  const reportMutation = trpc.timeGuard.reportTampering.useMutation();

  useEffect(() => {
    if (timeQuery.data && !timeQuery.isStale && !timeQuery.isLoading) {
      const serverTime = timeQuery.data.timestamp;
      const clientTime = Date.now();
      const driftSeconds = Math.abs(clientTime - serverTime) / 1000;

      if (driftSeconds > MAX_DRIFT_SECONDS) {
        setIsTimeTampered(true);
        const info = {
          client: new Date(clientTime).toLocaleString(),
          server: new Date(serverTime).toLocaleString(),
          drift: Math.round(driftSeconds)
        };
        setDriftInfo(info);

        // Report to server if user is logged in
        if (user && organizationId) {
          reportMutation.mutate({
            organizationId,
            branchId: branchId ?? undefined,
            clientTime: info.client,
            serverTime: info.server,
            driftSeconds: info.drift
          });
        }
      } else {
        setIsTimeTampered(false);
      }
    }
  }, [timeQuery.data, user, organizationId, branchId]);

  if (isTimeTampered) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/95 p-6 backdrop-blur-md">
        <Card className="max-w-md border-0 bg-white shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <ShieldAlert className="h-10 w-10" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">تنبيه أمني: خطأ في وقت النظام</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-slate-600 leading-relaxed">
              تم اكتشاف اختلاف كبير بين وقت جهازك ووقت الخادم الموثق. 
              لأسباب أمنية ولضمان دقة السجلات الطبية والمالية، تم إيقاف الوصول إلى النظام مؤقتاً.
            </p>
            
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">وقت الجهاز:</span>
                <span dir="ltr">{driftInfo?.client}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-600">
                <span className="font-semibold">الوقت الموثق:</span>
                <span dir="ltr">{driftInfo?.server}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-rose-600 font-bold">
                <span>فارق التوقيت:</span>
                <span>{driftInfo?.drift} ثانية</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex gap-3 items-start text-right">
              <Clock className="h-4 w-4 shrink-0 mt-0.5" />
              <p>يرجى ضبط وقت وتاريخ جهازك على الوضع "التلقائي" (Automatic) وإعادة تحميل الصفحة. تم إرسال تنبيه لمسؤول النظام بهذا الحدث.</p>
            </div>

            <Button 
              onClick={() => window.location.reload()} 
              className="w-full bg-[#0d1b2a] hover:bg-slate-800 text-white h-12 rounded-xl flex gap-2 items-center justify-center"
            >
              <RefreshCw className="h-4 w-4" />
              تحديث الصفحة الآن
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
