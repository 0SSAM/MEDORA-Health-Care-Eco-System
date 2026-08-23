import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const logoPrimary = "/manus-storage/medora-logo-primary_2cf35bd2.png";
const logoMark = "/manus-storage/medora-logo-primary-512_f58d6a48.png";

describe("MEDORA logo surfaces", () => {
  it("uses the approved shared logo on application entry surfaces", () => {
    const publicBranding = [
      readFileSync(new URL("../client/src/lib/brand.ts", import.meta.url), "utf8"),
      readFileSync(new URL("../client/src/pages/Login.tsx", import.meta.url), "utf8"),
      readFileSync(new URL("../client/src/pages/Welcome.tsx", import.meta.url), "utf8"),
      readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8"),
      readFileSync(new URL("../client/index.html", import.meta.url), "utf8"),
      readFileSync(new URL("../client/public/manifest.webmanifest", import.meta.url), "utf8"),
    ].join("\n");

    expect(publicBranding).toContain(logoPrimary);
    expect(publicBranding).toContain(logoMark);
    expect(publicBranding).not.toContain('href="/icon-192.svg"');
    expect(publicBranding).not.toContain('<svg viewBox="0 0 48 48"');
  });
});
