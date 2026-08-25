import { WhatsAppMessagePayload, validateWhatsAppPayload } from "../domain/whatsapp-policy";
import { ENV } from "../_core/env";

export async function sendWhatsAppMessage(payload: WhatsAppMessagePayload) {
  validateWhatsAppPayload(payload);

  const apiKey = process.env.WHATSAPP_API_KEY;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!apiKey || !phoneNumberId) {
    // Integration is blocked by default if credentials are missing.
    // We return a controlled blocked state instead of simulating success.
    return { 
      success: false, 
      state: "blocked", 
      reason: "WhatsApp API credentials (API Key or Phone Number ID) are not configured in the secret manager.",
      simulated: true 
    };
  }

  // Real Meta WhatsApp Business API call
  const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
  const body = payload.templateName ? {
    messaging_product: "whatsapp",
    to: payload.to,
    type: "template",
    template: {
      name: payload.templateName,
      language: { code: payload.templateLanguage || "en_US" },
      components: payload.components
    }
  } : {
    messaging_product: "whatsapp",
    to: payload.to,
    type: "text",
    text: { body: payload.text }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WhatsApp API failed: ${error}`);
  }

  return await response.json();
}
