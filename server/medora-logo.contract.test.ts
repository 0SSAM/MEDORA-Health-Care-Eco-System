import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const projectRoot = "/home/ubuntu/ألدورا-|-منظومة-الرعاية-الصحية-المتكاملة";
const logoPrimary = "/manus-storage/medora-logo-primary_2cf35bd2.png";
const logoMark = "/manus-storage/medora-logo-primary-512_9338f979.png";

describe("MEDORA logo surfaces", () => {
  it("uses the approved shared logo on application entry surfaces", () => {
    const publicBranding = [
      readFileSync(`${projectRoot}/client/src/lib/brand.ts`, "utf8"),
      readFileSync(`${projectRoot}/client/src/pages/Login.tsx`, "utf8"),
      readFileSync(`${projectRoot}/client/src/pages/Welcome.tsx`, "utf8"),
      readFileSync(`${projectRoot}/client/src/pages/Home.tsx`, "utf8"),
      readFileSync(`${projectRoot}/client/index.html`, "utf8"),
      readFileSync(`${projectRoot}/client/public/manifest.webmanifest`, "utf8"),
    ].join("\n");

    expect(publicBranding).toContain(logoPrimary);
    expect(publicBranding).toContain(logoMark);
    expect(publicBranding).not.toContain('href="/icon-192.svg"');
    expect(publicBranding).not.toContain('<svg viewBox="0 0 48 48"');
  });
});
