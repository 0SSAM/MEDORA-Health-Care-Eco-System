import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const bootstrapSource = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "bootstrap.ts"), "utf8");

describe("bootstrap ESM and credential safety contracts", () => {
  it("avoids CommonJS direct-execution detection in the ESM server", () => {
    expect(bootstrapSource).not.toContain("require.main");
    expect(bootstrapSource).toContain("pathToFileURL");
    expect(bootstrapSource).toContain("import.meta.url");
  });

  it("does not embed or log default administrative credentials", () => {
    expect(bootstrapSource).not.toContain("Admin#@!12345");
    expect(bootstrapSource).toContain("MEDORA_BOOTSTRAP_ALLOW_PROVISIONING");
    expect(bootstrapSource).toContain("MEDORA_BOOTSTRAP_ADMIN_PASSWORD");
    expect(bootstrapSource).not.toContain("Password: ${");
  });
});
