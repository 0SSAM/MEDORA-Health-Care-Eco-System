import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

type SmartTextInputProps = {
  as?: "input" | "textarea";
  value: string;
  onValueChange: (value: string) => void;
  organizationId: number | null;
  branchId: number | null;
  language: "ar" | "en";
  screen: string;
  fieldName: "assistant_chat" | "support_ticket_subject" | "support_ticket_description" | "procurement_justification";
  placeholder?: string;
  ariaLabel: string;
  disabled?: boolean;
  rows?: number;
  className?: string;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

/**
 * A transient, opt-in drafting aid. The model receives a short debounced
 * fragment only after local privacy checks; no fragment or suggestion is saved.
 * The user must explicitly choose a suggestion before the field value changes.
 */
export function SmartTextInput({
  as = "input",
  value,
  onValueChange,
  organizationId,
  branchId,
  language,
  screen,
  fieldName,
  placeholder,
  ariaLabel,
  disabled = false,
  rows = 3,
  className,
  onKeyDown,
}: SmartTextInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isComposing, setIsComposing] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const requestSerial = useRef(0);
  const suggest = trpc.assistant.smartSuggest.useMutation();
  const requestSuggestionRef = useRef(suggest.mutateAsync);
  requestSuggestionRef.current = suggest.mutateAsync;
  const suggestionId = `smart-typing-${fieldName}`;
  const isArabic = language === "ar";
  const copy = isArabic
    ? {
        label: "اقتراحات كتابة اختيارية",
        enable: "تفعيل اقتراحات الكتابة",
        disable: "إيقاف اقتراحات الكتابة",
        hint: "اقتراحات مؤقتة؛ لا تُحفظ ولا تنفذ أي إجراء. استخدم Tab لقبول اقتراح أو الأسهم للتنقل.",
        inactive: "فعّل الاقتراحات إن رغبت. لا يُرسل النص إلى المساعد قبل تفعيلك الصريح.",
        loading: "جارٍ إعداد اقتراح…",
      }
    : {
        label: "Optional writing suggestions",
        enable: "Enable writing suggestions",
        disable: "Turn off writing suggestions",
        hint: "Suggestions are temporary, saved nowhere, and take no action. Press Tab to accept or use the arrows to browse.",
        inactive: "Enable suggestions if you want them. No text is sent to the assistant until you explicitly enable this control.",
        loading: "Preparing a suggestion…",
      };

  useEffect(() => {
    const text = value.trim();
    const serial = ++requestSerial.current;
    setActiveIndex(-1);

    if (!organizationId || disabled || !enabled || isComposing || text.length < 6) {
      setSuggestions([]);
      return;
    }

    const timer = window.setTimeout(() => {
      void requestSuggestionRef.current({
        organizationId,
        branchId,
        language,
        screen,
        fieldName,
        partialText: text,
      }).then((result) => {
        if (requestSerial.current === serial) setSuggestions(result.suggestions);
      }).catch(() => {
        // Smart typing is intentionally silent when unavailable. The field keeps
        // working as a normal input and no partial text is logged in the browser.
        if (requestSerial.current === serial) setSuggestions([]);
      });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [branchId, disabled, enabled, fieldName, isComposing, language, organizationId, screen, value]);

  const accept = (suggestion: string) => {
    onValueChange(suggestion);
    setSuggestions([]);
    setActiveIndex(-1);
  };

  const toggleEnabled = () => {
    setEnabled((current) => !current);
    setSuggestions([]);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (suggestions.length > 0 && event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
      return;
    }
    if (suggestions.length > 0 && event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
      return;
    }
    if (suggestions.length > 0 && event.key === "Tab") {
      event.preventDefault();
      accept(suggestions[activeIndex >= 0 ? activeIndex : 0]);
      return;
    }
    if (event.key === "Escape") {
      setSuggestions([]);
      setActiveIndex(-1);
    }
    onKeyDown?.(event);
  };

  const sharedProps = {
    value,
    disabled,
    placeholder,
    "aria-label": ariaLabel,
    "aria-controls": suggestions.length ? suggestionId : undefined,
    "aria-expanded": suggestions.length > 0,
    autoComplete: "off",
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onValueChange(event.target.value),
    onKeyDown: handleKeyDown,
    onCompositionStart: () => setIsComposing(true),
    onCompositionEnd: () => setIsComposing(false),
    className: cn(className, "relative z-10"),
  };

  return (
    <div className="relative min-w-0 w-full space-y-1.5" dir={isArabic ? "rtl" : "ltr"} data-smart-typing>
      {as === "textarea" ? <Textarea {...sharedProps} rows={rows} /> : <Input {...sharedProps} />}
      <div className="flex min-w-0 flex-col items-start gap-1.5 text-[11px] leading-4 text-muted-foreground sm:flex-row sm:items-center" aria-live="polite">
        <button
          type="button"
          disabled={disabled}
          aria-pressed={enabled}
          onClick={toggleEnabled}
          className={cn("inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", enabled ? "bg-cyan-100 text-cyan-900 hover:bg-cyan-200" : "bg-muted text-muted-foreground hover:bg-muted/70")}
        >
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          {enabled ? copy.disable : copy.enable}
        </button>
        {enabled && suggest.isPending ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> : null}
        <span className="min-w-0 break-words">{enabled ? (suggest.isPending ? copy.loading : copy.hint) : copy.inactive}</span>
      </div>
      {suggestions.length > 0 && (
        <div id={suggestionId} role="listbox" aria-label={copy.label} className="absolute z-30 mt-1 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg">
          <div className="border-b bg-muted/60 px-3 py-2 text-xs font-medium">{copy.label}</div>
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion}-${index}`}
              type="button"
              role="option"
              aria-selected={activeIndex === index}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => accept(suggestion)}
              className={cn(
                "block w-full px-3 py-2 text-start text-sm transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none",
                activeIndex === index && "bg-accent",
              )}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
