export type LayoutDirection = "rtl" | "ltr";

export function logicalEdge(direction: LayoutDirection): "start" | "end" {
  return direction === "rtl" ? "end" : "start";
}

export function isHorizontalSwipe(dx: number, dy: number, threshold = 56): boolean {
  return Math.abs(dx) >= threshold && Math.abs(dx) >= Math.abs(dy) * 1.25;
}

export function swipeAction(
  direction: LayoutDirection,
  dx: number,
  dy: number,
  threshold = 56,
): "open" | "close" | null {
  if (!isHorizontalSwipe(dx, dy, threshold)) return null;
  const opening = direction === "rtl" ? dx < 0 : dx > 0;
  return opening ? "open" : "close";
}

export function isAtLogicalEdge(
  direction: LayoutDirection,
  clientX: number,
  viewportWidth: number,
  inset = 24,
): boolean {
  return direction === "rtl"
    ? clientX >= viewportWidth - inset
    : clientX <= inset;
}
