import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { INTERNAL_SESSION_COOKIE } from "./domain/internal-auth";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type CookieCall = { name: string; options: Record<string, unknown> };

describe("internal logout", () => {
  it("clears the employee session cookie even when no session token is present", async () => {
    const clearedCookies: CookieCall[] = [];
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {}, cookies: {} } as TrpcContext["req"],
      res: {
        clearCookie: (name: string, options: Record<string, unknown>) => {
          clearedCookies.push({ name, options });
        },
      } as TrpcContext["res"],
    };

    const result = await appRouter.createCaller(ctx).auth.internalLogout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toContainEqual({
      name: INTERNAL_SESSION_COOKIE,
      options: { httpOnly: true, sameSite: "lax", secure: true, maxAge: 0, path: "/" },
    });
  });

  it("wires the client logout flow to internal logout and clears its cached auth header", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/_core/hooks/useAuth.ts"), "utf8");
    expect(source).toContain("trpc.auth.internalLogout.useMutation");
    expect(source).toContain("clearSessionAuthHeaderCache();");
    expect(source).toContain('sessionStorage.removeItem("medora-cookie")');
  });
});
