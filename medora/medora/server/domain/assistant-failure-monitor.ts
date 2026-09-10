export const ASSISTANT_FAILURE_KEY = "assistant_workspace_load" as const;
export const ASSISTANT_FAILURE_THRESHOLD = 3;
export const ASSISTANT_FAILURE_WINDOW_MS = 15 * 60 * 1000;
export const ASSISTANT_FAILURE_COOLDOWN_MS = 30 * 60 * 1000;

export type AssistantFailureState = {
  failureCount: number;
  windowStartedAt: Date;
  lastAlertedAt: Date | null;
};

export function shouldNotifyAssistantFailure(state: AssistantFailureState, now: Date): boolean {
  const withinWindow = now.getTime() - state.windowStartedAt.getTime() <= ASSISTANT_FAILURE_WINDOW_MS;
  const reachedThreshold = withinWindow && state.failureCount >= ASSISTANT_FAILURE_THRESHOLD;
  const outsideCooldown = !state.lastAlertedAt || now.getTime() - state.lastAlertedAt.getTime() >= ASSISTANT_FAILURE_COOLDOWN_MS;
  return reachedThreshold && outsideCooldown;
}

export function nextAssistantFailureState(
  state: AssistantFailureState | null,
  now: Date,
): AssistantFailureState {
  if (!state || now.getTime() - state.windowStartedAt.getTime() > ASSISTANT_FAILURE_WINDOW_MS) {
    return { failureCount: 1, windowStartedAt: now, lastAlertedAt: state?.lastAlertedAt ?? null };
  }
  return { ...state, failureCount: state.failureCount + 1 };
}

export function assistantFailureAlertCopy(language: "ar" | "en" = "ar") {
  return language === "en"
    ? {
        title: "MEDORA assistant availability warning",
        body: "The assistant workspace failed repeatedly in this organization scope. Review service health; no operational action was executed.",
      }
    : {
        title: "تنبيه توافر مساعد MEDORA",
        body: "فشل تحميل مساحة المساعد عدة مرات ضمن نطاق المؤسسة. يرجى مراجعة صحة الخدمة؛ لم يُنفذ أي إجراء تشغيلي.",
      };
}
