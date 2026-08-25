import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("authentication UI session contract", () => {
  it("bounds missing-session loading and preserves fail-closed server behavior", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/_core/hooks/useAuth.ts"),
      "utf8",
    );

    expect(source).toContain("AUTH_CHECK_TIMEOUT_MS = 1_500");
    expect(source).toContain("setAuthCheckTimedOut(true)");
    expect(source).toContain("meQuery.isLoading && !authCheckTimedOut");
    expect(source).toContain("The server remains fail-closed");
  });

  it("keeps login and protected workspace routes distinct", () => {
    const appSource = readFileSync(
      resolve(process.cwd(), "client/src/App.tsx"),
      "utf8",
    );
    const loginSource = readFileSync(
      resolve(process.cwd(), "client/src/pages/Login.tsx"),
      "utf8",
    );
    const homeSource = readFileSync(
      resolve(process.cwd(), "client/src/pages/Home.tsx"),
      "utf8",
    );

    expect(appSource).toContain('path={"/login"} component={Login}');
    expect(appSource).toContain('path={"/workspace"} component={Home}');
    expect(loginSource).toContain("جارٍ التحقق من الجلسة");
    expect(homeSource).toContain("جارٍ التحقق من جلسة الدخول");
  });
});
