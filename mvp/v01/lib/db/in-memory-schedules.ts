
import type { SchedulesRepo } from './contracts';
import type { DbResult } from './types';
import { store } from './in-memory-store';

export const inMemorySchedules: SchedulesRepo = {
  async getBySectionYearMonth(sectionId: string, year: number, month: number) {
    store.ensureSeeded();
    return store.schedules.find(
      s => s.sectionId === sectionId && s.year === year && s.month === month
    ) ?? null;
  },

  async generateForSection(sectionId: string, year: number, month: number) {
    store.ensureSeeded();
    // Regenerate — removes old slots for this schedule and creates new ones
    const existingSchedule = store.schedules.find(
      s => s.sectionId === sectionId && s.year === year && s.month === month
    );
    if (existingSchedule) {
      // Remove existing slots for this schedule
      store.slots = store.slots.filter(s => s.scheduleId !== existingSchedule.id);
    }

    const scheduleId = existingSchedule?.id ?? String(Date.now());
    store.schedules.push({
      id: scheduleId,
      sectionId,
      year,
      month,
      generatedAt: new Date().toISOString(),
    });

    // Weekdays only, excluding holidays and blackouts
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);
    const academicYear = `${year}-${year + 1}`;
    const holidayDates = new Set(
      store.holidays.filter(h => h.academicYear === academicYear).map(h => h.date)
    );
    const blackoutDates = new Set(
      store.blackoutDays
        .filter(b => b.sectionId === null || b.sectionId === sectionId)
        .map(b => b.date)
    );

    let d = new Date(monthStart);
    while (d <= monthEnd) {
      const dow = d.getDay();
      const iso = d.toISOString().slice(0, 10);
      if (dow !== 0 && dow !== 6 && !holidayDates.has(iso) && !blackoutDates.has(iso)) {
        store.slots.push({
          id: String(Date.now() + Math.random()),
          scheduleId,
          sectionId,
          date: iso,
          status: 'open',
          childId: null,
          parentId: null,
          menuItemId: null,
          signedUpAt: null,
          createdAt: new Date().toISOString(),
        });
      }
      d.setDate(d.getDate() + 1);
    }

    return { success: true, data: undefined };
  },

  async listBySection(sectionId: string) {
    store.ensureSeeded();
    return store.schedules.filter(s => s.sectionId === sectionId);
  },
};
