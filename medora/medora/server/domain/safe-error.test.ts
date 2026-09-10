import { describe, expect, it } from "vitest";
import { safeErrorLabel, safeHttpErrorLabel } from "./safe-error";

describe("safe error labels", () => {
  it("returns only the error name, never the sensitive message", () => {
    expect(safeErrorLabel(new Error("member secret=do-not-log"))).toBe("Error");
    expect(safeErrorLabel({ message: "raw payload" })).toBe("UnknownError");
  });

  it("bounds and normalizes HTTP status text", () => {
    expect(safeHttpErrorLabel(502, "Bad Gateway\nsecret-body")).toBe(
      "502 Bad Gateway secret-body",
    );
    expect(safeHttpErrorLabel(500, "x".repeat(200))).toHaveLength(84);
  });
});
