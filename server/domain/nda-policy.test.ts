import { describe, expect, it } from "vitest";
import {
  MEDORA_NDA_HASH,
  MEDORA_NDA_VERSION,
  isCurrentNdaAcceptance,
} from "./nda-policy";

describe("MEDORA NDA acceptance policy", () => {
  it("requires an explicit record for the current version and immutable document hash", () => {
    expect(isCurrentNdaAcceptance(undefined)).toBe(false);
    expect(isCurrentNdaAcceptance(null)).toBe(false);
    expect(isCurrentNdaAcceptance({
      documentVersion: MEDORA_NDA_VERSION,
      documentHash: MEDORA_NDA_HASH,
    })).toBe(true);
  });

  it("requires renewed acceptance when the version or text hash changes", () => {
    expect(isCurrentNdaAcceptance({
      documentVersion: "2026-08-21",
      documentHash: MEDORA_NDA_HASH,
    })).toBe(false);
    expect(isCurrentNdaAcceptance({
      documentVersion: MEDORA_NDA_VERSION,
      documentHash: "0".repeat(64),
    })).toBe(false);
  });
});
