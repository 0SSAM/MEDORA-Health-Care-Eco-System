import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/Welcome.tsx"), "utf8");

describe("Welcome bilingual header contract", () => {
  it("uses active-language brand copy rather than a hard-coded Arabic name", () => {
    expect(source).toContain('brandTitle: "MEDORA | Health Care Eco System"');
    expect(source).toContain('brandTitle: "MEDORA | منظومة الرعاية الصحية المتكاملة"');
    expect(source).toContain("{copy.brandTitle}");
    expect(source).not.toContain('>MEDORA | منظومة الرعاية الصحية المتكاملة</p>');
  });

  it("keeps the header mark and brand copy within a shrinkable, truncating layout", () => {
    expect(source).toContain('className="flex min-w-0 flex-1 items-center');
    expect(source).toContain('className="min-w-0"');
    expect(source).toContain('className="text-xs font-bold tracking-[0.08em] sm:hidden">MEDORA</p>');
    expect(source).toContain('className="hidden truncate text-sm font-bold tracking-tight sm:block sm:text-base">{copy.brandTitle}</p>');
    expect(source).toContain('className="flex shrink-0 items-center gap-2"');
    expect(source).toContain('onError={event => { event.currentTarget.classList.add("hidden"); }}');
    expect(source).toContain('aria-label="MEDORA Health Care Eco System"');
  });
});
