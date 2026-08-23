export type EmployeeDirectoryExportRow = {
  name: string | null;
  username: string;
  organizationRole: string;
  branchName: string | null;
  active: number | boolean;
};

export function escapeEmployeeCsvCell(value: string | number | boolean | null | undefined) {
  const text = value == null ? "" : String(value);
  const formulaSafe = /^[\t\r\n ]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${formulaSafe.replace(/"/g, '""')}"`;
}

export function createEmployeeDirectoryCsv(rows: EmployeeDirectoryExportRow[]) {
  const header = ["employee_name", "username", "organization_role", "branch_name", "account_status"];
  const lines = rows.map(row => [
    row.name,
    row.username,
    row.organizationRole,
    row.branchName,
    Boolean(row.active) ? "active" : "disabled",
  ].map(escapeEmployeeCsvCell).join(","));
  return `\uFEFF${header.map(escapeEmployeeCsvCell).join(",")}\r\n${lines.join("\r\n")}\r\n`;
}
