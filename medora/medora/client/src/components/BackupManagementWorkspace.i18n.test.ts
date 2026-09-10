import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Backup management localization", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/components/BackupManagementWorkspace.tsx"), "utf8");

  it("derives copy and layout direction from the active localization", () => {
    expect(source).toContain('const { language, direction } = useLocalization()');
    expect(source).toContain('const isEnglish = language === "en"');
    expect(source).toContain('<div dir={direction} className="space-y-5">');
    expect(source).not.toContain('<div dir="rtl"');
  });

  it("keeps English labels for all primary backup actions", () => {
    expect(source).toContain('createSchedule: "Create & schedule"');
    expect(source).toContain('runNow: "Run now"');
    expect(source).toContain('downloadOffline: "Download temporary Offline export"');
  });
});
