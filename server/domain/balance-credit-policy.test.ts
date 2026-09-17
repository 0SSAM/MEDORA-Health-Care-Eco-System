import { describe, expect, it } from "vitest";
import { approveCredit, calculateBalance, requestCredit, validateLedgerEntry, type BalanceScope, type LedgerEntry } from "./balance-credit-policy";

const scope: BalanceScope = { organizationId: 7, branchId: 3, jurisdictionId: 9, demo: true };

describe("balance and credit policy", () => {
  it("calculates only scoped supplier/customer balances", () => {
    const entries: LedgerEntry[] = [
      { kind: "supplier", amount: 100, direction: "debit", scope, createdByUserId: 1, approvalRequired: false },
      { kind: "supplier", amount: 25, direction: "credit", scope, createdByUserId: 1, approvalRequired: false },
      { kind: "supplier", amount: 999, direction: "debit", scope: { ...scope, branchId: 99 }, createdByUserId: 1, approvalRequired: false },
    ];
    expect(calculateBalance(entries, "supplier", scope)).toBe(75);
    expect(calculateBalance(entries, "customer", scope)).toBe(0);
  });

  it("requires independent approval and never approves below outstanding", () => {
    const requested = requestCredit({ customerId: 44, scope, limit: 0, outstanding: 80, requestedByUserId: 10 }, 10, 150);
    expect(() => approveCredit(requested, 10, "manager")).toThrow("Maker-checker");
    expect(approveCredit(requested, 11, "manager").approvedByUserId).toBe(11);
    expect(() => approveCredit({ ...requested, limit: 50 }, 11, "manager")).toThrow("outstanding");
  });

  it("requires approval for flagged entries and labels Demo audit events", () => {
    const entry: LedgerEntry = { kind: "customer", amount: 30, direction: "debit", scope, createdByUserId: 10, approvalRequired: true };
    expect(() => validateLedgerEntry(entry, 10)).toThrow("approval");
    expect(validateLedgerEntry({ ...entry, approvedByUserId: 11 }, 10).auditAction).toBe("balance_entry_demo");
  });
});
