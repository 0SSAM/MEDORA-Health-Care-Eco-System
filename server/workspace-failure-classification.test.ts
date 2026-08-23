import { describe, expect, it } from "vitest";
import { classifyWorkspaceFailure } from "../client/src/lib/workspaceFailureClassification";

describe("workspace failure classification", () => {
  it.each([
    "Failed to fetch dynamically imported module",
    "Importing a module script failed.",
    "ChunkLoadError: Loading chunk 42 failed.",
  ])("classifies known lazy-module signatures without retaining the error text", (message) => {
    expect(classifyWorkspaceFailure(new Error(message))).toBe("lazy_module_load");
  });

  it("uses the safe generic category for unknown and non-Error failures", () => {
    expect(classifyWorkspaceFailure(new Error("render boundary failed"))).toBe("subtree_render");
    expect(classifyWorkspaceFailure("render boundary failed")).toBe("subtree_render");
    expect(classifyWorkspaceFailure({ message: "ChunkLoadError" })).toBe("subtree_render");
  });
});
