import { describe, expect, it } from "vitest";
import { isAtLogicalEdge, isHorizontalSwipe, logicalEdge, swipeAction } from "./sidebarGestures";

describe("sidebar gestures", () => {
  it("maps the logical edge for both directions", () => {
    expect(logicalEdge("rtl")).toBe("end");
    expect(logicalEdge("ltr")).toBe("start");
  });

  it("opens from the correct physical edge", () => {
    expect(isAtLogicalEdge("rtl", 1270, 1280)).toBe(true);
    expect(isAtLogicalEdge("rtl", 10, 1280)).toBe(false);
    expect(isAtLogicalEdge("ltr", 10, 1280)).toBe(true);
    expect(isAtLogicalEdge("ltr", 1270, 1280)).toBe(false);
  });

  it("interprets opening and closing swipes according to direction", () => {
    expect(swipeAction("rtl", -90, 4)).toBe("open");
    expect(swipeAction("rtl", 90, 4)).toBe("close");
    expect(swipeAction("ltr", 90, 4)).toBe("open");
    expect(swipeAction("ltr", -90, 4)).toBe("close");
  });

  it("ignores short and primarily vertical gestures", () => {
    expect(isHorizontalSwipe(40, 0)).toBe(false);
    expect(swipeAction("rtl", -100, 120)).toBe(null);
  });
});
