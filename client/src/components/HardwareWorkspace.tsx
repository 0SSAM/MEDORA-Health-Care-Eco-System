// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleStop, Printer, ScanLine, ShieldCheck, Wifi } from "lucide-react";

export type PrinterModel = {
  id: string;
  name: string;
  family: "حرارية" | "ملصقات" | "مكتبية";
  transports: Array<"browser-download" | "local-bridge" | "network-ipps" | "usb" | "bluetooth">;
  media: string[];
};

export const printerModels: PrinterModel[] = [
  { id: "thermal-generic-80", name: "Thermal 80mm — Generic", family: "حرارية", transports: ["local-bridge", "usb", "bluetooth"], media: ["إيصال 80mm"] },
  { id: "thermal-generic-58", name: "Thermal 58mm — Generic", family: "حرارية", transports: ["local-bridge", "usb", "bluetooth"], media: ["إيصال 58mm"] },
  { id: "label-zpl-generic", name: "Label ZPL — Generic", family: "ملصقات", transports: ["local-bridge", "network-ipps", "usb"], media: ["ملصق Data Matrix", "ملصق باركود"] },
  { id: "office-a4", name: "Office A4 — PDF", family: "مكتبية", transports: ["browser-download", "network-ipps"], media: ["A4", "A5"] },
];

export const connectionLabels: Record<PrinterModel["transports"][number], string> = {
  "browser-download": "ملف المتصفح / PDF",
  "local-bridge": "Local Bridge",
  "network-ipps": "شبكة IPPS",
  usb: "USB عبر Bridge",
  bluetooth: "Bluetooth عبر Bridge",
};

export function HardwareWorkspace() {
  return (
    <div className="space-y-4" dir="rtl">
      <Card className="border-amber-200 bg-amber-50/70">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div>
              <p className="font-semibold text-amber-950">تكامل الأجهزة الإنتاجي غير مفعّل</p>
              <p className="mt-1 text-sm leading-6 text-amber-900">
                لا توجد محاكاة أو قراءة اصطناعية أو طباعة تجريبية داخل النظام. يتطلب تشغيل الطابعات والماسحات موصلاً معتمداً، وسياسة جهاز موثوق، واختبار قبول موثقاً قبل فتح أي اتصال USB أو Bluetooth أو شبكة.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="w-fit border-amber-300 bg-white text-amber-900">متوقف بأمان</Badge>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ScanLine className="h-5 w-5 text-violet-700" />الماسحات وData Matrix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
            <p>سيتم قبول قراءات الأجهزة الفعلية فقط بعد اعتماد الموصل والتحقق من هوية الجهاز وسجل التدقيق.</p>
            <div className="flex items-center gap-2 text-xs text-amber-800"><CircleStop className="h-4 w-4" />لا يوجد جهاز متصل</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Printer className="h-5 w-5 text-amber-700" />الطابعات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
            <p>تتوفر قائمة الأنواع المدعومة كمرجع إعداد فقط؛ ولا يتم إنشاء إيصال أو إرسال مهمة طباعة قبل تفعيل موصل معتمد.</p>
            <div className="flex items-center gap-2 text-xs text-amber-800"><Wifi className="h-4 w-4" />الاتصال الخارجي مغلق</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
