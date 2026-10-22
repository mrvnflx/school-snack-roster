
import type { HolidaysRepo } from './contracts';
import { store } from './in-memory-store';
import type { DbResult } from './types';

export const inMemoryHolidays: HolidaysRepo = {
  async list() {
    store.ensureSeeded();
    return [...store.holidays];
  },

  async create(academicYear: string, date: string, name: string) {
    store.ensureSeeded();
    store.holidays.push({
      id: String(Date.now()),
      academicYear,
      date,
      name,
      createdAt: new Date().toISOString(),
    });
    return { success: true, data: undefined };
  },
};
