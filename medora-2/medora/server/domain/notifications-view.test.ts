import { describe, expect, it } from "vitest";
import { summarizeNotifications } from "./notifications-view";

describe("notification view", () => {
  it("counts only unread items", () => {
    expect(summarizeNotifications([{ id: 1, isRead: false }, { id: 2, isRead: true }, { id: 3, isRead: false }])).toEqual({
      items: [{ id: 1, isRead: false }, { id: 2, isRead: true }, { id: 3, isRead: false }],
      unreadCount: 2,
    });
  });
});
