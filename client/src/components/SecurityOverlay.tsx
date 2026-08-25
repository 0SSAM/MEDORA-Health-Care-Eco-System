// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { ShieldAlert } from "lucide-react";

export function SecurityOverlay() {
  const { user } = useAuth();
  const [isTampered, setIsTampered] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Heuristic privacy and focus detection
    // Note: Web browsers cannot reliably block OS-level screenshots.
    // These events act as a deterrent and focus-mode trigger.
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Blur content when tab is hidden to protect visible data
        setIsTampered(true);
      }
    };

    const handleBlur = () => {
      // Deterrent: trigger overlay when window loses focus
      setIsTampered(true);
    };

    const handleFocus = () => {
      // Reset after a short delay when user returns
      setTimeout(() => setIsTampered(false), 300);
    };

    // PrintScreen key detection
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || (e.ctrlKey && e.key === "p")) {
        setIsTampered(true);
        e.preventDefault();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [user]);

  if (!user) return null;

  return (
    <>
      {/* Professional Deterrent Watermark: Sanitized and subtle */}
      <div 
        className="pointer-events-none fixed inset-0 z-[9998] overflow-hidden opacity-[0.02] select-none"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='10' fill='black' text-anchor='middle' transform='rotate(-25 110 110)'%3EMEDORA | ${encodeURIComponent(user.name || "User")}%3C/text%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}
      />

      {/* Privacy & Focus Deterrent Overlay */}
      {isTampered && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-xl transition-opacity duration-150">
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-white/95 p-8 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">وضع حماية البيانات</h2>
              <p className="mt-2 text-xs text-slate-500 max-w-[260px] leading-relaxed">
                تم تمويه المحتوى لحماية بيانات المرضى والخصوصية المؤسسية. عد للنافذة للمتابعة.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
