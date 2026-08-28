import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readSource = (relativePath: string) => readFileSync(resolve(repositoryRoot, relativePath), "utf8");

describe("print document DOM safety contracts", () => {
  it("does not interpret POS or tax-invoice values as HTML", () => {
    const pos = readSource("client/src/components/PointOfSaleWorkspace.tsx");
    const taxInvoice = readSource("client/src/components/TaxInvoiceWorkspace.tsx");
    const safePrint = readSource("client/src/lib/safePrintDocument.ts");

    expect(pos).not.toContain("document.write(");
    expect(taxInvoice).not.toContain("document.write(");
    expect(safePrint).toContain("textContent = text");
    expect(safePrint).toContain("document.body.replaceChildren()");
  });
});
