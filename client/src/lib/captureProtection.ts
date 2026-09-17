// Layered screenshot/screen-recording deterrents (web channel).
// NOTE (honest): no web page can 100% stop an external phone camera; we BLOCK
// what's blockable, BLUR on focus loss, and WATERMARK so a leak is attributable.
let armed = false;
export interface CaptureHooks { onAttempt?: (kind: string) => void; watermarkText?: string; }

export function armCaptureProtection(hooks: CaptureHooks = {}): () => void {
  if (armed) return () => {};
  armed = true;
  const root = document.documentElement;

  const blurOn = () => { root.style.filter = "blur(14px)"; root.style.transition = "filter .12s"; };
  const blurOff = () => { root.style.filter = ""; };
  const vis = () => { if (document.hidden) { blurOn(); hooks.onAttempt?.("visibility_loss"); } };
  const focusOut = () => blurOn();
  const focusIn = () => blurOff();

  const key = (e: KeyboardEvent) => {
    const k = e.key;
    const capture =
      k === "PrintScreen" ||
      (e.ctrlKey && k.toLowerCase() === "p") ||
      (e.ctrlKey && e.shiftKey && k.toLowerCase() === "s") ||
      (e.metaKey && e.shiftKey && ["3", "4", "5"].includes(k));
    if (capture) { e.preventDefault(); e.stopPropagation(); hooks.onAttempt?.("shortcut:" + k); }
  };
  const ctx = (e: Event) => { e.preventDefault(); };
  const copy = (e: ClipboardEvent) => { e.preventDefault(); hooks.onAttempt?.("copy"); };

  // Per-user rotating watermark (traceability for external-camera leaks)
  const wm = document.createElement("div");
  wm.setAttribute("data-capture-watermark", "1");
  wm.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483647;opacity:.05;background-repeat:repeat;";
  const paint = () => {
    const t = (hooks.watermarkText ?? "MEDORA") + "  •  " + new Date().toISOString().slice(0, 16).replace("T", " ");
    wm.style.backgroundImage =
      "url(\"data:image/svg+xml;utf8," + encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='120'><text x='10' y='60' font-size='14' fill='%23000' transform='rotate(-24 130 60)'>${t}</text></svg>`) + "\")";
  };
  paint();
  const wmTimer = window.setInterval(paint, 60_000);

  document.addEventListener("visibilitychange", vis);
  window.addEventListener("blur", focusOut);
  window.addEventListener("focus", focusIn);
  window.addEventListener("keydown", key, true);
  document.addEventListener("contextmenu", ctx);
  document.addEventListener("copy", copy);
  document.addEventListener("cut", copy);
  document.body.appendChild(wm);

  return () => {
    armed = false;
    document.removeEventListener("visibilitychange", vis);
    window.removeEventListener("blur", focusOut);
    window.removeEventListener("focus", focusIn);
    window.removeEventListener("keydown", key, true);
    document.removeEventListener("contextmenu", ctx);
    document.removeEventListener("copy", copy);
    document.removeEventListener("cut", copy);
    window.clearInterval(wmTimer);
    wm.remove();
    root.style.filter = "";
  };
}
