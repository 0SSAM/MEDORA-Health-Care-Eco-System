import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(process.cwd());
const assistantRouter = readFileSync(resolve(root, "server/routers/assistant.ts"), "utf8");
const policy = readFileSync(resolve(root, "server/domain/smart-typing-policy.ts"), "utf8");
const smartInput = readFileSync(resolve(root, "client/src/components/SmartTextInput.tsx"), "utf8");
const assistantWorkspace = readFileSync(resolve(root, "client/src/components/AssistantSupportWorkspace.tsx"), "utf8");

describe("smart typing contract", () => {
  it("keeps suggestions protected, scoped, advisory, and non-persistent", () => {
    expect(assistantRouter).toContain("smartSuggest: protectedProcedure");
    expect(assistantRouter).toContain("await assertScope");
    expect(assistantRouter).toContain("branchUsers");
    expect(assistantRouter).toContain("advisoryOnly: true");
    expect(assistantRouter).toContain("maxTokens: 180");
    expect(assistantRouter).toContain("sanitizeSmartTypingSuggestions");
    expect(assistantRouter).not.toMatch(/smartSuggest[\s\S]{0,2500}\.insert\(/);
  });

  it("rejects obvious sensitive fragments and sanitizes model output", () => {
    expect(policy).toContain("sensitivePattern");
    expect(policy).toContain("clinicalPattern");
    expect(policy).toContain("sanitizeSmartTypingSuggestions");
  });

  it("provides a debounced keyboard-accessible chooser in assistant and support fields", () => {
    expect(smartInput).toContain("window.setTimeout");
    expect(smartInput).toContain('role="listbox"');
    expect(smartInput).toContain('event.key === "Tab"');
    expect(assistantWorkspace).toContain("SmartTextInput");
    expect(assistantWorkspace).toContain("smartTyping={{");
  });
});
