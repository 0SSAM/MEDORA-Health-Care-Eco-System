// © 2024-2026 MEDORA Health Care Eco System. All rights reserved. Proprietary and confidential.
export const CAPTURE_RISK_REASONS = [
  "visibility-change",
  "window-blur",
  "page-lifecycle",
  "print",
  "print-shortcut",
  "capture-shortcut",
  "copy",
  "context-menu",
] as const;

export type CaptureRiskReason = (typeof CAPTURE_RISK_REASONS)[number];

export function buildCaptureWatermark(label: string, scopeLabel: string) {
  const safeLabel = label.trim() || "مستخدم مصرح";
  const safeScope = scopeLabel.trim() || "نطاق مصرح";
  return `MEDORA · ${safeLabel} · ${safeScope}`;
}

export function isCaptureSensitiveReason(reason: CaptureRiskReason) {
  return CAPTURE_RISK_REASONS.includes(reason);
}

export function shouldRedactDocument(visibilityState: DocumentVisibilityState) {
  return visibilityState === "hidden";
}

export function shouldBlockProtectedShortcut(key: string, ctrlKey: boolean, metaKey: boolean) {
  const normalized = key.trim().toLowerCase();
  const modifier = ctrlKey || metaKey;
  return normalized === "printscreen" || (modifier && ["p", "c", "x", "a"].includes(normalized));
}

export function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}
