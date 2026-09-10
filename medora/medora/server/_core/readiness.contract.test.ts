import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { publicReadinessPayload } from "./readiness";

const source = readFileSync(resolve(process.cwd(), "server/_core/readiness.ts"), "utf8");
const executableSource = source.replace(/\/\*[\s\S]*?\*\//g, "");

describe("public readiness route", () => {
  it("returns a fixed non-sensitive process response", () => {
    expect(publicReadinessPayload()).toEqual({ status: "ok" });
  });

  it("keeps readiness anonymous, cache-free, and separate from protected operations", () => {
    expect(source).toContain('app.get("/healthz"');
    expect(source).toContain('"Cache-Control", "no-store"');
    expect(executableSource).not.toMatch(/getDb|DATABASE_URL|process\.env|createContext|authenticated|protected|admin|cookie|session|organization|branch|jurisdiction|secret/i);
  });
});
