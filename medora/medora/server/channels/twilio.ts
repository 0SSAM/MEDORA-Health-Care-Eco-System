/**
 * twilio.ts — Twilio Programmable Voice channel (pure helpers).
 * Outbound-call params, status-callback parsing, TwiML dialog builder, signature verification.
 * API shape verified against Twilio docs (2026).
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export interface TwilioStatusCallback {
  callSid: string;
  accountSid: string;
  from: string;
  to: string;
  callStatus: string;
  direction: string;
  callDuration: string;
  recordingUrl: string;
}

export function buildCreateCallParams(opts: {
  to: string;
  from: string;
  twiml: string;
  statusCallback: string;
}): Record<string, string> {
  return {
    To: opts.to,
    From: opts.from,
    Twiml: opts.twiml,
    StatusCallback: opts.statusCallback,
    StatusCallbackEvent: "initiated,ringing,answered,completed",
    StatusCallbackMethod: "POST",
    Timeout: "30",
  };
}

export function parseStatusCallback(params: Record<string, string | string[] | undefined>): TwilioStatusCallback {
  const get = (k: string) => {
    const v = params[k];
    return typeof v === "string" ? v : Array.isArray(v) ? (v[0] ?? "") : "";
  };
  return {
    callSid: get("CallSid"),
    accountSid: get("AccountSid"),
    from: get("From"),
    to: get("To"),
    callStatus: get("CallStatus"),
    direction: get("Direction"),
    callDuration: get("CallDuration"),
    recordingUrl: get("RecordingUrl"),
  };
}

export function buildTwiMLDialog(message: string): string {
  const safe = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Response><Say language="ar">${safe}</Say></Response>`;
}

export function verifyTwilioSignature(authToken: string, url: string, params: Record<string, string>, signature: string | undefined): boolean {
  if (!signature) return false;
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}${params[k]}`)
    .join("");
  const expected = createHmac("sha1", authToken).update(url + sorted).digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
