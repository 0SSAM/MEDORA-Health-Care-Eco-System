// MEDORA | ميدورا — Integrated Health Care System
// Inventory Transfer Domain Policy
// Defines the state machine and validation rules for inter-branch stock movements.

export type TransferStatus = "draft" | "requested" | "approved" | "packed" | "in_transit" | "received" | "partially_received" | "rejected" | "cancelled";
export type TransferEvent = "submit" | "approve" | "pack" | "dispatch" | "receive" | "reject" | "cancel";

const transitions: Record<TransferStatus, Partial<Record<TransferEvent, TransferStatus>>> = {
  draft: { submit: "requested", cancel: "cancelled" },
  requested: { approve: "approved", reject: "rejected", cancel: "cancelled" },
  approved: { pack: "packed", cancel: "cancelled" },
  packed: { dispatch: "in_transit", cancel: "cancelled" },
  in_transit: { receive: "received" },
  received: {},
  partially_received: {},
  rejected: {},
  cancelled: {},
};

export function canTransitionTransfer(current: TransferStatus, event: TransferEvent): boolean {
  return !!transitions[current][event];
}

export function getNextTransferStatus(current: TransferStatus, event: TransferEvent): TransferStatus {
  const next = transitions[current][event];
  if (!next) throw new Error(`INVALID_TRANSFER_TRANSITION: ${current} -> ${event}`);
  return next;
}

export function validateTransferQuantity(requested: number, shipped: number, received: number) {
  if (shipped > requested) throw new Error("SHIPPED_EXCEEDS_REQUESTED");
  if (received > shipped) throw new Error("RECEIVED_EXCEEDS_SHIPPED");
  return true;
}

export function normalizeTransferNumber(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
}
