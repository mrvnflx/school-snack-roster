
import type { NotificationsRepo } from './contracts';
import { store } from './in-memory-store';

export const inMemoryNotifications: NotificationsRepo = {
  async log(parentId: string, sectionId: string | null, type: string, payload: Record<string, unknown>) {
    store.ensureSeeded();
    store.notifications.push({
      id: String(Date.now()),
      parentId,
      sectionId,
      type,
      payload,
      sent: false,
      createdAt: new Date().toISOString(),
    });
  },
};
