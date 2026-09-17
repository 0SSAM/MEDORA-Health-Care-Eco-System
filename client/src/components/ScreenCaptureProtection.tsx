// © 2024-2026 MEDORA Health Care Eco System. All rights reserved. Proprietary and confidential.
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocalization } from "@/contexts/LocalizationContext";
import { buildCaptureWatermark, isEditableTarget, shouldBlockProtectedShortcut, shouldRedactDocument, type CaptureRiskReason } from "@/lib/screenCaptureProtection";

interface ScreenCaptureProtectionProps {
  enabled: boolean;
  label: string;
  scopeLabel: string;
  children: ReactNode;
}

export function ScreenCaptureProtection({ enabled, label, scopeLabel, children }: ScreenCaptureProtectionProps) {
  const [redacted, setRedacted] = useState(false);
  const [reason, setReason] = useState<CaptureRiskReason | null>(null);
  const { language, direction } = useLocalization();
  const copy = language === "ar"
    ? {
        title: "تم إخفاء البيانات الحساسة مؤقتًا",
        detail: "تظل بيانات MEDORA محمية عند فقد التركيز أو تبديل التطبيق أو محاولة النسخ أو الطباعة. عُد إلى التطبيق للمتابعة.",
        print: "الطباعة والنسخ محجوبان في هذه المساحة.",
        enabled: "حماية الالتقاط مفعلة.",
      }
    : {
        title: "Sensitive data is temporarily hidden",
        detail: "MEDORA data remains protected when focus is lost, the app changes, or copying or printing is attempted. Return to the application to continue.",
        print: "Printing and copying are blocked in this workspace.",
        enabled: "Capture protection is active.",
      };
  const watermark = useMemo(() => buildCaptureWatermark(label, scopeLabel), [label, scopeLabel]);

  useEffect(() => {
    if (!enabled) {
      setRedacted(false);
      setReason(null);
      return;
    }

    let restoreTimer: number | undefined;
    const redact = (nextReason: CaptureRiskReason) => {
      if (restoreTimer !== undefined) window.clearTimeout(restoreTimer);
      setReason(nextReason);
      setRedacted(true);
      window.dispatchEvent(new CustomEvent("medora:capture-risk", { detail: { reason: nextReason, occurredAt: new Date().toISOString() } }));
    };
    const restore = () => {
      if (restoreTimer !== undefined) window.clearTimeout(restoreTimer);
      restoreTimer = window.setTimeout(() => {
        setRedacted(false);
        setReason(null);
      }, 450);
    };
    const onVisibilityChange = () => {
      if (shouldRedactDocument(document.visibilityState)) redact("visibility-change");
      else restore();
    };
    const onBlur = () => redact("window-blur");
    const onFocus = () => restore();
    const onBeforePrint = () => redact("print");
    const onAfterPrint = () => restore();
    const onPageHide = () => redact("page-lifecycle");
    const onPageShow = () => restore();
    const onKeyDown = (event: KeyboardEvent) => {
      if (!shouldBlockProtectedShortcut(event.key, event.ctrlKey, event.metaKey)) return;
      const printAttempt = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p";
      const captureAttempt = event.key.toLowerCase() === "printscreen";
      if (!printAttempt && !captureAttempt && isEditableTarget(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
      redact(printAttempt ? "print-shortcut" : captureAttempt ? "capture-shortcut" : "copy");
    };
    const onCopyOrCut = (event: ClipboardEvent) => {
      if (isEditableTarget(event.target)) return;
      event.preventDefault();
      redact("copy");
    };
    const onContextMenu = (event: MouseEvent) => {
      if (isEditableTarget(event.target)) return;
      event.preventDefault();
      redact("context-menu");
    };
    const onSelectionOrDrag = (event: Event) => {
      if (isEditableTarget(event.target)) return;
      event.preventDefault();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", onAfterPrint);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("copy", onCopyOrCut, true);
    document.addEventListener("cut", onCopyOrCut, true);
    document.addEventListener("contextmenu", onContextMenu, true);
    document.addEventListener("selectstart", onSelectionOrDrag, true);
    document.addEventListener("dragstart", onSelectionOrDrag, true);
    document.documentElement.dataset.captureProtection = "enabled";
    const cacheMeta = document.createElement("meta");
    cacheMeta.httpEquiv = "Cache-Control";
    cacheMeta.content = "no-store, no-cache, must-revalidate";
    cacheMeta.dataset.medoraCaptureProtection = "true";
    document.head.appendChild(cacheMeta);

    return () => {
      if (restoreTimer !== undefined) window.clearTimeout(restoreTimer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("copy", onCopyOrCut, true);
      document.removeEventListener("cut", onCopyOrCut, true);
      document.removeEventListener("contextmenu", onContextMenu, true);
      document.removeEventListener("selectstart", onSelectionOrDrag, true);
      document.removeEventListener("dragstart", onSelectionOrDrag, true);
      delete document.documentElement.dataset.captureProtection;
      cacheMeta.remove();
    };
  }, [enabled]);

  return (
    <div className="relative min-h-screen" dir={direction} data-capture-protected={enabled ? "true" : "false"}>
      <div className={redacted ? "pointer-events-none select-none blur-xl" : undefined} aria-hidden={redacted}>
        {children}
      </div>
      {enabled && <div className="pointer-events-none fixed inset-0 z-[55] grid grid-cols-2 content-around gap-x-8 overflow-hidden px-4 py-12 opacity-[0.16] sm:grid-cols-3 sm:gap-x-16" aria-hidden="true">{Array.from({ length: 15 }, (_, index) => <span key={index} className="select-none whitespace-nowrap text-center text-[10px] font-bold tracking-[0.14em] text-slate-950 [transform:rotate(-24deg)] sm:text-xs">{watermark}</span>)}</div>}
      {enabled && <div className="pointer-events-none fixed bottom-2 left-2 z-[56] max-w-[calc(100vw-1rem)] rounded-md bg-slate-950/75 px-2 py-1 text-[9px] font-medium tracking-wide text-white/85" aria-hidden="true">{watermark}</div>}
      {redacted && <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/95 p-6 text-center text-white" role="status" aria-live="assertive">
        <div className="max-w-sm rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
          <p className="text-base font-bold">{copy.title}</p>
          <p className="mt-2 text-sm leading-6 text-white/75">{copy.detail}</p>
          <p className="mt-3 text-[11px] text-cyan-200">{reason === "print" ? copy.print : copy.enabled}</p>
        </div>
      </div>}
    </div>
  );
}
