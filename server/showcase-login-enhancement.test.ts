import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("internal authentication security contracts", () => {
  it("uses the server-backed employee login and recovery mutations", () => {
    const source = read("client/src/pages/Login.tsx");
    expect(source).toContain("trpc.auth.internalLogin.useMutation");
    expect(source).toContain("internalLogin.mutate({ username, password })");
    expect(source).toContain("trpc.auth.requestPasswordReset.useMutation");
    expect(source).toContain("trpc.auth.resetPassword.useMutation");
    expect(source).toContain("لا تُرسل كلمات المرور إلى سجل التدقيق");
  });

  it("verifies passwords before creating a scoped internal session and applies lockout policy", () => {
    const source = read("server/routers.ts");
    expect(source).toContain("internalLogin: publicProcedure.input");
    expect(source).toContain("try {");
    expect(source).toContain(
      "verifyInternalPassword(input.password, credential.passwordHash)"
    );
    expect(source).toContain("INTERNAL_MAX_FAILED_ATTEMPTS");
    expect(source).toContain("INTERNAL_LOCKOUT_MS");
    expect(source).toContain(
      "createInternalSession({ token, userId: credential.userId"
    );
    expect(source).toContain(
      'sessionMode: credential.accountType === "showcase" ? "showcase" : "production"'
    );
  });

  it("fails closed without exposing database or audit infrastructure errors", () => {
    const source = read("server/routers.ts");
    expect(source).toContain('"[Auth] internal login unavailable:"');
    expect(source).toContain("safeErrorLabel(error)");
    expect(source).toContain(
      "تعذر التحقق من البيانات حالياً. تأكد من الاتصال وحاول مرة أخرى."
    );
  });

  it("does not turn failed-login audit outages into a connection error", () => {
    const source = read("server/routers.ts");
    expect(source).toContain("const recordLoginFailure = async");
    expect(source).toContain("login failure audit unavailable:");
    expect(source).toContain(
      'await recordLoginFailure({ username, eventType: "login_failure", source: "internal" });'
    );
    expect(source).toContain(
      'message: "اسم المستخدم أو كلمة المرور غير صحيحة"'
    );
  });

  it("uses memory-hard password hashing and timing-safe verification", () => {
    const source = read("server/domain/internal-auth.ts");
    expect(source).toContain("scryptSync");
    expect(source).toContain("timingSafeEqual");
    expect(source).toContain("assertPasswordPolicy(password)");
    expect(source).toContain("PASSWORD_MIN_LENGTH = 12");
  });

  it("keeps scheduled login health read-only and cron-authenticated", () => {
    const handler = read("server/scheduled/login-health.ts");
    expect(handler).toContain("sdk.authenticateRequest(req)");
    expect(handler).toContain("user.isCron");
    expect(handler).toContain('loginMutation: "not_attempted"');
    expect(handler).toContain('passwordExposure: "none"');
    expect(handler).not.toContain("createInternalSession");
  });
});
