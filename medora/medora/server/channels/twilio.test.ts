import { describe, expect, it } from "vitest";
import { buildCreateCallParams, buildTwiMLDialog, parseStatusCallback, verifyTwilioSignature } from "./twilio";

describe("twilio voice channel helpers", () => {
  it("builds create-call params with status callback events", () => {
    const p = buildCreateCallParams({ to: "+201000000000", from: "+12025550123", twiml: "<Response/>", statusCallback: "https://medora.app/api/channels/twilio/status" });
    expect(p.To).toBe("+201000000000");
    expect(p.From).toBe("+12025550123");
    expect(p.StatusCallbackEvent).toBe("initiated,ringing,answered,completed");
    expect(p.StatusCallbackMethod).toBe("POST");
  });

  it("parses voice status callback fields", () => {
    const cb = parseStatusCallback({ CallSid: "CA123", AccountSid: "AC1", From: "+1202", To: "+2010", CallStatus: "completed", Direction: "outbound-api", CallDuration: "42", RecordingUrl: "https://api.twilio.com/r" });
    expect(cb).toMatchObject({ callSid: "CA123", callStatus: "completed", callDuration: "42", recordingUrl: "https://api.twilio.com/r" });
  });

  it("builds Arabic-safe TwiML dialog", () => {
    const xml = buildTwiMLDialog("أهلا <عالم>");
    expect(xml).toContain("<Say language=\"ar\">");
    expect(xml).toContain("أهلا &lt;عالم&gt;");
  });

  it("verifies X-Twilio-Signature with canonical query string", () => {
    const auth = "secret-auth";
    const url = "https://medora.app/api/channels/twilio/status";
    const params = { To: "+2010", From: "+1202" };
    const { createHmac } = require("node:crypto");
    const expected = createHmac("sha1", auth).update(url + "From+1202To+2010").digest("base64");
    expect(verifyTwilioSignature(auth, url, params, expected)).toBe(true);
    expect(verifyTwilioSignature(auth, url, params, "AAAA")).toBe(false);
    expect(verifyTwilioSignature(auth, url, params, undefined)).toBe(false);
  });
});
