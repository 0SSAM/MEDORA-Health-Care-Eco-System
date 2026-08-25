import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("browser debug collector privacy boundary", () => {
  it("omits response bodies instead of cloning and reading payloads", async () => {
    const source = await readFile(
      new URL("../client/public/__manus__/debug-collector.js", import.meta.url),
      "utf8",
    );

    expect(source).toContain("[Response body omitted by privacy policy]");
    expect(source).toContain("[Request body omitted by privacy policy]");
    expect(source).not.toContain("var clonedResponse = response.clone()");
    expect(source).not.toContain("clonedResponse.text()");
    expect(source).not.toContain("responseText");
    expect(source).not.toContain("tryParseJson(body)");
  });
});
