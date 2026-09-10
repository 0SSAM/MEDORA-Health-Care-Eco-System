import { describe, expect, it } from "vitest";
import manifest from "../../docs/regulatory/country-pack-source-manifest.json";

describe("country pack source manifest", () => {
  it("keeps every reviewed country blocked until activation prerequisites are met", () => {
    expect(manifest.packs.map(pack => pack.country)).toEqual(["EG", "JO", "QA", "MA"]);
    for (const pack of manifest.packs) {
      expect(pack.status).toBe("blocked");
      expect(pack.sources.length).toBeGreaterThan(0);
      expect(pack.activationBlockers.length).toBeGreaterThan(0);
    }
  });

  it("has no enabled country without an independent source-linked domain matrix", () => {
    const enabled = manifest.packs.filter(pack => pack.status === "enabled");
    expect(enabled).toHaveLength(0);
    expect(manifest.packs.every(pack => pack.activationBlockers.includes("acceptance tests") || pack.activationBlockers.includes("complete source-linked domain matrix"))).toBe(true);
  });
});
