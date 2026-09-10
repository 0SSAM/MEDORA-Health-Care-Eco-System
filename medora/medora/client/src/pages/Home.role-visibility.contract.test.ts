import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";

describe("role-scoped assistant UI contract", () => {
  it("keeps the assistant surface available to authorized operational roles", async () => {
    const home = await readFile(new URL("./Home.tsx", import.meta.url), "utf8");
    const assistant = await readFile(new URL("../components/AssistantSupportWorkspace.tsx", import.meta.url), "utf8");
    expect(home).toContain('assistant: ["admin", "manager", "pharmacist", "cashier", "user"]');
    expect(assistant).toContain("human review");
    expect(assistant).toContain("مراجعة وتأكيد بشري");
    expect(assistant).toContain("does not diagnose patients or execute entries");
  });

  it("does not expose assistant claims as autonomous clinical or financial execution", async () => {
    const assistant = await readFile(new URL("../components/AssistantSupportWorkspace.tsx", import.meta.url), "utf8");
    expect(assistant).toContain("لا يشخّص المرضى أو ينفذ قيوداً أو مشتريات أو تغييرات صلاحيات");
    expect(assistant).not.toContain("autoApprove");
    expect(assistant).not.toContain("executeSale");
  });
});
