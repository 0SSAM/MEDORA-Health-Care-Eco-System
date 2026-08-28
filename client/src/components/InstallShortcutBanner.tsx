import { useEffect, useMemo, useState } from "react";
import { Download, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/contexts/LocalizationContext";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Platform = "ios" | "android" | "desktop" | "other";

function getPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "ios";
  if (/android/.test(ua)) return "android";
  if (/windows|macintosh|linux|cros/.test(ua)) return "desktop";
  return "other";
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

export default function InstallShortcutBanner() {
  const { direction, t } = useLocalization();
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const platform = useMemo(getPlatform, []);

  useEffect(() => {
    setInstalled(isStandalone());
    setDismissed(sessionStorage.getItem("medora-install-dismissed") === "1");
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setShowInstructions(false);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || dismissed) return null;

  const dismiss = () => {
    sessionStorage.setItem("medora-install-dismissed", "1");
    setDismissed(true);
  };

  const install = async () => {
    if (!deferredPrompt) {
      setShowInstructions(true);
      return;
    }
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const instructions = platform === "ios"
    ? t("install.ios")
    : platform === "android"
      ? t("install.android")
      : platform === "desktop"
        ? t("install.desktop")
        : t("install.other");

  return (
    <aside dir={direction} className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-2xl rounded-2xl border border-cyan-200/70 bg-white/95 p-4 text-slate-900 shadow-2xl shadow-cyan-900/15 backdrop-blur-md" aria-label={t("install.bannerAria")}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl bg-cyan-50 p-2 text-cyan-700" aria-hidden="true"><Download className="size-5" /></div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold">{t("install.title")}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{t("install.detail")}</p>
            </div>
            <button type="button" onClick={dismiss} className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" aria-label={t("install.dismiss")}><X className="size-4" /></button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button type="button" onClick={install} className="bg-slate-950 text-white hover:bg-slate-800">{deferredPrompt ? t("install.now") : t("install.showMethod")}</Button>
            <Button type="button" variant="outline" onClick={() => setShowInstructions((value) => !value)} className="gap-2"><ExternalLink className="size-4" /> {t("install.deviceInstructions")}</Button>
          </div>
          {showInstructions && <p className="mt-3 rounded-xl bg-cyan-50 px-3 py-2 text-sm leading-6 text-cyan-950">{instructions}</p>}
          <p className="mt-2 text-xs text-slate-500">{t("install.notice")}</p>
        </div>
      </div>
    </aside>
  );
}
