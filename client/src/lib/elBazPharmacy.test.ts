import { describe, expect, it } from "vitest";
import { EL_BAZ_PHARMACY, barcodeBars, elBazBarcodeSeed } from "./elBazPharmacy";

describe("El-Baz Pharmacy identity contract", () => {
  it("keeps the supplied bilingual business identity exact", () => {
    expect(EL_BAZ_PHARMACY.nameEn).toBe("El-Baz Pharmacy");
    expect(EL_BAZ_PHARMACY.nameAr).toBe("صيدلية الباز");
    expect(EL_BAZ_PHARMACY.manager).toBe("Dr. Nouran Tarek");
    expect(EL_BAZ_PHARMACY.addressAr).toBe("المنصوره، ميدان مشعل، بجوار كشري جدو");
    expect(EL_BAZ_PHARMACY.landline).toBe("0502243574");
    expect(EL_BAZ_PHARMACY.whatsapp).toBe("01040716080");
  });

  it("does not expose a prohibited animal or individual-pharmacy branding label", () => {
    const text = JSON.stringify(EL_BAZ_PHARMACY).toLowerCase();
    expect(text).not.toContain("فردية");
    expect(text).not.toMatch(/falcon|eagle|bird|snake/);
  });

  it("keeps the UI barcode helper deterministic and bounded to 13 digits", () => {
    expect(elBazBarcodeSeed("abc-6220000000001-extra")).toBe("6220000000001");
    expect(elBazBarcodeSeed("")).toBe("0000000000000");
    expect(barcodeBars("6220000000001")).toEqual(barcodeBars("6220000000001"));
    expect(barcodeBars("6220000000001").every((width) => width >= 1 && width <= 4)).toBe(true);
  });
});
