import { describe, expect, it } from "vitest";

describe("sales contact configuration", () => {
  it("uses a WhatsApp web link and does not expose a raw phone or email URI", () => {
    const contactUrl = process.env.VITE_ALDO_SALES_CONTACT_URL ?? "";
    if (!contactUrl) {
      expect(contactUrl).toBe("");
      return;
    }
    expect(contactUrl).toMatch(/^https:\/\/wa\.me\/\d{7,20}\?text=/);
    expect(contactUrl).not.toMatch(/^(tel:|mailto:)/i);
    expect(contactUrl).not.toContain("+");
  });
});
