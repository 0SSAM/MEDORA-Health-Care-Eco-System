import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

describe("Home smart-search aliases", () => {
  it("indexes the Arabic customer-follow-up aliases on the authorized operations route", () => {
    expect(homeSource).toContain('id: "operations"');
    expect(homeSource).toContain("متابعة العملاء");
    expect(homeSource).toContain("ادارة علاقات العملاء");
  });
});
