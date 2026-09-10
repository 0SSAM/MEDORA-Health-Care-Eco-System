import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { smartSearch } from "../lib/smartSearch";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

describe("Home inline smart-search dropdown", () => {
  it("renders an adjacent accessible result list only when the query is non-empty", () => {
    expect(homeSource).toContain('id="home-smart-search-results"');
    expect(homeSource).toContain('role="listbox"');
    expect(homeSource).toContain("searchOpen && query.trim() && searchDropdownAnchor");
    expect(homeSource).toContain('input.setAttribute("aria-expanded", String(isExpanded))');
    expect(homeSource).toContain('input.setAttribute("aria-controls", "home-smart-search-results")');
  });

  it("keeps keyboard selection and escape dismissal attached to the focused search input", () => {
    expect(homeSource).toContain('event.key === "ArrowDown"');
    expect(homeSource).toContain('event.key === "ArrowUp"');
    expect(homeSource).toContain('event.key === "Enter"');
    expect(homeSource).toContain('event.key === "Escape"');
    expect(homeSource).toContain('event.target !== moduleSearchRef.current');
    expect(homeSource).toContain('window.addEventListener("focusout", onFocusOut)');
    expect(homeSource).toContain('focused.closest("#home-smart-search-results")');
  });

  it("shows keyboard-correction context and bounded match badges", () => {
    expect(homeSource).toContain('result.matchedBy === "keyboard-layout"');
    expect(homeSource).toContain("Keyboard corrected");
    expect(homeSource).toContain("تصحيح لوحة المفاتيح");
    expect(homeSource).toContain('tolerant: "Close spelling"');
  });

  it("never turns an excluded module into a dropdown result", () => {
    const permittedRoutes = [{ id: "operations", label: "مركز العمليات", searchText: "operations crm متابعة العملاء باراسيتامول" }];
    const permittedResults = smartSearch(permittedRoutes, "fhvhsdjhl,g", ["label", "searchText"]);

    expect(permittedResults).toHaveLength(1);
    expect(permittedResults[0]?.item.id).toBe("operations");
    expect(permittedResults[0]?.matchedBy).toBe("keyboard-layout");
    expect(homeSource).toContain('smartSearch(allowedModules, query, ["label", "searchText"])');
    expect(homeSource).toContain('if (!allowedModules.some(item => item.id === moduleId)) return;');
  });
});
