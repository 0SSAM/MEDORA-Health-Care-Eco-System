import { describe, expect, it } from "vitest";
import { MEDORA_LOGO_MARK, MEDORA_LOGO_PRIMARY } from "./brand";

describe("MEDORA branding asset contract", () => {
  it("uses published storage paths for the primary and compact marks", () => {
    expect(MEDORA_LOGO_PRIMARY).toMatch(/^\/manus-storage\/medora-logo-primary_[a-z0-9]+\.png$/);
    expect(MEDORA_LOGO_MARK).toMatch(/^\/manus-storage\/medora-logo-primary-512_[a-z0-9]+\.png$/);
  });

  it("keeps the primary and compact marks as distinct asset references", () => {
    expect(MEDORA_LOGO_PRIMARY).not.toBe(MEDORA_LOGO_MARK);
  });
});
