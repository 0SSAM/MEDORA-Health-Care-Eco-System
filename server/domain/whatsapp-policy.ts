import { assertExternalAdapterReady, ExternalAdapterReadinessInput } from "./external-adapter-policy";

export type WhatsAppMessagePayload = {
  to: string;
  templateName?: string;
  templateLanguage?: string;
  components?: any[];
  text?: string;
};

export function validateWhatsAppPayload(payload: WhatsAppMessagePayload) {
  if (!payload.to || !/^\+?[1-9]\d{1,14}$/.test(payload.to)) {
    throw new Error("Invalid phone number format for WhatsApp");
  }
  if (!payload.templateName && !payload.text) {
    throw new Error("WhatsApp message must have either a template or text body");
  }
  return true;
}

export function assertWhatsAppReady(readiness: ExternalAdapterReadinessInput) {
  return assertExternalAdapterReady(readiness);
}
