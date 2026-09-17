import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(
  path.join(process.cwd(), "server/domain/appointment-lifecycle-policy.ts"),
  "utf8",
);

describe("appointment lifecycle policy source boundary", () => {
  it("states only the released internal transitions", () => {
    expect(source).toContain('currentStatus === "requested" && (nextStatus === "confirmed" || nextStatus === "cancelled")');
    expect(source).toContain('currentStatus === "confirmed" && (');
    expect(source).toContain('nextStatus === "no_show"');
    expect(source).toContain('nextStatus === "checked_in"');
    expect(source).toContain('currentStatus === "checked_in" && nextStatus === "completed"');
  });

  it("keeps the policy pure and separate from persistence, patient data, and external operations", () => {
    expect(source).not.toContain("getDb");
    expect(source).not.toContain("healthcareAppointments");
    expect(source).not.toContain(".select(");
    expect(source).not.toContain(".insert(");
    expect(source).not.toContain(".update(");
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("patientId");
    expect(source).not.toContain("clinicalNotes");
    expect(source).not.toContain("invoice");
    expect(source).not.toContain("calendar");
    expect(source).not.toContain("publicBooking");
  });
});
