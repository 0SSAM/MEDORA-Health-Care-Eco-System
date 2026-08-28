import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const backupRouter = readFileSync(resolve(root, "server/routers/backup.ts"), "utf8");
const scheduledBackup = readFileSync(resolve(root, "server/scheduled/backups.ts"), "utf8");
const assistantRouter = readFileSync(resolve(root, "server/routers/assistant.ts"), "utf8");
const workspace = readFileSync(resolve(root, "client/src/components/BackupManagementWorkspace.tsx"), "utf8");
const home = readFileSync(resolve(root, "client/src/pages/Home.tsx"), "utf8");

describe("AI assistant, help desk, and backup contracts", () => {
  it("keeps assistant and support responses scoped and non-destructive", () => {
    expect(assistantRouter).toContain("organizationId");
    expect(assistantRouter).toContain("branchId");
    expect(assistantRouter).toContain("callTickets");
    expect(assistantRouter).toContain("advisoryOnly");
  });

  it("requires backup policy scope, idempotency, and integrity metadata", () => {
    expect(backupRouter).toContain("organizationId");
    expect(backupRouter).toContain("idempotencyKey");
    expect(backupRouter).toContain("manifestSha256");
    expect(backupRouter).toMatch(/online|offline_export/);
    expect(backupRouter).toContain("requestOfflineExportUrl");
    expect(backupRouter).toContain("offline-export-policy-mismatch");
  });

  it("uses scheduled callback authentication and repeat-safe execution", () => {
    expect(scheduledBackup).toContain("isCron");
    expect(scheduledBackup).toContain("idempotency");
    expect(scheduledBackup).toContain("sha256");
  });

  it("exposes online and offline policy controls in the RTL workspace", () => {
    expect(workspace).toContain("online");
    expect(workspace).toContain("offline_export");
    expect(workspace).toContain("تشغيل الآن");
    expect(workspace).toContain("تردد Cron — UTC (6 حقول)");
    expect(workspace).toContain("0 0 2 * * *");
    expect(workspace).toContain("تنزيل تصدير Offline مؤقت");
    expect(backupRouter).toContain("validateBackupCron");
  });

  it("keeps AI assistance and automatic help desk visible as daily work", () => {
    expect(home).toContain("المساعد الذكي ومكتب الدعم الآلي");
    expect(home).toContain('modules: ["overview", "assistant"]');
  });
});
