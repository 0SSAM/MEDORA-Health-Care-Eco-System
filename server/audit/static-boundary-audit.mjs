import { readFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");
async function collect(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const output = [];
  for (const entry of entries) {
    const full = `${dir}/${entry.name}`;
    if (entry.isDirectory()) output.push(...(await collect(full)));
    else if (entry.isFile() && entry.name.endsWith(".ts")) output.push(full);
  }
  return output;
}
const files = [];
for (const section of ["routers", "domain", "scheduled"]) files.push(...(await collect(`${root}/${section}`)));
files.push(`${root}/db.ts`);
const findings = [];
const patterns = [
  { id: "protected-procedure", re: /protectedProcedure/g },
  { id: "organization-scope", re: /organizationId/g },
  { id: "jurisdiction-scope", re: /jurisdictionId/g },
  { id: "raw-error-string", re: /message:\\s*String\\(error\\)/g },
  { id: "body-or-payload", re: /(requestBody|responseText|payload)/g },
];
for (const file of files) {
  const source = await readFile(file, "utf8");
  const relative = file.replace(`${root}/`, "");
  const lineCount = source.split(/\\r?\\n/).length;
  const counts = Object.fromEntries(patterns.map(({ id, re }) => [id, (source.match(re) ?? []).length]));
  findings.push({ file: relative, lineCount, ...counts });
}
findings.sort((a, b) => a.file.localeCompare(b.file));
const totals = Object.fromEntries(patterns.map(({ id }) => [id, findings.reduce((sum, row) => sum + row[id], 0)]));
const summary = {
  filesScanned: findings.length,
  filesWithProtectedProcedures: findings.filter(row => row["protected-procedure"] > 0).length,
  filesWithOrganizationScope: findings.filter(row => row["organization-scope"] > 0).length,
  filesWithJurisdictionScope: findings.filter(row => row["jurisdiction-scope"] > 0).length,
  filesWithRawErrorStrings: findings.filter(row => row["raw-error-string"] > 0).length,
  filesWithBodyOrPayloadTokens: findings.filter(row => row["body-or-payload"] > 0).length,
};
const report = {
  generatedAt: new Date().toISOString(),
  scope: "server routers, domain policies, scheduled callbacks, and db helper files",
  methodology: "Static inventory only; counts do not replace code review or disposable-database lifecycle tests.",
  summary,
  files: findings,
  totals,
};
console.log(JSON.stringify(report, null, 2));
