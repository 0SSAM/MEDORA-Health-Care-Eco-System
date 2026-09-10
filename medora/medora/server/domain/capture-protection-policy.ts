/**
 * Capture-protection policy: layered deterrents against screenshots,
 * screen recording and "photograph the screen with another phone" (shoulder-cam).
 * Honest model: a determined attacker with a second physical camera can NEVER be
 * blocked at 100% in a browser, so the policy combines BLOCK + DETECT + BLUR + TRACE.
 */
export type CaptureChannel = "web" | "electron" | "mobile";

export interface CaptureProtectionDecision {
  channel: CaptureChannel;
  /** hard OS-level block possible (Electron setContentProtection / FLAG_SECURE) */
  osBlock: boolean;
  /** in-app mitigations applied in the web layer */
  mitigations: string[];
  /** forensic/audit signals emitted */
  detection: string[];
  /** residual risk note (must never claim 100% against external cameras) */
  residualRisk: string;
}

const COMMON_WEB_MITIGATIONS = [
  "page_blur_on_visibilitychange",       // hide content when tab/window loses focus
  "block_context_menu_and_shortcuts",    // PrintScreen / Cmd+Shift+3-5 / Ctrl+P etc.
  "css_user_select_none_on_sensitive",   // reduce copy
  "canvas_overlay_watermark",            // per-user rotating watermark (traceability)
  "copy_cut_block_on_sensitive_fields",
];

export function evaluateCaptureProtection(channel: CaptureChannel): CaptureProtectionDecision {
  const base = {
    mitigations: [...COMMON_WEB_MITIGATIONS],
    detection: [
      "visibility_loss_event",
      "printscreen_attempt_event",
      "devtools_open_heuristic",
      "screen_share_getDisplayMedia_guard",
    ],
    residualRisk:
      "لا يمكن لأي متصفح منع كاميرا خارجية بنسبة 100%؛ لذلك نعتمد العلامة المائية التتبعية + التمويه عند فقدان التركيز + السجل التدقيقي.",
  };
  if (channel === "electron") {
    return {
      channel,
      osBlock: true, // setContentProtection(true) + setMediaKeysPresenters
      mitigations: [...base.mitigations, "os_setContentProtection_true"],
      detection: [...base.detection, "electron_display_capture_attempt"],
      residualRisk: base.residualRisk,
    };
  }
  if (channel === "mobile") {
    return {
      channel,
      osBlock: true, // FLAG_SECURE (Android) / UIScreen capture notifications (iOS)
      mitigations: [...base.mitigations, "platform_flag_secure"],
      detection: [...base.detection, "screenshot_taken_notification"],
      residualRisk: base.residualRisk,
    };
  }
  return { channel, osBlock: false, ...base };
}

/** Watermark rotation makes a leaked photo attributable to a user+timestamp. */
export function watermarkPayload(userId: number, orgId: number, at: number): string {
  return `MEDORA•u${userId}•o${orgId}•${new Date(at).toISOString().replace(/[-:T.Z]/g, "").slice(0, 12)}`;
}

/** Whether a keydown should be swallowed (screenshot/print shortcuts). */
export function isCaptureShortcut(key: string, meta: boolean, ctrl: boolean, shift: boolean): boolean {
  if (key === "PrintScreen") return true;
  if (ctrl && key.toLowerCase() === "p") return true;             // print
  if (ctrl && shift && key.toLowerCase() === "s") return true;    // save page
  if (meta && shift && ["3", "4", "5"].includes(key)) return true; // macOS capture
  return false;
}
