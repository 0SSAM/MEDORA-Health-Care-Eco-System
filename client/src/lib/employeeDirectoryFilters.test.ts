import { describe, expect, it } from "vitest";
import { filterEmployeeDirectory, normalizeEmployeeDirectoryQuery } from "./employeeDirectoryFilters";

const directory = [
  { name: "أحمد سالم", email: "ahmed@example.test", username: "ahmed.s", organizationRole: "staff", branchId: 7 },
  { name: "Maya Carter", email: "maya@example.test", username: "maya.c", organizationRole: "auditor", branchId: 7 },
  { name: "Hassan Noor", email: "noor@example.test", username: "hnoor", organizationRole: "operations_manager", branchId: 11 },
];

describe("employee directory filters", () => {
  it("normalizes surrounding whitespace and case for staff-directory search", () => {
    expect(normalizeEmployeeDirectoryQuery("  MAYA.C ")).toBe("maya.c");
  });

  it("finds authorized directory records by name, email, or username", () => {
    expect(filterEmployeeDirectory(directory, { query: "أحمد", role: "all", branchId: "all" }).map(member => member.username)).toEqual(["ahmed.s"]);
    expect(filterEmployeeDirectory(directory, { query: "noor@example", role: "all", branchId: "all" }).map(member => member.username)).toEqual(["hnoor"]);
    expect(filterEmployeeDirectory(directory, { query: "MAYA.C", role: "all", branchId: "all" }).map(member => member.username)).toEqual(["maya.c"]);
  });

  it("composes role and branch filters without adding records outside the supplied directory", () => {
    expect(filterEmployeeDirectory(directory, { query: "", role: "auditor", branchId: "7" }).map(member => member.username)).toEqual(["maya.c"]);
    expect(filterEmployeeDirectory(directory, { query: "", role: "auditor", branchId: "11" })).toEqual([]);
    expect(filterEmployeeDirectory(directory, { query: "", role: "all", branchId: "invalid" })).toEqual([]);
  });
});
