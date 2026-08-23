import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(import.meta.dirname, "IntegratedOperationsWorkspaces.tsx"), "utf8");

describe("IntegratedOperationsWorkspaces localization contract", () => {
  it("uses the active language and logical direction for all visible operational workspaces", () => {
    expect(source).toContain('import { useLocalization } from "@/contexts/LocalizationContext"');
    expect(source).toContain('const { language, direction } = useLocalization()');
    expect(source).toContain('dir={direction}');
    expect(source).toContain('Insurance and claims');
    expect(source).toContain('Promotions');
    expect(source).toContain('Reports and scheduling');
    expect(source).toContain('Employee account management');
  });

  it("retains scope, approval, scheduling, and account-management safeguards", () => {
    expect(source).toContain('No default scope will be used.');
    expect(source).toContain('Network submission remains disabled until the official connector is accredited.');
    expect(source).toContain('server enforces the legal percentage-discount limit');
    expect(source).toContain('Automatic delivery is disabled until explicitly scheduled.');
    expect(source).toContain('trpc.organizations.createEmployee.useMutation');
    expect(source).toContain('trpc.organizations.updateEmployee.useMutation');
    expect(source).toContain('trpc.organizations.resetEmployeePassword.useMutation');
  });
});
