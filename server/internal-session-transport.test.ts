import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("internal employee session transport", () => {
  it("parses the internal-session cookie before tRPC creates a request context", () => {
    const source = read("server/_core/index.ts");
    const cookieMiddleware = source.indexOf("attachRequestCookies(req)");
    const trpcMount = source.indexOf('"/api/trpc"');

    expect(source).toContain('import { attachRequestCookies } from "./request-cookies";');
    expect(cookieMiddleware).toBeGreaterThan(-1);
    expect(trpcMount).toBeGreaterThan(-1);
    expect(cookieMiddleware).toBeLessThan(trpcMount);
  });

  it("refreshes auth state and opens the protected workspace after a successful employee login", () => {
    const source = read("client/src/pages/Login.tsx");

    expect(source).toContain("await utils.auth.me.invalidate();");
    expect(source).toContain('setLocation("/workspace");');
  });
});
