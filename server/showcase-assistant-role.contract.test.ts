import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";

const enabled = process.env.SHOWCASE_LOGIN_SMOKE === "1";
const baseUrl = process.env.SHOWCASE_TEST_BASE_URL ?? "http://127.0.0.1:3000";
const password = process.env.SHOWCASE_TEST_PASSWORD;

const roles = [
  { username: "test", role: "manager", openId: "medora-showcase-manager-v1" },
  { username: "pharmacist.demo", role: "pharmacist", openId: "medora-showcase-pharmacist-v1" },
  { username: "cashier.demo", role: "cashier", openId: "medora-showcase-cashier-v1" },
] as const;

async function login(username: string) {
  const response = await fetch(`${baseUrl}/api/trpc/auth.internalLogin`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ json: { username, password } }),
  });
  const setCookie = response.headers.get("set-cookie") ?? "";
  const cookie = setCookie.split(",").map(item => item.trim()).find(item => item.startsWith("aldo_internal_session="));
  const payload = await response.json() as { result?: { data?: { json?: { sessionMode?: string; role?: string } } } };
  return { response, cookie: cookie?.split(";")[0], payload };
}

describe("showcase assistant role contract", () => {
  it("keeps the assistant available only to the intended employee roles and user surface", async () => {
    const home = await readFile(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
    const workspace = await readFile(new URL("../client/src/components/AssistantSupportWorkspace.tsx", import.meta.url), "utf8");
    expect(home).toContain('assistant: ["admin", "manager", "pharmacist", "cashier", "user"]');
    expect(workspace).toContain("does not diagnose patients or execute entries, purchases, or permission changes");
    expect(workspace).toContain("لا يشخّص المرضى أو ينفذ قيوداً أو مشتريات أو تغييرات صلاحيات");
    expect(workspace).toContain("human review");
  });

  it.skipIf(!enabled)("logs in with manager, pharmacist, and cashier showcase identities", async () => {
    expect(password).toBeTruthy();
    for (const identity of roles) {
      const { response, cookie, payload: loginPayload } = await login(identity.username);
      expect(response.status, `${identity.role} login status`).toBeGreaterThanOrEqual(200);
      expect(response.status, `${identity.role} login status`).toBeLessThan(300);
      expect(cookie, `${identity.role} session cookie`).toMatch(/^aldo_internal_session=/);

      const meResponse = await fetch(`${baseUrl}/api/trpc/auth.me?batch=1&input=${encodeURIComponent(JSON.stringify({ 0: { json: null } }))}`, {
        headers: { cookie: cookie! },
      });
      expect(meResponse.status, `${identity.role} auth.me status`).toBe(200);
      const payload = await meResponse.json() as Array<{ result?: { data?: { json?: { openId?: string; role?: string; sessionMode?: string } } } }>;
      const session = payload[0]?.result?.data?.json;
      expect(session?.openId, `${identity.role} openId`).toBe(identity.openId);
      expect(session?.role, `${identity.role} role`).toBe(identity.role);
      expect(loginPayload.result?.data?.json?.sessionMode, `${identity.role} login session mode`).toBe("showcase");
    }
  }, 30_000);
});
