import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(import.meta.dirname, "Home.tsx"), "utf8");

describe("Home floating assistant contract", () => {
  it("provides an authenticated, role-authorized side panel with logical RTL/LTR placement", () => {
    expect(source).toContain("DrawerContent,");
    expect(source).toContain("DrawerDescription,");
    expect(source).toContain("DrawerTitle,");
    expect(source).toContain('const [assistantOpen, setAssistantOpen] = useState(false);');
    expect(source).toContain('allowedModules.some(module => module.id === "assistant")');
    expect(source).toContain('direction={isRtl ? "left" : "right"}');
    expect(source).toContain('isRtl ? "left-5" : "right-5"');
  });

  it("keeps the assistant contextual, review-bound, keyboard-closable, and non-navigational", () => {
    expect(source).toContain("const openFloatingAssistant = () => {");
    expect(source).toContain("setAssistantDraft(");
    expect(source).toContain('if (module === "assistant") {');
    expect(source).toContain('if (event.key === "Escape" && assistantOpen)');
    expect(source).toContain("isOverlay");
    expect(source).toContain("initialDraft={assistantDraft}");
    expect(source).toContain("Guidance with human review");
  });
});
