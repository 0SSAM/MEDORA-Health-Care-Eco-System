// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
import { CircleAlert, Info, LockKeyhole } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type IntegrationStatusNoticeProps = {
  kind: "government" | "insurance";
  compact?: boolean;
};

export const integrationStatusContent = {
  government: {
    title: "التكاملات الحكومية مغلقة مؤقتاً",
    short: "الربط الرسمي مع الجهات الحكومية متوقف بأمان حتى توفير الاعتمادات والمواصفات وبيئة الاختبار.",
    details: "الوحدات الداخلية ومسودات العمل متاحة وفق صلاحياتك، لكن لا يتم إرسال مطالبات أو فواتير أو بيانات إلى UPA أو EDA أو ETA أو أي جهة حكومية خارجية قبل اعتماد الموصل رسمياً واختباره وقبول نتائجه.",
    label: "حكومي · بانتظار الاعتماد",
  },
  insurance: {
    title: "تكامل التأمين مغلق مؤقتاً",
    short: "التحقق الشبكي والإرسال إلى شركات التأمين متوقفان بأمان حتى اعتماد موصل مؤسسي.",
    details: "يمكن حفظ المسودات الداخلية القابلة للتدقيق ضمن النطاق المصرح به، بينما تبقى الأهلية والموافقات والمطالبات الخارجية غير مرسلة حتى توفير عقد API، الاعتمادات، بيئة الاختبار، ومتطلبات القبول.",
    label: "تأمين · بانتظار الاعتماد",
  },
} as const;

export function IntegrationStatusNotice({ kind, compact = false }: IntegrationStatusNoticeProps) {
  const item = integrationStatusContent[kind];
  if (compact) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-right text-xs leading-5 text-amber-950" role="status">
        <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
        <span className="min-w-0 flex-1">{item.short}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="rounded-full p-0.5 text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600" aria-label={`تفاصيل حالة ${item.title}`}>
              <Info className="h-4 w-4" aria-hidden="true" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs text-right leading-5">{item.details}</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50/80 shadow-sm" role="status">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base text-amber-950">
            <CircleAlert className="h-5 w-5 text-amber-700" aria-hidden="true" />
            {item.title}
          </CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="cursor-help border-amber-300 bg-white text-amber-900">
                <LockKeyhole className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
                {item.label}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm text-right leading-5">{item.details}</TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="pt-0 text-sm leading-6 text-amber-900">
        <p>{item.short}</p>
        <p className="mt-2 text-xs text-amber-800">لن يتم تفعيل الإرسال الخارجي أو تجاوز الحماية تلقائياً. راجع مسؤول النظام عند توفير الاعتماد الرسمي.</p>
      </CardContent>
    </Card>
  );
}

export function IntegrationStatusStrip() {
  return (
    <section className="grid gap-3 lg:grid-cols-2" aria-label="حالة التكاملات الخارجية">
      <IntegrationStatusNotice kind="government" compact />
      <IntegrationStatusNotice kind="insurance" compact />
    </section>
  );
}
