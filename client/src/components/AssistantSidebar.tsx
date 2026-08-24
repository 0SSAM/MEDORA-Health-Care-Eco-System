// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Sparkles, X, MessageSquare, HelpCircle, Send, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalization } from "@/contexts/LocalizationContext";
import { ScrollArea } from "./ui/scroll-area";

export function AssistantSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { direction, t } = useLocalization();
  const isRtl = direction === "rtl";

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      {/* Trigger Button - Fixed Bottom Left */}
      <div 
        className={cn(
          "fixed bottom-6 z-50 transition-all duration-300",
          isRtl ? "left-6" : "right-6",
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        )}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-[#0d1b2a] shadow-xl hover:bg-[#1a2e44] text-cyan-200"
          size="icon"
          aria-label="Open Assistant"
        >
          <Sparkles className="h-6 w-6" />
        </Button>
      </div>

      {/* Sidebar Panel */}
      <div
        className={cn(
          "fixed inset-y-0 z-50 w-[min(400px,100vw)] bg-white shadow-2xl transition-transform duration-500 ease-in-out border-slate-200",
          isRtl ? "left-0 border-r" : "right-0 border-l",
          isOpen ? "translate-x-0" : isRtl ? "-translate-x-full" : "translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-[#0d1b2a] p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400 text-[#0d1b2a]">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">مساعد ميدورا الذكي</h3>
                <p className="text-[10px] text-cyan-200/70">MEDORA AI Assistant</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {/* Welcome Card */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-sm leading-relaxed text-slate-700">
                  أهلاً بك في نظام ميدورا المتكامل. أنا مساعدك الذكي، يمكنني مساعدتك في الوصول إلى الأقسام، شرح المميزات، أو توجيهك في العمليات الإدارية.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">وصول سريع</h4>
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="outline" className="justify-start gap-3 border-slate-200 text-slate-700 hover:bg-slate-50 h-auto py-3">
                    <HelpCircle className="h-4 w-4 text-cyan-600" />
                    <div className="text-right">
                      <p className="text-xs font-bold">دليل المستخدم</p>
                      <p className="text-[10px] text-slate-500">شرح تفصيلي لكل الأقسام</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start gap-3 border-slate-200 text-slate-700 hover:bg-slate-50 h-auto py-3">
                    <MessageSquare className="h-4 w-4 text-emerald-600" />
                    <div className="text-right">
                      <p className="text-xs font-bold">الدعم الفني</p>
                      <p className="text-[10px] text-slate-500">تواصل مباشر مع فريق العمل</p>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Status Section */}
              <div className="rounded-2xl border border-cyan-100 bg-cyan-50/30 p-4">
                <h4 className="text-xs font-bold text-cyan-900 mb-2">حالة النظام</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">قاعدة البيانات</span>
                    <span className="font-semibold text-rose-600">غير متصلة</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">خدمات WhatsApp</span>
                    <span className="font-semibold text-amber-600">بانتظار المفاتيح</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer Input Placeholder */}
          <div className="border-t border-slate-100 p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="اسألني أي شيء..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                disabled
              />
              <Button 
                size="icon" 
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-cyan-600 hover:bg-cyan-700"
                disabled
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-400">
              يتطلب تفعيل الذكاء الاصطناعي الكامل ربط مفاتيح API
            </p>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
