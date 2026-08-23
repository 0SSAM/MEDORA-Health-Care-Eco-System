import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const home = readFileSync(resolve(root, "client/src/pages/Home.tsx"), "utf8");
const workspace = readFileSync(resolve(root, "client/src/components/AccountingLoyaltyWorkspace.tsx"), "utf8");
const router = readFileSync(resolve(root, "server/routers/erp.ts"), "utf8");

describe("accounting and loyalty workspace contract", () => {
  it("mounts the governed workspace in the finance module", () => {
    expect(home).toContain('import("@/components/AccountingLoyaltyWorkspace")');
    expect(home).toContain("<AccountingLoyaltyWorkspace organizationId={organizationId} branchId={branchId} jurisdictionId={jurisdictionId} />");
  });

  it("exposes period closing, immutable points movements, and membership lifecycle guards", () => {
    expect(router).toContain("closePeriod: protectedProcedure");
    expect(router).toContain("ensureMember: protectedProcedure");
    expect(router).toContain("recordPoints: protectedProcedure");
    expect(router).toContain("createMembership: protectedProcedure");
    expect(router).toContain("periodStatus: \"closed\"");
    expect(router).toContain("loyaltyTransactions");
  });

  it("exposes the complete governed accounting cycle", () => {
    expect(router).toContain("createAccount: protectedProcedure");
    expect(router).toContain("createExpense: protectedProcedure");
    expect(router).toContain("reviewExpense: protectedProcedure");
    expect(router).toContain("postExpense: protectedProcedure");
    expect(router).toContain("createInterBranchTransfer: protectedProcedure");
    expect(router).toContain("reviewInterBranchTransfer: protectedProcedure");
    expect(router).toContain("expenseDocuments: protectedProcedure");
    expect(router).toContain("addExpenseDocument: protectedProcedure");
    expect(router).toContain("المستند مسجل مسبقًا");
    expect(router).toContain("justification");
    expect(router).toContain("journalEntryGroupId");
    expect(router).toContain("createdByUserId: ctx.user.id");
  });

  it("uses server procedures for accounts, plans, member and memberships", () => {
    expect(workspace).toContain("trpc.erp.accounting.accounts.useQuery");
    expect(workspace).toContain("trpc.erp.accounting.postBalancedEntry.useMutation");
    expect(workspace).toContain("trpc.erp.accounting.createAccount.useMutation");
    expect(workspace).toContain("trpc.erp.accounting.createExpense.useMutation");
    expect(workspace).toContain('import { useLocalization } from "@/contexts/LocalizationContext"');
    expect(workspace).toContain('const dir = language === "en" ? "ltr" : "rtl"');
    expect(workspace).toContain("const canPost = Boolean");
    expect(workspace).toContain("trpc.erp.loyalty.plans.useQuery");
    expect(workspace).toContain("trpc.erp.loyalty.member.useQuery");
    expect(workspace).toContain("trpc.erp.loyalty.memberships.useQuery");
    expect(workspace).toContain('t("حوكمة:", "Governance:")');
  });
});
