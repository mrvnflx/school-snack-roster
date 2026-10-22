
import type { BlackoutsRepo } from './contracts';
import { store } from './in-memory-store';
import type { DbResult } from './types';

export const inMemoryBlackouts: BlackoutsRepo = {
  async list() {
    store.ensureSeeded();
    return [...store.blackoutDays];
  },

  async create(date: string, reason: string | null, sectionId: string | null) {
    store.ensureSeeded();
    store.blackoutDays.push({
      id: String(Date.now()),
      date,
      reason,
      sectionId,
      createdAt: new Date().toISOString(),
    });
    // Regenerate schedules since blackout affects them
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    for (const section of store.sections.filter(s => !s.archived)) {
      store.generateScheduleFor(section.id, year, month);
    }
    return { success: true, data: undefined };
  },

  async remove(id: string) {
    store.ensureSeeded();
    const idx = store.blackoutDays.findIndex(b => b.id === id);
    if (idx === -1) return { success: false, error: 'Blackout not found' };
    store.blackoutDays.splice(idx, 1);
    // Regenerate schedules
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    for (const section of store.sections.filter(s => !s.archived)) {
      store.generateScheduleFor(section.id, year, month);
    }
    return { success: true, data: undefined };
  },
};
