import { describe, expect, it } from "vitest";
import { buildTemplatePayload, buildTextPayload, parseWebhookPayload, verifyWebhook } from "./whatsapp";

const sample = {
  object: "whatsapp_business_account",
  entry: [
    {
      id: "102290129340398",
      changes: [
        {
          value: {
            messaging_product: "whatsapp",
            metadata: { display_phone_number: "15550783881", phone_number_id: "106540352242922" },
            contacts: [{ profile: { name: "Sheena Nelson" }, wa_id: "16505551234" }],
            messages: [{ from: "16505551234", id: "wamid.ABC", timestamp: "1749416383", type: "text", text: { body: "Hello Medora" } }],
          },
          field: "messages",
        },
      ],
    },
  ],
};

describe("whatsapp channel helpers", () => {
  it("verifies webhook GET with matching token and echoes challenge", () => {
    expect(verifyWebhook({ "hub.mode": "subscribe", "hub.verify_token": "t0ken", "hub.challenge": "ch-123" }, "t0ken")).toBe("ch-123");
    expect(verifyWebhook({ "hub.mode": "subscribe", "hub.verify_token": "wrong", "hub.challenge": "ch-123" }, "t0ken")).toBeNull();
    expect(verifyWebhook({ "hub.mode": "unsubscribe", "hub.verify_token": "t0ken", "hub.challenge": "ch-123" }, "t0ken")).toBeNull();
  });

  it("parses inbound message payload with Meta field names", () => {
    const { messages, statuses } = parseWebhookPayload(sample);
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({ from: "16505551234", id: "wamid.ABC", body: "Hello Medora", phoneNumberId: "106540352242922", displayPhoneNumber: "15550783881" });
    expect(statuses).toHaveLength(0);
  });

  it("parses delivery statuses", () => {
    const { statuses } = parseWebhookPayload({ entry: [{ changes: [{ value: { statuses: [{ id: "wamid.9", status: "delivered", timestamp: "1", recipient_id: "16505551234" }] } }] }] });
    expect(statuses[0]).toMatchObject({ id: "wamid.9", status: "delivered" });
  });

  it("builds outbound text payload per Cloud API schema", () => {
    expect(buildTextPayload("2015550123", "مرحبا")).toEqual({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: "2015550123",
      type: "text",
      text: { body: "مرحبا", preview_url: false },
    });
  });

  it("builds template payload", () => {
    const p = buildTemplatePayload("2015550123", "appointment_reminder", "en", [{ type: "text", text: "09:00" }]);
    expect(p.type).toBe("template");
    expect(p.template.name).toBe("appointment_reminder");
    expect(p.template.components?.[0].parameters[0].text).toBe("09:00");
  });
});
