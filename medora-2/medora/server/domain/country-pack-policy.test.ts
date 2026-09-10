import { describe, expect, it } from "vitest";
import { assertCountryPackReady, countryPackReadiness, REQUIRED_COUNTRY_PACK_DOMAINS, type CountryPackEvidence } from "./country-pack-policy";

const complete = (domain: CountryPackEvidence["domain"]): CountryPackEvidence => ({ domain, sourceUrl: "https://official.example/rule", effectiveDate: "2026-01-01", localLicenseVerified: true, credentialsConfigured: true, acceptanceCriteriaVerified: true });

describe("country pack activation policy", () => {
  it("blocks incomplete or missing required domains", () => {
    const evidence = [complete("medicines"), { ...complete("pricing"), credentialsConfigured: false }];
    expect(countryPackReadiness(evidence, ["medicines", "pricing", "tax"])).toBe("BLOCKED");
    expect(() => assertCountryPackReady(evidence, ["medicines", "pricing"])).toThrow(/not ready/);
  });

  it("allows activation only when every required domain is evidenced", () => {
    const evidence = [complete("medicines"), complete("pricing"), complete("tax")];
    expect(countryPackReadiness(evidence, ["medicines", "pricing", "tax"])).toBe("READY");
    expect(assertCountryPackReady(evidence, ["medicines", "pricing", "tax"])).toBe(true);
  });

  it("defines an explicit source-linked coverage contract including timezone and audit", () => {
    expect(REQUIRED_COUNTRY_PACK_DOMAINS).toContain("timezone");
    expect(REQUIRED_COUNTRY_PACK_DOMAINS).toContain("audit");
    const evidence = REQUIRED_COUNTRY_PACK_DOMAINS.map(complete);
    expect(countryPackReadiness(evidence, REQUIRED_COUNTRY_PACK_DOMAINS)).toBe("READY");
    expect(countryPackReadiness(evidence.filter(item => item.domain !== "timezone"), REQUIRED_COUNTRY_PACK_DOMAINS)).toBe("BLOCKED");
  });
});
