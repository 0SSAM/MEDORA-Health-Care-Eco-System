import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalization } from "@/contexts/LocalizationContext";
import { CircleStop, Printer, ScanLine, ShieldCheck, Wifi } from "lucide-react";

export type PrinterModel = {
  id: string;
  name: string;
  family: "thermal" | "label" | "office";
  transports: Array<"browser-download" | "local-bridge" | "network-ipps" | "usb" | "bluetooth">;
  media: string[];
};

export const printerModels: PrinterModel[] = [
  { id: "thermal-generic-80", name: "Thermal 80mm — Generic", family: "thermal", transports: ["local-bridge", "usb", "bluetooth"], media: ["80mm receipt"] },
  { id: "thermal-generic-58", name: "Thermal 58mm — Generic", family: "thermal", transports: ["local-bridge", "usb", "bluetooth"], media: ["58mm receipt"] },
  { id: "label-zpl-generic", name: "Label ZPL — Generic", family: "label", transports: ["local-bridge", "network-ipps", "usb"], media: ["Data Matrix label", "Barcode label"] },
  { id: "office-a4", name: "Office A4 — PDF", family: "office", transports: ["browser-download", "network-ipps"], media: ["A4", "A5"] },
];

export const connectionLabels: Record<PrinterModel["transports"][number], string> = {
  "browser-download": "Browser file / PDF",
  "local-bridge": "Local Bridge",
  "network-ipps": "IPPS network",
  usb: "USB through Bridge",
  bluetooth: "Bluetooth through Bridge",
};

const copy = {
  ar: {
    notEnabled: "تكامل الأجهزة الإنتاجي غير مفعّل",
    secureStopped: "متوقف بأمان",
    explanation: "لا توجد محاكاة أو قراءة اصطناعية أو طباعة تجريبية داخل النظام. يتطلب تشغيل الطابعات والماسحات موصلاً معتمداً، وسياسة جهاز موثوق، واختبار قبول موثقاً قبل فتح أي اتصال USB أو Bluetooth أو شبكة.",
    scanning: "الماسحات وData Matrix",
    scanningDetail: "سيتم قبول قراءات الأجهزة الفعلية فقط بعد اعتماد الموصل والتحقق من هوية الجهاز وسجل التدقيق.",
    noDevice: "لا يوجد جهاز متصل",
    printers: "الطابعات",
    printersDetail: "تتوفر قائمة الأنواع المدعومة كمرجع إعداد فقط؛ ولا يتم إنشاء إيصال أو إرسال مهمة طباعة قبل تفعيل موصل معتمد.",
    connectionClosed: "الاتصال الخارجي مغلق",
  },
  en: {
    notEnabled: "Production hardware integration is not enabled",
    secureStopped: "Safely stopped",
    explanation: "The system does not simulate devices, fabricate scans, or send test prints. Activating printers or scanners requires an approved connector, a trusted-device policy, and documented acceptance testing before opening any USB, Bluetooth, or network connection.",
    scanning: "Scanners and Data Matrix",
    scanningDetail: "Readings from physical devices are accepted only after connector approval, device-identity verification, and audit logging.",
    noDevice: "No device is connected",
    printers: "Printers",
    printersDetail: "The supported-model list is configuration reference only; the system creates no receipt and sends no print job until an approved connector is enabled.",
    connectionClosed: "External connection is closed",
  },
} as const;

export function HardwareWorkspace() {
  const { language } = useLocalization();
  const interfaceLanguage = language === "en" ? "en" : "ar";
  const text = copy[interfaceLanguage];
  return (
    <div className="space-y-4" dir={interfaceLanguage === "ar" ? "rtl" : "ltr"}>
      <Card className="border-amber-200 bg-amber-50/70">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><div><p className="font-semibold text-amber-950">{text.notEnabled}</p><p className="mt-1 text-sm leading-6 text-amber-900">{text.explanation}</p></div></div>
          <Badge variant="outline" className="w-fit border-amber-300 bg-white text-amber-900">{text.secureStopped}</Badge>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><ScanLine className="h-5 w-5 text-violet-700" />{text.scanning}</CardTitle></CardHeader><CardContent className="space-y-3 text-sm leading-6 text-slate-600"><p>{text.scanningDetail}</p><div className="flex items-center gap-2 text-xs text-amber-800"><CircleStop className="h-4 w-4" />{text.noDevice}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Printer className="h-5 w-5 text-amber-700" />{text.printers}</CardTitle></CardHeader><CardContent className="space-y-3 text-sm leading-6 text-slate-600"><p>{text.printersDetail}</p><div className="flex items-center gap-2 text-xs text-amber-800"><Wifi className="h-4 w-4" />{text.connectionClosed}</div></CardContent></Card>
      </div>
    </div>
  );
}
