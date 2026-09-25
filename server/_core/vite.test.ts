import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "server/_core/vite.ts"), "utf8");

describe("vite/static middleware hardening", () => {
  it("rate-limits the filesystem-backed SPA fallback handlers", () => {
    expect(source).toContain("import { rateLimit } from \"express-rate-limit\";");
    expect(source).toContain("createHtmlFallbackRateLimit()");
    expect(source).toContain("app.use(createHtmlFallbackRateLimit());");
  });
});
