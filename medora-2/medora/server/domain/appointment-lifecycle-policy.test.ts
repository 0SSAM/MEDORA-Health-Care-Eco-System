import { describe, expect, it } from "vitest";
import { isPermittedInternalAppointmentStatusTransition } from "./appointment-lifecycle-policy";

describe("appointment lifecycle policy", () => {
  it("permits only the internally released transitions", () => {
    expect(isPermittedInternalAppointmentStatusTransition("requested", "confirmed")).toBe(true);
    expect(isPermittedInternalAppointmentStatusTransition("requested", "cancelled")).toBe(true);
    expect(isPermittedInternalAppointmentStatusTransition("confirmed", "cancelled")).toBe(true);
    expect(isPermittedInternalAppointmentStatusTransition("confirmed", "no_show")).toBe(true);
    expect(isPermittedInternalAppointmentStatusTransition("confirmed", "checked_in")).toBe(true);
    expect(isPermittedInternalAppointmentStatusTransition("checked_in", "completed")).toBe(true);
  });

  it("rejects skipped, reversed, repeated, and terminal-state transitions", () => {
    expect(isPermittedInternalAppointmentStatusTransition("requested", "checked_in")).toBe(false);
    expect(isPermittedInternalAppointmentStatusTransition("requested", "completed")).toBe(false);
    expect(isPermittedInternalAppointmentStatusTransition("confirmed", "completed")).toBe(false);
    expect(isPermittedInternalAppointmentStatusTransition("checked_in", "cancelled")).toBe(false);
    expect(isPermittedInternalAppointmentStatusTransition("completed", "completed")).toBe(false);
    expect(isPermittedInternalAppointmentStatusTransition("cancelled", "requested")).toBe(false);
    expect(isPermittedInternalAppointmentStatusTransition("no_show", "confirmed")).toBe(false);
  });
});
