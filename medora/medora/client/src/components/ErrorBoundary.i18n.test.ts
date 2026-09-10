import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(import.meta.dirname, "ErrorBoundary.tsx"), "utf8");

describe("ErrorBoundary localization contract", () => {
  it("uses document language and direction without depending on LocalizationContext", () => {
    expect(source).toContain('document.documentElement.lang.toLowerCase().startsWith("en")');
    expect(source).toContain('const direction = isEnglish ? "ltr" : "rtl"');
    expect(source).toContain('<div dir={direction}');
    expect(source).toContain('The workspace could not be loaded');
    expect(source).toContain('Reload interface');
    expect(source).not.toContain('useLocalization');
  });

  it("retains safe diagnostics and the recovery action", () => {
    expect(source).toContain('recordSafeUiDiagnostic("workspace_boundary_error", error, "global-error-boundary")');
    expect(source).toContain('safeDiagnosticDigest(this.state.error)');
    expect(source).toContain('window.location.reload()');
  });
});
