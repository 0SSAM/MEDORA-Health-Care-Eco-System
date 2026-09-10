export const SMART_TYPING_FIELDS = [
  "assistant_chat",
  "support_ticket_subject",
  "support_ticket_description",
  "procurement_justification",
] as const;

export type SmartTypingField = (typeof SMART_TYPING_FIELDS)[number];

export type SmartTypingSafety =
  | { allowed: true }
  | { allowed: false; reason: "too_short" | "sensitive_content" };

const sensitivePattern = /(?:\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b|(?:\+?\d[\s()\-]*){8,}\d|\b(?:password|passcode|secret|token|api[ _-]?key|patient[ _-]?id|medical[ _-]?record)\b|كلمة\s*المرور|رمز\s*(?:الدخول|التحقق)|رقم\s*(?:قومي|هوية|مريض|ملف))/i;
const clinicalPattern = /\b(?:diagnos(?:is|es)|dose|dosage|prescription|patient)\b|(?:تشخيص|جرعة|وصفة|مريض)/i;

/**
 * Smart typing is deliberately limited to non-clinical, non-credential drafting
 * fields. It never stores the partial text and does not make a sensitive
 * request when obvious identifiers or secrets are present.
 */
export function assessSmartTypingSafety(partialText: string): SmartTypingSafety {
  const normalized = partialText.trim();
  if (normalized.length < 6) return { allowed: false, reason: "too_short" };
  if (sensitivePattern.test(normalized) || clinicalPattern.test(normalized)) {
    return { allowed: false, reason: "sensitive_content" };
  }
  return { allowed: true };
}

/**
 * Treat model output as untrusted. Suggestions are plain, single-line draft
 * replacements, capped in length and stripped of any sensitive or markup-like
 * payload before returning them to the browser.
 */
export function sanitizeSmartTypingSuggestions(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();

  return value.flatMap((entry) => {
    if (typeof entry !== "string") return [];
    const suggestion = entry.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
    const key = suggestion.toLocaleLowerCase();
    if (
      suggestion.length < 3 ||
      suggestion.length > 180 ||
      /[<>`{}]/.test(suggestion) ||
      /\b(?:https?:\/\/|www\.)/i.test(suggestion) ||
      sensitivePattern.test(suggestion) ||
      clinicalPattern.test(suggestion) ||
      seen.has(key)
    ) {
      return [];
    }
    seen.add(key);
    return [suggestion];
  }).slice(0, 3);
}
