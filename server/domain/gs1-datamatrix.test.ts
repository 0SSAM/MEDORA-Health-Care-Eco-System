import { describe, expect, it } from "vitest";
import { parseGs1DataMatrix } from "./gs1-datamatrix";

describe("gs1-datamatrix", () => {
  it("parses a valid (01)(17)(10)(21) payload", () => {
    const d = parseGs1DataMatrix("(01)06221234567890(17)281231(10)B123(21)S9F3");
    expect(d.gtin).toBe("06221234567890");
    expect(d.expiry).toBe("2028-12-31");
    expect(d.batch).toBe("B123");
    expect(d.serial).toBe("S9F3");
  });
  it("flags missing serial as invalid", () => {
    const d = parseGs1DataMatrix("(01)06221234567890(17)281231(10)B123");
    expect(d.valid).toBe(false);
    expect(d.errors).toContain("missing_serial_ai21");
  });
  it("detects bad GTIN check digit", () => {
    const d = parseGs1DataMatrix("(01)06221234567899(17)281231(10)B1(21)S1");
    expect(d.errors).toContain("gtin_checkdigit");
    expect(d.valid).toBe(false);
  });
});
