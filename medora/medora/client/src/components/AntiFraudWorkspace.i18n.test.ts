import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/components/AntiFraudWorkspace.tsx"), "utf8");

describe("anti-fraud bilingual UI contract", () => {
  it("derives visible labels and layout direction from the active language", () => {
    expect(source).toContain('const interfaceLanguage: InterfaceLanguage = language === "en" ? "en" : "ar"');
    expect(source).toContain('const dir = interfaceLanguage === "ar" ? "rtl" : "ltr"');
    expect(source).toContain('riskNotAccusation: "Risk signals, not accusations"');
    expect(source).toContain('return <div className="space-y-5" dir={dir}>');
  });

  it("retains non-autonomous human-review transitions", () => {
    expect(source).toContain('trpc.antiFraud.transitionCase.useMutation');
    expect(source).toContain('onClick={() => move("under_review")}');
    expect(source).toContain('onClick={() => move("contained")}');
    expect(source).toContain('resolutionCode.trim().length < 1 || resolutionNote.trim().length < 1');
  });
});
