import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(import.meta.dirname, "_core", "vite.ts"), "utf8");

describe("Express 4 SPA fallback contract", () => {
  it("uses the Express 4 wildcard form for development and production deep links", () => {
    expect(source).toContain('app.use("*", publicSpaReadLimiter');
    expect(source).not.toContain('app.use("/{*splat}", publicSpaReadLimiter');
  });
});
