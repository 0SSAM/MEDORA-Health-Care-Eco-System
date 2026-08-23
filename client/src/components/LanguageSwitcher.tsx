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
