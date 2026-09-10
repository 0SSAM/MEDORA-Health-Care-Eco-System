import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/components/SupplierDirectoryWorkspace.tsx"), "utf8");

describe("SupplierDirectoryWorkspace bilingual contract", () => {
  it("selects English copy and LTR geometry from the active language", () => {
    expect(source).toContain('const t: Translate = (arabic, english) => language === "en" ? english : arabic;');
    expect(source).toContain('const dir = language === "en" ? "ltr" : "rtl";');
    expect(source).toContain('dir={dir}');
    expect(source).toContain('"Supplier directory"');
    expect(source).toContain('"Add supplier"');
    expect(source).toContain('"Search name, code, phone, or tax number"');
    expect(source).toContain('text-start');
  });

  it("keeps all supplier operations on their existing scoped routes", () => {
    expect(source).toContain('trpc.procurement.suppliers.list.useQuery');
    expect(source).toContain('trpc.procurement.suppliers.create.useMutation');
    expect(source).toContain('trpc.procurement.suppliers.update.useMutation');
    expect(source).toContain('trpc.procurement.suppliers.requestCredit.useMutation');
    expect(source).toContain('trpc.procurement.suppliers.decideCredit.useMutation');
    expect(source).toContain('organizationId: organizationId as number');
    expect(source).toContain('branchId: branchId as number');
    expect(source).toContain('jurisdictionId: jurisdictionId as number');
  });
});
