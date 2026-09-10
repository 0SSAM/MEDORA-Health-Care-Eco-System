import { describe, expect, it } from "vitest";
import { assessInternalExactSlotCollision, isActiveInternalAppointmentStatus } from "./appointment-collision-policy";

const scheduledAt = new Date("2026-09-01T09:00:00.000Z");
const sameSlot = {
  organizationId: 12,
  jurisdictionId: 20,
  branchId: 30,
  facilityId: 40,
  scheduledAt,
};

describe("appointment collision policy", () => {
  it("treats only requested and confirmed appointments as active collision candidates", () => {
    expect(isActiveInternalAppointmentStatus("requested")).toBe(true);
    expect(isActiveInternalAppointmentStatus("confirmed")).toBe(true);
    expect(isActiveInternalAppointmentStatus("cancelled")).toBe(false);
    expect(isActiveInternalAppointmentStatus("no_show")).toBe(false);
    expect(isActiveInternalAppointmentStatus("checked_in")).toBe(false);
    expect(isActiveInternalAppointmentStatus("completed")).toBe(false);
  });

  it("flags only an active candidate at the same scoped facility and exact timestamp", () => {
    expect(assessInternalExactSlotCollision({ ...sameSlot, status: "requested" }, { ...sameSlot, scheduledAt: new Date(scheduledAt) })).toBe("CONFLICT_CANDIDATE");
    expect(assessInternalExactSlotCollision({ ...sameSlot, status: "confirmed" }, { ...sameSlot, scheduledAt: new Date(scheduledAt) })).toBe("CONFLICT_CANDIDATE");
  });

  it("does not treat inactive records as a conflict candidate", () => {
    expect(assessInternalExactSlotCollision({ ...sameSlot, status: "cancelled" }, sameSlot)).toBe("NO_CONFLICT_CANDIDATE");
  });

  it("does not cross organization, jurisdiction, branch, facility, or timestamp boundaries", () => {
    expect(assessInternalExactSlotCollision({ ...sameSlot, organizationId: 13, status: "requested" }, sameSlot)).toBe("NO_CONFLICT_CANDIDATE");
    expect(assessInternalExactSlotCollision({ ...sameSlot, jurisdictionId: 21, status: "requested" }, sameSlot)).toBe("NO_CONFLICT_CANDIDATE");
    expect(assessInternalExactSlotCollision({ ...sameSlot, branchId: 31, status: "requested" }, sameSlot)).toBe("NO_CONFLICT_CANDIDATE");
    expect(assessInternalExactSlotCollision({ ...sameSlot, facilityId: 41, status: "requested" }, sameSlot)).toBe("NO_CONFLICT_CANDIDATE");
    expect(assessInternalExactSlotCollision({ ...sameSlot, scheduledAt: new Date("2026-09-01T09:01:00.000Z"), status: "requested" }, sameSlot)).toBe("NO_CONFLICT_CANDIDATE");
  });
});
