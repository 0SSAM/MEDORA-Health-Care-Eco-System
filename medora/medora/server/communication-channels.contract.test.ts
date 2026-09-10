import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { existsSync } from "node:fs";

describe("communication channels contract", () => {
  it("ships channel source modules", () => {
    for (const f of ["server/channels/whatsapp.ts", "server/channels/twilio.ts", "server/channels/webhooks.ts", "server/routers/communicationChannels.ts"]) {
      expect(existsSync(f), `${f} missing`).toBe(true);
    }
  });

  it("registers webhook route prefix in the server entry", () => {
    const index = readFileSync("server/_core/index.ts", "utf-8");
    expect(index).toContain("webhookRouter");
    expect(index).toContain("/api/channels");
  });

  it("documents required provider secrets in .env.example", () => {
    const env = readFileSync(".env.example", "utf-8");
    for (const key of ["WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_WEBHOOK_VERIFY_TOKEN", "WHATSAPP_APP_SECRET", "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM_NUMBER"]) {
      expect(env, `${key} missing from .env.example`).toContain(key);
    }
  });

  it("requires signature verification before provider callback mutations", () => {
    const webhooks = readFileSync("server/channels/webhooks.ts", "utf-8");
    expect(webhooks).toContain("verifyWebhookSignature");
    expect(webhooks).toContain("verifyTwilioRequest");
    expect(webhooks).toContain("Webhook signature verification failed");
  });
});
