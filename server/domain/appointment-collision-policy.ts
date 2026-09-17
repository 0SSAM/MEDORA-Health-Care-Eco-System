export type InternalAppointmentSlot = {
  organizationId: number;
  jurisdictionId: number;
  branchId: number;
  facilityId: number;
  scheduledAt: Date;
};

export type InternalAppointmentCollisionCandidate = InternalAppointmentSlot & {
  status: "requested" | "confirmed" | "checked_in" | "completed" | "cancelled" | "no_show";
};

export function isActiveInternalAppointmentStatus(status: InternalAppointmentCollisionCandidate["status"]) {
  return status === "requested" || status === "confirmed";
}

export function isSameScopedInternalAppointmentSlot(
  candidate: InternalAppointmentCollisionCandidate,
  requestedSlot: InternalAppointmentSlot,
) {
  return candidate.organizationId === requestedSlot.organizationId
    && candidate.jurisdictionId === requestedSlot.jurisdictionId
    && candidate.branchId === requestedSlot.branchId
    && candidate.facilityId === requestedSlot.facilityId
    && candidate.scheduledAt.getTime() === requestedSlot.scheduledAt.getTime();
}

/**
 * Evaluates only an exact, same-facility timestamp candidate. It is not
 * duration-overlap detection, clinician allocation, capacity planning, or a
 * concurrency-safe reservation mechanism.
 */
export function assessInternalExactSlotCollision(
  candidate: InternalAppointmentCollisionCandidate,
  requestedSlot: InternalAppointmentSlot,
) {
  return isActiveInternalAppointmentStatus(candidate.status)
    && isSameScopedInternalAppointmentSlot(candidate, requestedSlot)
    ? "CONFLICT_CANDIDATE" as const
    : "NO_CONFLICT_CANDIDATE" as const;
}
