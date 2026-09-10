import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(import.meta.dirname, "Login.tsx"), "utf8");

describe("login brand fallback contract", () => {
  it("replaces an unavailable image with a readable MEDORA lockup", () => {
    expect(source).toContain('const [primaryLogoUnavailable, setPrimaryLogoUnavailable] = useState(false);');
    expect(source).toContain('onError={() => setPrimaryLogoUnavailable(true)}');
    expect(source).toContain('aria-label="MEDORA Health Care Eco System"');
    expect(source).toContain('>MEDORA</div>');
  });

  it("keeps the fallback isolated from the authenticated workspace flow", () => {
    expect(source).toContain('window.location.assign("/workspace");');
    expect(source).toContain('internalLogin.mutate({ username, password });');
  });
});
