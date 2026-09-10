import { describe, expect, it } from "vitest";

describe("Resend configuration", () => {
  it("validates email settings without making a network call", () => {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.REPORT_FROM_EMAIL;
    if (!apiKey || !fromEmail) return;
    expect(apiKey.length).toBeGreaterThan(10);
    expect(fromEmail).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  });
});
