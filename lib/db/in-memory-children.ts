
import type { ChildrenRepo } from './contracts';
import { store } from './in-memory-store';
import type { DbResult, ChildWithSection } from './types';

function toChildWithSection(child: import('./types').Child): ChildWithSection {
  const section = store.sections.find(s => s.id === child.sectionId);
  const link = store.parentChildLinks.find(l => l.childId === child.id);
  return { child, sectionName: section?.name ?? null, parentId: link?.parentId ?? null };
}

export const inMemoryChildren: ChildrenRepo = {
  async listWithSection() {
    store.ensureSeeded();
    return store.children.map(toChildWithSection);
  },

  async create(name: string, sectionId: string) {
    store.ensureSeeded();
    const section = store.sections.find(s => s.id === sectionId);
    if (!section) return { success: false, error: 'Section not found' };
    if (section.archived) return { success: false, error: 'Section is archived' };
    store.children.push({
      id: String(Date.now()),
      name,
      sectionId,
      createdAt: new Date().toISOString(),
    });
    return { success: true, data: undefined };
  },

  async linkParent(parentPhone: string, childId: string) {
    store.ensureSeeded();
    const profile = store.profiles.find(p => p.phone === parentPhone);
    if (!profile) return { success: false, error: 'No parent account found for that phone' };
    const child = store.children.find(c => c.id === childId);
    if (!child) return { success: false, error: 'Child not found' };
    if (store.parentChildLinks.some(l => l.parentId === profile.id && l.childId === childId)) {
      return { success: false, error: 'Already linked' };
    }
    store.parentChildLinks.push({ parentId: profile.id, childId });
    return { success: true, data: undefined };
  },

  async importRosterCsv(rows) {
    store.ensureSeeded();
    const log: string[] = [];
    for (const row of rows) {
      const section = store.sections.find(s => s.name === row.section_name);
      if (!section) {
        log.push(`Skipped ${row.child_name}: section "${row.section_name}" not found.`);
        continue;
      }
      store.children.push({
        id: String(Date.now()),
        name: row.child_name,
        sectionId: section.id,
        createdAt: new Date().toISOString(),
      });
      const profile = store.profiles.find(p => p.phone === row.parent_phone);
      if (profile) {
        store.parentChildLinks.push({ parentId: profile.id, childId: String(store.children.length) });
        // Use the actual child id we just added
        const childId = store.children[store.children.length - 1].id;
        store.parentChildLinks[store.parentChildLinks.length - 1].childId = childId;
      } else {
        log.push(`${row.child_name} added, but parent ${row.parent_phone} hasn't logged in yet.`);
      }
    }
    return { success: true, data: { log } };
  },
};
