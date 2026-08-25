import { describe, expect, it } from "vitest";

const enabled = process.env.SHOWCASE_LOGIN_SMOKE === "1";
const baseUrl = process.env.SHOWCASE_TEST_BASE_URL ?? "http://127.0.0.1:3000";

describe.skipIf(!enabled)("managed showcase login smoke", () => {
  it("uses the managed secret to establish a scoped showcase session", async () => {
    const password = process.env.SHOWCASE_TEST_PASSWORD;
    expect(password).toBeTruthy();
    const response = await fetch(`${baseUrl}/api/trpc/auth.internalLogin`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ json: { username: "test", password } }),
    });
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(300);
    const payload = await response.json() as { result?: { data?: { json?: { success?: boolean; sessionMode?: string } } } };
    expect(payload.result?.data?.json?.success).toBe(true);
    expect(payload.result?.data?.json?.sessionMode).toBe("showcase");
    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toContain("medora_internal_session=");
    const internalSessionCookie = setCookie?.split(";")[0];
    expect(internalSessionCookie).toMatch(/^medora_internal_session=/);

    const meResponse = await fetch(`${baseUrl}/api/trpc/auth.me?batch=1&input=${encodeURIComponent(JSON.stringify({ 0: { json: null } }))}`, {
      headers: { cookie: internalSessionCookie! },
    });
    expect(meResponse.status).toBe(200);
    const mePayload = await meResponse.json() as Array<{ result?: { data?: { json?: { openId?: string } } } }>;
    expect(mePayload[0]?.result?.data?.json?.openId).toBe("medora-showcase-internal-user-v1");
  }, 30_000);
});
