import { describe, expect, it } from "vitest";
import { validateBackupCron } from "./routers/backup";

describe("backup schedule validation", () => {
  it("accepts the recommended daily and offline weekly schedules", () => {
    expect(validateBackupCron("0 0 2 * * *")).toBeNull();
    expect(validateBackupCron("0 0 3 * * 6")).toBeNull();
  });

  it("rejects the legacy five-field form and non-zero seconds", () => {
    expect(validateBackupCron("0 2 * * *")).toBe("backup-cron-six-fields-required");
    expect(validateBackupCron("30 0 2 * * *")).toBe("backup-cron-seconds-must-be-zero");
  });

  it("prevents schedules more frequent than every fifteen minutes", () => {
    expect(validateBackupCron("0 * * * * *")).toBe("backup-cron-too-frequent");
    expect(validateBackupCron("0 */5 * * * *")).toBe("backup-cron-too-frequent");
    expect(validateBackupCron("0 */15 * * * *")).toBeNull();
  });
});
