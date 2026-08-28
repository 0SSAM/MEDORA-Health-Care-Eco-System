export type BalanceScope = { organizationId: number; branchId: number; jurisdictionId: number; demo: boolean };
export type AccountKind = "supplier" | "customer";
export type LedgerEntry = { kind: AccountKind; amount: number; direction: "debit" | "credit"; scope: BalanceScope; createdByUserId: number; approvedByUserId?: number | null; approvalRequired: boolean };
export type CreditProfile = { customerId: number; scope: BalanceScope; limit: number; outstanding: number; requestedByUserId: number; approvedByUserId?: number | null };

function sameScope(a: BalanceScope, b: BalanceScope) { return a.organizationId === b.organizationId && a.branchId === b.branchId && a.jurisdictionId === b.jurisdictionId && a.demo === b.demo; }

export function calculateBalance(entries: readonly LedgerEntry[], kind: AccountKind, scope: BalanceScope) {
  return entries.filter(entry => entry.kind === kind && sameScope(entry.scope, scope)).reduce((total, entry) => total + (entry.direction === "debit" ? entry.amount : -entry.amount), 0);
}

export function requestCredit(profile: CreditProfile, actorUserId: number, requestedLimit: number) {
  if (profile.requestedByUserId !== actorUserId) throw new Error("Credit request actor is outside the account scope");
  if (!Number.isFinite(requestedLimit) || requestedLimit < 0) throw new Error("Credit limit must be non-negative");
  return { ...profile, limit: requestedLimit, approvedByUserId: null };
}

export function approveCredit(profile: CreditProfile, actorUserId: number, actorRole: "admin" | "manager" | "user") {
  if (actorRole !== "admin" && actorRole !== "manager") throw new Error("Credit approval permission required");
  if (profile.requestedByUserId === actorUserId) throw new Error("Maker-checker separation required");
  if (profile.limit < profile.outstanding) throw new Error("Credit limit cannot be below outstanding balance");
  return { ...profile, approvedByUserId: actorUserId };
}

export function validateLedgerEntry(entry: LedgerEntry, actorUserId: number) {
  if (entry.createdByUserId !== actorUserId) throw new Error("Ledger actor is outside the account scope");
  if (!Number.isFinite(entry.amount) || entry.amount <= 0) throw new Error("Ledger amount must be positive");
  if (entry.approvalRequired && !entry.approvedByUserId) throw new Error("Ledger approval is required");
  return { ...entry, auditAction: entry.scope.demo ? "balance_entry_demo" as const : "balance_entry" as const };
}
