// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Sparkles, X, MessageSquare, HelpCircle, Send, Bot, ChevronLeft, ChevronRight, Layout, ShieldCheck, Activity, Settings, Info, Users, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalization } from "@/contexts/LocalizationContext";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

export function AssistantSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { direction } = useLocalization();
  const isRtl = direction === "rtl";

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const features = [
    {
      title: isRtl ? "إدارة المخزون الذكي" : "Smart Inventory Management",
      desc: isRtl ? "تتبع الأصناف، التحويلات بين الفروع، وإدارة الأدوية التالفة." : "Track items, inter-branch transfers, and manage damaged meds.",
      icon: <Layout className="h-4 w-4 text-cyan-500" />
    },
    {
      title: isRtl ? "الرقابة المالية" : "Financial Governance",
      desc: isRtl ? "تسجيل المصروفات النثرية وتقارير الرواتب المؤتمتة." : "Record miscellaneous expenses and automated payroll reports.",
      icon: <Activity className="h-4 w-4 text-emerald-500" />
    },
    {
      title: isRtl ? "أمان البيانات" : "Data Security",
      desc: isRtl ? "حماية الوقت (Time Guard) وسجلات التدقيق غير القابلة للتلاعب." : "Time Guard protection and tamper-evident audit logs.",
      icon: <ShieldCheck className="h-4 w-4 text-blue-500" />
    }
  ];

  return (
    <>
      {/* Trigger Button - Fixed Bottom Left */}
      <div 
        className={cn(
          "fixed bottom-6 z-50 transition-all duration-500",
          isRtl ? "left-6" : "right-6",
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        )}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="h-16 w-16 rounded-full bg-gradient-to-br from-[#0d1b2a] to-[#1b263b] shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-cyan-500/20 text-cyan-400 border border-cyan-500/30 group"
          size="icon"
          aria-label="Open Assistant"
        >
          <Sparkles className="h-7 w-7 transition-transform group-hover:rotate-12" />
        </Button>
      </div>

      {/* Sidebar Panel */}
      <div
        className={cn(
          "fixed inset-y-0 z-50 w-[min(420px,100vw)] bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)] transition-all duration-500 ease-in-out border-slate-200",
          isRtl ? "left-0 border-r" : "right-0 border-l",
          isOpen ? "translate-x-0" : isRtl ? "-translate-x-full" : "translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="relative overflow-hidden bg-[#0d1b2a] p-6 text-white">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-[#0d1b2a] shadow-lg shadow-cyan-500/20">
                  <Bot className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">{isRtl ? "مساعد ميدورا" : "MEDORA Assistant"}</h3>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    </span>
                    <p className="text-xs text-cyan-200/70">{isRtl ? "جاهز للمساعدة" : "Ready to assist"}</p>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="rounded-full text-white/70 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 px-6 py-8">
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  {isRtl ? "مرحباً بك" : "Welcome"}
                </h4>
                <div className="rounded-3xl bg-slate-50 p-5 border border-slate-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Sparkles className="h-12 w-12 text-cyan-600" />
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700 relative z-10">
                    {isRtl 
                      ? "أنا رفيقك الذكي في نظام ميدورا. صُممت لمساعدتك على إدارة صيدليتك بكفاءة عالية، من تتبع المخزون إلى إدارة الموارد البشرية والمالية."
                      : "I am your smart companion in the MEDORA system. Designed to help you manage your pharmacy with high efficiency, from inventory tracking to HR and finance management."}
                  </p>
                </div>
              </div>

              {/* Daily Performance Insights */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  {isRtl ? "نظرة على أداء اليوم" : "Today's Performance Insight"}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-3 w-3 text-emerald-600" />
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">{isRtl ? "حضور" : "Present"}</span>
                    </div>
                    <p className="text-2xl font-black text-emerald-900">--%</p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 p-4 border border-amber-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-3 w-3 text-amber-600" />
                      <span className="text-[10px] font-bold text-amber-700 uppercase">{isRtl ? "تأخير" : "Late"}</span>
                    </div>
                    <p className="text-2xl font-black text-amber-900">--%</p>
                  </div>
                  <div className="col-span-2 rounded-2xl bg-slate-50 p-4 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                        <AlertCircle className="h-4 w-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{isRtl ? "تحليل البيانات" : "Data Analysis"}</p>
                        <p className="text-[10px] text-slate-500">{isRtl ? "سيتم عرض تنبيهات الحضور هنا قريباً" : "Attendance alerts will appear here soon"}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 text-[10px]">
                      {isRtl ? "انتظار" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Core Capabilities */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  {isRtl ? "ماذا يمكنني أن أفعل؟" : "What can I do?"}
                </h4>
                <div className="space-y-3">
                  {features.map((f, i) => (
                    <div key={i} className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors group cursor-default">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm group-hover:shadow-md transition-shadow">
                        {f.icon}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900">{f.title}</p>
                        <p className="text-xs text-slate-500 leading-normal">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Guidance */}
              <div className="rounded-3xl bg-gradient-to-br from-cyan-50 to-blue-50 p-6 border border-cyan-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-white shadow-sm">
                    <Info className="h-4 w-4 text-cyan-600" />
                  </div>
                  <h4 className="text-sm font-bold text-cyan-900">{isRtl ? "توجيه سريع" : "Quick Guidance"}</h4>
                </div>
                <p className="text-xs text-cyan-800 leading-relaxed mb-4">
                  {isRtl 
                    ? "للحصول على أفضل تجربة، تأكد من إكمال ملف المؤسسة وربط الفروع. يمكنك دائماً العودة إلى لوحة التحكم الرئيسية للوصول السريع."
                    : "For the best experience, ensure your organization profile is complete and branches are linked. You can always return to the main dashboard for quick access."}
                </p>
                <Button variant="outline" className="w-full rounded-xl bg-white border-cyan-200 text-cyan-700 hover:bg-cyan-50 hover:border-cyan-300 text-xs font-bold gap-2 h-10">
                  {isRtl ? "فتح دليل الاستخدام" : "Open User Guide"}
                  {isRtl ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </ScrollArea>

          {/* Footer - Interactive Simulation */}
          <div className="border-t border-slate-100 p-6 bg-slate-50/50">
            <div className="relative group">
              <input
                type="text"
                placeholder={isRtl ? "اسألني عن أي شيء..." : "Ask me anything..."}
                className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm shadow-sm transition-all focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/5 group-hover:border-slate-300"
                disabled
              />
              <Button 
                size="icon" 
                className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-[#0d1b2a] hover:bg-slate-800 shadow-lg shadow-slate-900/20"
                disabled
              >
                <Send className="h-4 w-4 text-cyan-400" />
              </Button>
            </div>
            <div className="mt-4 flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{isRtl ? "نظام مؤمن" : "SECURE SYSTEM"}</span>
              </div>
              <div className="h-3 w-[1px] bg-slate-200" />
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-cyan-500" />
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{isRtl ? "ذكاء ميدورا" : "MEDORA AI"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-md transition-opacity duration-500"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
