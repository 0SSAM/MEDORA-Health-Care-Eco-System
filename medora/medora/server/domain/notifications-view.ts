export type NotificationViewInput = { id: number; isRead: boolean };

export function summarizeNotifications<T extends NotificationViewInput>(items: T[]) {
  return { items, unreadCount: items.filter(item => !item.isRead).length };
}
