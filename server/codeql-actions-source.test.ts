import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const workflowPath = resolve(process.cwd(), ".github/workflows/codeql-actions-source.yml");

describe("default CodeQL Actions source", () => {
  it("retains a permissionless manual Actions source without restoring advanced CodeQL", () => {
    const workflow = readFileSync(workflowPath, "utf8");

    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("permissions: {}");
    expect(workflow).toContain('test "${GITHUB_ACTIONS}" = "true"');
    expect(workflow).not.toMatch(/github\/codeql-action/i);
    expect(workflow).not.toMatch(/^\s*(push|pull_request):/m);
  });
});
