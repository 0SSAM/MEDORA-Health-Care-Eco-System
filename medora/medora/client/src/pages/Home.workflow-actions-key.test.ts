import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Home workflow action keys", () => {
  it("does not use translated action labels as React keys", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

    expect(source).toContain("key={`${item.id}-${actionIndex}`}");
    expect(source).toContain("key={`${activeModule.id}-${index}`}");
    expect(source).not.toContain("key={action.label}");
  });
});
