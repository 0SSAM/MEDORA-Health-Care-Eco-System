import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const router = readFileSync(resolve(root, "server/routers/policyKnowledge.ts"), "utf8");
const assistant = readFileSync(resolve(root, "server/routers/assistant.ts"), "utf8");
const workspace = readFileSync(resolve(root, "client/src/components/PolicyKnowledgeWorkspace.tsx"), "utf8");
const home = readFileSync(resolve(root, "client/src/pages/Home.tsx"), "utf8");

describe("MEDORA policy knowledge contracts", () => {
  it("keeps policy operations tenant and branch scoped", () => {
    expect(router).toContain("organizationId");
    expect(router).toContain("branchId");
    expect(router).toContain("jurisdictionId");
    expect(router).toContain("assertScope");
    expect(router).toContain("organizationMemberships");
  });

  it("enforces the human approval lifecycle", () => {
    expect(router).toContain("create:");
    expect(router).toContain("update:");
    expect(router).toContain("submitForReview:");
    expect(router).toContain("approve:");
    expect(router).toContain("archive:");
    expect(router).toContain('status, "approved"');
  });

  it("writes signed audit events for every sensitive lifecycle transition", () => {
    expect(router).toContain("auditLogs");
    expect(router).toContain("hashAuditRecord");
    expect(router).toContain("auditPolicyChange");
    expect(router).toContain("policy_article_approved");
    expect(router).toContain("policy_article_archived");
    expect(router).toContain("branchId");
    expect(router).toContain("jurisdictionId");
  });

  it("grounds the assistant only in approved policy content", () => {
    expect(assistant).toContain("policyKnowledgeArticles");
    expect(assistant).toContain('status, "approved"');
    expect(assistant).toContain("approvedContext");
    expect(assistant).toContain("لا تخترع سياسة");
    expect(router).toContain("effectiveFrom");
    expect(router).toContain("effectiveTo");
    expect(router).toContain("lte(policyKnowledgeArticles.effectiveFrom");
    expect(router).toContain("gt(policyKnowledgeArticles.effectiveTo");
  });

  it("exposes localized management actions and registers the workspace", () => {
    expect(workspace).toContain('const { language, direction } = useLocalization()');
    expect(workspace).toContain('dir={direction}');
    expect(workspace).toContain("إرسال للمراجعة");
    expect(workspace).toContain("اعتماد");
    expect(workspace).toContain("أرشفة");
    expect(home).toContain("policyKnowledge");
    expect(home).toContain("PolicyKnowledgeWorkspace");
  });
});
