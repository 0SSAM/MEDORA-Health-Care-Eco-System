// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/contexts/LocalizationContext";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, direction, setLanguage } = useLocalization();
  const nextLanguage = language === "ar" ? "en" : "ar";
  const label = language === "ar" ? "English" : "العربية";
  return (
    <Button
      type="button"
      variant="outline"
      size={compact ? "sm" : "default"}
      onClick={() => setLanguage(nextLanguage)}
      aria-label={`تغيير اللغة إلى ${label}`}
      title={`تغيير اللغة إلى ${label}`}
      className="gap-2 border-slate-200 bg-white text-slate-700 hover:bg-cyan-50 hover:text-cyan-800"
      dir={direction}
    >
      <Languages className="h-4 w-4" />
      <span>{label}</span>
    </Button>
  );
}
