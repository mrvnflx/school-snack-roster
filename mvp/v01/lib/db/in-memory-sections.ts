import type { SectionsRepo } from './contracts';
import { store } from './in-memory-store';
import type { DbResult } from './types';

export const inMemorySections: SectionsRepo = {
  async list(archived = false) {
    store.ensureSeeded();
    if (archived === false) return store.sections.filter(s => !s.archived);
    if (archived === true) return store.sections.filter(s => s.archived);
    return [...store.sections];
  },

  async getById(id: string) {
    store.ensureSeeded();
    return store.sections.find(s => s.id === id) ?? null;
  },

  async create(name: string) {
    store.ensureSeeded();
    store.sections.push({
      id: String(Date.now()),
      name,
      archived: false,
      createdAt: new Date().toISOString(),
    });
    return { success: true, data: undefined };
  },

  async archive(id: string) {
    store.ensureSeeded();
    const idx = store.sections.findIndex(s => s.id === id);
    if (idx === -1) return { success: false, error: 'Section not found' };
    store.sections[idx].archived = true;
    return { success: true, data: undefined };
  },
};
