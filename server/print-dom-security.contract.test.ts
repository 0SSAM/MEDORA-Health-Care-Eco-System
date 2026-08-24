import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readSource = (relativePath: string) => readFileSync(resolve(repositoryRoot, relativePath), "utf8");

describe("print document DOM safety contracts", () => {
  it("does not interpret tax-invoice values as HTML", () => {
    const taxInvoice = readSource("client/src/components/TaxInvoiceWorkspace.tsx");
    const safePrint = readSource("client/src/lib/safePrintDocument.ts");

    expect(taxInvoice).not.toContain("document.write(");
    expect(taxInvoice).not.toContain(".innerHTML =");
    expect(safePrint).toContain("textContent = text");
    expect(safePrint).toContain("document.body.replaceChildren()");

    const pointOfSalePath = resolve(repositoryRoot, "client/src/components/PointOfSaleWorkspace.tsx");
    if (existsSync(pointOfSalePath)) {
      expect(readFileSync(pointOfSalePath, "utf8")).not.toContain("document.write(");
    }
  });
});
