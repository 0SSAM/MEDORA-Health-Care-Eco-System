import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(
  path.join(process.cwd(), "server/domain/appointment-collision-policy.ts"),
  "utf8",
);

describe("appointment collision policy source boundary", () => {
  it("limits collision assessment to active requested/confirmed records at one exact scoped facility slot", () => {
    expect(source).toContain('status === "requested" || status === "confirmed"');
    expect(source).toContain("candidate.organizationId === requestedSlot.organizationId");
    expect(source).toContain("candidate.jurisdictionId === requestedSlot.jurisdictionId");
    expect(source).toContain("candidate.branchId === requestedSlot.branchId");
    expect(source).toContain("candidate.facilityId === requestedSlot.facilityId");
    expect(source).toContain("candidate.scheduledAt.getTime() === requestedSlot.scheduledAt.getTime()");
    expect(source).toContain('"CONFLICT_CANDIDATE"');
  });

  it("keeps the policy pure and separate from persistence, public booking, messaging, and calendars", () => {
    expect(source).not.toContain("getDb");
    expect(source).not.toContain("healthcareAppointments");
    expect(source).not.toContain(".select(");
    expect(source).not.toContain(".insert(");
    expect(source).not.toContain(".update(");
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("calendar");
    expect(source).not.toContain("notification");
    expect(source).not.toContain("publicBooking");
  });
});
