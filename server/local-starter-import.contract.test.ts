import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";

const importerPath = new URL("../scripts/import-local-starter-catalog.mjs", import.meta.url);

describe("local starter catalog importer", () => {
  it("is guarded, idempotent, and preserves review provenance", async () => {
    const source = await readFile(importerPath, "utf8");
    expect(source).toContain("const commit = args.commit === true");
    expect(source).toContain('org.environment !== "production"');
    expect(source).toContain('verificationStatus: "PENDING_REVIEW"');
    expect(source).toContain("sourceLicense");
    expect(source).toContain("sourceNotes");
    expect(source).toContain("starter-${row.sourceRecordId}");
    expect(source).toContain('"pending"');
  });

  it("does not silently promote imported rows to authoritative data", async () => {
    const source = await readFile(importerPath, "utf8");
    expect(source).toContain("authoritative: false");
    expect(source).not.toContain('verificationStatus: "VERIFIED"');
  });
});
