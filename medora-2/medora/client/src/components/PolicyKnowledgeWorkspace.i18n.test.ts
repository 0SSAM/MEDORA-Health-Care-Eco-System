import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(import.meta.dirname, "PolicyKnowledgeWorkspace.tsx"), "utf8");

describe("PolicyKnowledgeWorkspace localization contract", () => {
  it("switches visible copy and the workspace direction with the active language", () => {
    expect(source).toContain('const { language, direction } = useLocalization()');
    expect(source).toContain('<div dir={direction} className="space-y-4">');
    expect(source).toContain('System policy knowledge base');
    expect(source).toContain('Search title or content…');
    expect(source).toContain('Only approved content enters the assistant context.');
    expect(source).not.toContain('return <div dir="rtl"');
  });

  it("retains human review, scoped policy access, and assistant grounding safeguards", () => {
    expect(source).toContain('includeDrafts: canManage');
    expect(source).toContain('trpc.policyKnowledge.submitForReview.useMutation');
    expect(source).toContain('trpc.policyKnowledge.approve.useMutation');
    expect(source).toContain('Draft and archived content is never used in assistant responses.');
  });
});
