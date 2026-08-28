export type InternalAppointmentLifecycleStatus =
  | "requested"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled"
  | "no_show";

/**
 * Describes only the internally released operational state changes. It does
 * not persist a change, schedule a service, create an encounter, or establish
 * clinical, financial, or external-booking meaning.
 */
export function isPermittedInternalAppointmentStatusTransition(
  currentStatus: InternalAppointmentLifecycleStatus,
  nextStatus: InternalAppointmentLifecycleStatus,
) {
  return (currentStatus === "requested" && (nextStatus === "confirmed" || nextStatus === "cancelled"))
    || (currentStatus === "confirmed" && (
      nextStatus === "cancelled"
      || nextStatus === "no_show"
      || nextStatus === "checked_in"
    ))
    || (currentStatus === "checked_in" && nextStatus === "completed");
}
