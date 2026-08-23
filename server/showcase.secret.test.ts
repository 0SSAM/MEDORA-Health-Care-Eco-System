import { describe, expect, it } from "vitest";

const baseUrl = process.env.SHOWCASE_TEST_BASE_URL ?? "http://127.0.0.1:3000";

describe("showcase credential configuration", () => {
  it("uses the configured secret when calling the internal login endpoint", async () => {
    const password = process.env.SHOWCASE_TEST_PASSWORD;
    expect(password, "SHOWCASE_TEST_PASSWORD must be supplied").toBeTruthy();
    expect(password!.length).toBeGreaterThanOrEqual(12);
    expect(password).not.toBe("test");

    const response = await fetch(`${baseUrl}/api/trpc/auth.internalLogin`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ json: { username: "test", password } }),
    });
    expect(response.status).toBe(200);
    const payload = (await response.json()) as { result?: { data?: { json?: { success?: boolean } } } };
    expect(payload.result?.data?.json?.success).toBe(true);
  }, 30_000);
});
