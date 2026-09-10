import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("external engineering guidance adaptation", () => {
  it("retains MEDORA safety boundaries", () => {
    const document = readFileSync(
      resolve(process.cwd(), "docs/engineering/karpathy-guidelines-adaptation.md"),
      "utf8",
    );

    expect(document).toContain("protected authorization");
    expect(document).toContain("organization, branch, and jurisdiction");
    expect(document).toContain("human review");
    expect(document).toContain("No executable code was copied");
    expect(document).toContain("does not require a new dependency, secret, connector, database migration, or API change");
  });
});
