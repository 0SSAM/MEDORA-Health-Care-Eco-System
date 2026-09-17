import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(join(process.cwd(), "server/channels/webhooks.ts"), "utf8");

describe("provider webhook tenant boundary contract", () => {
  it("scopes provider-controlled message status updates to the configured organization", () => {
    expect(source).toContain("UPDATE channel_messages SET status=? WHERE organizationId=? AND platformMessageId=?");
    expect(source).toContain("[status.status, DEFAULT_ORG, status.id]");
  });

  it("scopes customer lookup to the receiving organization", () => {
    expect(source).toContain("FROM customer_profiles WHERE organizationId=? AND phone=? LIMIT 1");
    expect(source).toContain("[DEFAULT_ORG, m.from]");
  });

  it("scopes message-to-ticket linkage and Twilio ticket selection", () => {
    expect(source).toContain("UPDATE channel_messages SET ticketId=? WHERE organizationId=? AND id=?");
    expect(source).toContain("FROM call_tickets WHERE organizationId=? AND subject LIKE ? ORDER BY id DESC LIMIT 1");
    expect(source).toContain("UPDATE call_tickets SET status=? WHERE organizationId=? AND id=?");
  });

  it("does not leave provider identifiers as the only write boundary", () => {
    expect(source).not.toContain("UPDATE channel_messages SET status=? WHERE platformMessageId=?");
    expect(source).not.toContain("UPDATE call_tickets SET status=? WHERE id=?");
  });
});
