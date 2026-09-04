import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/Welcome.tsx"), "utf8");

describe("Welcome bilingual header and public landing contract", () => {
  it("uses active-language brand copy rather than a hard-coded Arabic name", () => {
    expect(source).toContain('brandTitle: "MEDORA | Health Care Eco System"');
    expect(source).toContain('brandTitle: "MEDORA | منظومة الرعاية الصحية المتكاملة"');
    expect(source).toContain("{copy.brandTitle}");
    expect(source).not.toContain('>MEDORA | منظومة الرعاية الصحية المتكاملة</p>');
  });

  it("keeps the public landing surface independent of production authentication", () => {
    expect(source).toContain("Public preview must stay independent of production auth/tRPC APIs.");
    expect(source).not.toContain("useAuth");
    expect(source).toContain("welcomeRoutes.login");
    expect(source).toContain("welcomeRoutes.workspace");
  });

  it("keeps the richer integrated product narrative and safe boundaries", () => {
    expect(source).toContain('id="platform"');
    expect(source).toContain('id="model"');
    expect(source).toContain('id="governance"');
    expect(source).toContain("Human review");
    expect(source).toContain("المراجعة البشرية");
    expect(source).toContain("integration-gated");
    expect(source).toContain("مرتبطة بمتطلبات");
  });

  it("keeps the header mark and brand copy in a shrinkable layout", () => {
    expect(source).toContain('className="flex min-w-0 items-center gap-3"');
    expect(source).toContain('className="min-w-0"');
    expect(source).toContain('className="truncate text-sm font-bold tracking-tight sm:text-base">{copy.brandTitle}</p>');
    expect(source).toContain('className="flex shrink-0 items-center gap-2"');
    expect(source).toContain('onError={event => event.currentTarget.classList.add("hidden")}');
    expect(source).toContain('aria-label="MEDORA Health Care Eco System"');
  });
});
