/**
 * whatsapp.ts — WhatsApp Business Cloud API channel (pure helpers).
 * Webhook verification (GET) + inbound message/status parsing + outbound payload builders.
 * API shape verified against Meta for Developers docs (2026).
 */
export interface WaMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  body: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
}

export interface WaDeliveryStatus {
  id: string;
  status: string;
  timestamp: string;
  recipientId: string;
}

export function verifyWebhook(query: Record<string, unknown>, expectedToken: string): string | null {
  const mode = query["hub.mode"];
  const token = query["hub.verify_token"];
  const challenge = query["hub.challenge"];
  if (mode === "subscribe" && token === expectedToken && typeof challenge === "string") {
    return challenge;
  }
  return null;
}

export function parseWebhookPayload(body: unknown): {
  messages: WaMessage[];
  statuses: WaDeliveryStatus[];
} {
  const messages: WaMessage[] = [];
  const statuses: WaDeliveryStatus[] = [];
  if (!body || typeof body !== "object") return { messages, statuses };
  const b = body as { entry?: Array<{ changes?: Array<{ value?: Record<string, unknown>; field?: string }> }> };
  for (const entry of b.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value ?? {};
      const metadata = (value.metadata ?? {}) as { phone_number_id?: string; display_phone_number?: string };
      const msgs = Array.isArray(value.messages) ? (value.messages as Array<Record<string, unknown>>) : [];
      for (const m of msgs) {
        const text = (m.text ?? {}) as { body?: string };
        messages.push({
          from: String(m.from ?? ""),
          id: String(m.id ?? ""),
          timestamp: String(m.timestamp ?? ""),
          type: String(m.type ?? ""),
          body: typeof text.body === "string" ? text.body : "",
          phoneNumberId: metadata.phone_number_id ?? "",
          displayPhoneNumber: metadata.display_phone_number ?? "",
        });
      }
      const sts = Array.isArray(value.statuses) ? (value.statuses as Array<Record<string, unknown>>) : [];
      for (const s of sts) {
        statuses.push({
          id: String(s.id ?? ""),
          status: String(s.status ?? ""),
          timestamp: String(s.timestamp ?? ""),
          recipientId: String((s as { recipient_id?: string }).recipient_id ?? ""),
        });
      }
    }
  }
  return { messages, statuses };
}

export interface TextPayload {
  messaging_product: "whatsapp";
  recipient_type: "individual";
  to: string;
  type: "text";
  text: { body: string; preview_url?: boolean };
}

export function buildTextPayload(to: string, body: string): TextPayload {
  return { messaging_product: "whatsapp", recipient_type: "individual", to, type: "text", text: { body, preview_url: false } };
}

export interface TemplatePayload {
  messaging_product: "whatsapp";
  recipient_type: "individual";
  to: string;
  type: "template";
  template: { name: string; language: { code: string }; components?: Array<{ type: string; parameters: Array<{ type: string; text?: string }> }> };
}

export function buildTemplatePayload(to: string, templateName: string, languageCode: string, params?: Array<{ type: string; text?: string }>): TemplatePayload {
  return {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "template",
    template: { name: templateName, language: { code: languageCode }, components: params ? [{ type: "body", parameters: params }] : undefined },
  };
}
