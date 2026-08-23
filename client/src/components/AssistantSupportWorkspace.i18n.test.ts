import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(import.meta.dirname, "AssistantSupportWorkspace.tsx"), "utf8");

describe("AssistantSupportWorkspace localization and safety contract", () => {
  it("provides visible Arabic and English copy with logical direction", () => {
    expect(source).toContain('const { language, direction } = useLocalization()');
    expect(source).toContain('const uiLanguage = language === "en" ? "en" : "ar"');
    expect(source).toContain('<div dir={direction} className="space-y-4">');
    expect(source).toContain('Smart operational assistant');
    expect(source).toContain('Automated support centre');
    expect(source).toContain('المساعد التشغيلي الذكي');
    expect(source).toContain('مركز الدعم الآلي');
  });

  it("retains advisory-only assistance, smart typing, and the scoped ticket lifecycle", () => {
    expect(source).toContain('does not diagnose patients or execute entries, purchases, or permission changes');
    expect(source).toContain('دون مراجعة وتأكيد بشري');
    expect(source).toContain('smartTyping={{ organizationId, branchId, language: uiLanguage');
    expect(source).toContain('fieldName="support_ticket_subject"');
    expect(source).toContain('fieldName="support_ticket_description"');
    expect(source).toContain('trpc.assistant.createTicket.useMutation');
    expect(source).toContain('organizationId, branchId');
  });
});
