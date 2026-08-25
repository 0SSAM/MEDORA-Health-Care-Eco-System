import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const loginSource = readFileSync(resolve(process.cwd(), "client/src/pages/Login.tsx"), "utf8");

describe("workspace access contract", () => {
  it("keeps public, authentication, and protected workspace routes distinct", () => {
    expect(appSource).toContain('<Route path={"/"} component={Welcome} />');
    expect(appSource).toContain('<Route path={"/login"} component={Login} />');
    expect(appSource).toContain('<Route path={"/workspace"} component={Home} />');
    expect(appSource).toContain('<Route path={"/sales"} component={Home} />');
  });

  it("returns an authenticated employee to the workspace landing route", () => {
    expect(loginSource).toContain("await utils.auth.me.invalidate();");
    expect(loginSource).toContain('setLocation("/workspace")');
    expect(loginSource).toContain("فتح مساحة العمل");
    expect(loginSource).toContain("أنت مسجل الدخول بالفعل");
  });

  it("keeps workspace modules constrained by authenticated role and organization scope", () => {
    expect(homeSource).toContain("const { user, loading, logout } = useAuth()");
    expect(homeSource).toContain("تسجيل الخروج");
    expect(homeSource).toContain("const allowedModules = useMemo");
    expect(homeSource).toContain("const access: Record<string, string[]> =");
    expect(homeSource).toContain("organizationModules");
    expect(homeSource).toContain('antiFraud: ["admin", "manager"]');
  });

  it("uses empty states and real-data boundaries instead of fabricated operational records", () => {
    expect(homeSource).toContain("لا توجد أحداث معروضة بعد");
    expect(homeSource).toContain("لن يتم إنشاء بيانات تجريبية");
    expect(homeSource).toContain("تظهر بعد ربط قاعدة البيانات");
  });
});

// These tests intentionally check source-level route and policy contracts because the
// protected UI depends on generated tRPC hooks and is not rendered in the Node suite.
