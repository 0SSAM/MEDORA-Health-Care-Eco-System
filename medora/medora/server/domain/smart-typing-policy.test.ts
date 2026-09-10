import { describe, expect, it } from "vitest";
import { assessSmartTypingSafety, sanitizeSmartTypingSuggestions } from "./smart-typing-policy";

describe("smart typing privacy and output policy", () => {
  it("allows an ordinary non-clinical support draft", () => {
    expect(assessSmartTypingSafety("The inventory summary does not refresh")).toEqual({ allowed: true });
  });

  it("rejects credential, identifier, and clinical fragments before they reach a model", () => {
    expect(assessSmartTypingSafety("password: do-not-send-this")).toMatchObject({ allowed: false, reason: "sensitive_content" });
    expect(assessSmartTypingSafety("contact name@example.com for access")).toMatchObject({ allowed: false, reason: "sensitive_content" });
    expect(assessSmartTypingSafety("the patient needs a dose review")).toMatchObject({ allowed: false, reason: "sensitive_content" });
  });

  it("returns only concise, unique, plain-text advisory suggestions", () => {
    expect(sanitizeSmartTypingSuggestions([
      "The inventory dashboard did not refresh after branch selection.",
      "The inventory dashboard did not refresh after branch selection.",
      "Visit https://example.com",
      "<script>alert(1)</script>",
      "Please review the synchronized inventory status.",
    ])).toEqual([
      "The inventory dashboard did not refresh after branch selection.",
      "Please review the synchronized inventory status.",
    ]);
  });
});
