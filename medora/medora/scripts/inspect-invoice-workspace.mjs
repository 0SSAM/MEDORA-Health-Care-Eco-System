import { readFileSync } from "node:fs";
const source = readFileSync("client/src/pages/Home.tsx", "utf8");
const start = source.indexOf("function SalesFinanceWorkspace");
const end = source.indexOf("function RegionalComplianceWorkspace");
const chunk = source.slice(start, end);
const needles = ["const [invoiceResult", "const issueInvoice", "const handleIssueInvoice", "const template", "invoiceResult &&", "getTemplate", "updateTemplate", "handlePrint"];
for (const needle of needles) {
  const index = chunk.indexOf(needle);
  console.log(`\n--- ${needle} @ ${index} ---`);
  if (index >= 0) console.log(chunk.slice(Math.max(0, index - 1000), index + 2600));
}
