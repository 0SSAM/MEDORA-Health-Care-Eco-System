import { describe, expect, it } from "vitest";
import {
  ASSISTANT_FAILURE_COOLDOWN_MS,
  ASSISTANT_FAILURE_THRESHOLD,
  ASSISTANT_FAILURE_WINDOW_MS,
  assistantFailureAlertCopy,
  nextAssistantFailureState,
  shouldNotifyAssistantFailure,
} from "./assistant-failure-monitor";

describe("assistant failure monitoring policy", () => {
  const start = new Date("2026-08-21T10:00:00.000Z");

  it("counts failures inside the bounded window and alerts only at the threshold", () => {
    const first = nextAssistantFailureState(null, start);
    const second = nextAssistantFailureState(first, new Date(start.getTime() + 1_000));
    const third = nextAssistantFailureState(second, new Date(start.getTime() + 2_000));

    expect(ASSISTANT_FAILURE_THRESHOLD).toBe(3);
    expect(third.failureCount).toBe(3);
    expect(shouldNotifyAssistantFailure(third, new Date(start.getTime() + 2_000))).toBe(true);
  });

  it("resets the count after the window while preserving the last alert timestamp", () => {
    const state = { failureCount: 3, windowStartedAt: start, lastAlertedAt: start };
    const next = nextAssistantFailureState(state, new Date(start.getTime() + ASSISTANT_FAILURE_WINDOW_MS + 1));

    expect(next.failureCount).toBe(1);
    expect(next.lastAlertedAt).toEqual(start);
  });

  it("suppresses repeated alerts while the prior failure window is active and after it expires", () => {
    const state = { failureCount: 3, windowStartedAt: start, lastAlertedAt: start };

    expect(shouldNotifyAssistantFailure(state, new Date(start.getTime() + ASSISTANT_FAILURE_COOLDOWN_MS - 1))).toBe(false);
    expect(shouldNotifyAssistantFailure(state, new Date(start.getTime() + ASSISTANT_FAILURE_COOLDOWN_MS))).toBe(false);
  });

  it("provides bilingual copy without operational claims", () => {
    expect(assistantFailureAlertCopy("ar").body).toContain("لم يُنفذ أي إجراء تشغيلي");
    expect(assistantFailureAlertCopy("en").body).toContain("no operational action was executed");
  });
});
