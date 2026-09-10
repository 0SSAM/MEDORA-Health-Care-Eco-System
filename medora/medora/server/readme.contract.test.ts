import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const readme = readFileSync(resolve(import.meta.dirname, "..", "README.md"), "utf8");

describe("repository README contract", () => {
  it("communicates the MEDORA architecture and safety boundaries without overclaiming compliance", () => {
    expect(readme).toContain("# MEDORA Health Care Eco System");
    expect(readme).toContain("Organization, branch, and jurisdiction");
    expect(readme).toContain("Jurisdiction ID `0` is a valid legal scope");
    expect(readme).toContain("The AI assistant is advisory-only");
    expect(readme).toContain("browser code is never claimed to prevent OS-level or physical capture absolutely");
    expect(readme).toContain("No legal or regulatory certification is claimed");
  });
});
