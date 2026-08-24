import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

describe("MEDORA product identity", () => {
  it("uses the owner-approved product title without personal contact data", () => {
    const title = process.env.VITE_APP_TITLE ?? "ميدورا | منظومة الرعاية الصحية المتكاملة";
    expect(["ميدورا | منظومة الرعاية الصحية المتكاملة", "MEDORA Health Care Eco System"]).toContain(title);
    expect(title).not.toMatch(/@|\+?\d{7,}/);
  });

  it("keeps public identity assets branded and free of CV contact details", () => {
    const publicIdentity = [
      readFileSync(`${projectRoot}/client/index.html`, "utf8"),
      readFileSync(`${projectRoot}/client/public/manifest.webmanifest`, "utf8"),
      readFileSync(`${projectRoot}/docs/ownership-manifest.json`, "utf8"),
    ].join("\n");
    expect(publicIdentity).toContain("ميدورا | منظومة الرعاية الصحية المتكاملة");
    expect(publicIdentity).not.toMatch(/\b\d{9,14}\b/);
    expect(publicIdentity).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    expect(publicIdentity).not.toContain("Hossam_Naeim_Osman_CV");
  });
});
