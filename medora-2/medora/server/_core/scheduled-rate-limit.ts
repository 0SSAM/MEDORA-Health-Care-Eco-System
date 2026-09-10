// © 2024-2026 MEDORA Health Care Eco System. All rights reserved. Proprietary and confidential.

/**
 * Heartbeat callbacks are authenticated independently by their handlers. This
 * narrow in-process guard bounds unauthenticated traffic before it can reach
 * those handlers; it is intentionally not a scheduler or a second API layer.
 */
export const scheduledCallbackRateLimitOptions = {
  windowMs: 60_000,
  limit: 30,
  standardHeaders: "draft-8" as const,
  legacyHeaders: false,
  message: { error: "Too many scheduled callback requests" },
};
