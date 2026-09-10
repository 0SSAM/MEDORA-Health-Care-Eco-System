import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const sourcePath = resolve(process.cwd(), "client/src/components/AIChatBox.tsx");

describe("AIChatBox markdown display policy", () => {
  it("omits an unavailable optional KaTeX plugin while retaining hardened markdown rendering", () => {
    const source = readFileSync(sourcePath, "utf8");

    expect(source).toContain("...(defaultRehypePlugins.katex ? [defaultRehypePlugins.katex] : [])");
    expect(source).toContain("allowDataImages: false");
    expect(source).toContain('allowedLinkPrefixes: ["https://"]');
    expect(source).toContain("<Streamdown rehypePlugins={safeRehypePlugins}>");
  });

  it("keeps advisory messages separate from hidden system instructions", () => {
    const source = readFileSync(sourcePath, "utf8");

    expect(source).toContain('messages.filter((msg) => msg.role !== "system")');
    expect(source).toContain("onSendMessage(trimmedInput)");
  });
});
