import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const workspaceSource = readFileSync(resolve(import.meta.dirname, "AssistantSupportWorkspace.tsx"), "utf8");
const chatSource = readFileSync(resolve(import.meta.dirname, "AIChatBox.tsx"), "utf8");
const smartInputSource = readFileSync(resolve(import.meta.dirname, "SmartTextInput.tsx"), "utf8");

describe("floating assistant composition contract", () => {
  it("reuses the existing scoped assistant and ticket path in overlay mode", () => {
    expect(workspaceSource).toContain("isOverlay?: boolean");
    expect(workspaceSource).toContain("initialDraft?: string");
    expect(workspaceSource).toContain("trpc.assistant.createTicket.useMutation");
    expect(workspaceSource).toContain("smartTyping={{ organizationId, branchId, language: uiLanguage");
    expect(workspaceSource).toContain("height={isOverlay ?");
  });

  it("pre-fills an editable composer without initiating an assistant request", () => {
    expect(chatSource).toContain("initialDraft?: string");
    expect(chatSource).toContain("setInput(initialDraft);");
    expect(chatSource).toContain("const submitCurrent = () => {");
    expect(chatSource).toContain("onSendMessage(trimmedInput);");
  });

  it("keeps the phone composer and Smart Typing controls horizontally usable", () => {
    expect(chatSource).toContain("flex min-w-0 flex-col gap-3");
    expect(chatSource).toContain("sm:flex-row sm:items-end");
    expect(chatSource).toContain("className=\"min-w-0 w-full max-h-32 min-h-11 resize-none sm:flex-1\"");
    expect(chatSource).toContain("className=\"h-11 w-full shrink-0 sm:h-[38px] sm:w-[38px]\"");
    expect(smartInputSource).toContain("relative min-w-0 w-full space-y-1.5");
    expect(smartInputSource).toContain("flex min-w-0 flex-col items-start");
    expect(smartInputSource).toContain("sm:flex-row sm:items-center");
    expect(smartInputSource).toContain("min-w-0 break-words");
  });
});
