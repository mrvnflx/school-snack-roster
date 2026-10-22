
import type { MenusRepo } from './contracts';
import { store } from './in-memory-store';
import type { DbResult, MenuWithItems } from './types';

function toMenuWithItems(menu: import('./types').Menu): MenuWithItems {
  return {
    menu,
    items: store.menuItems.filter(mi => mi.menuId === menu.id).sort((a, b) => a.position - b.position),
  };
}

export const inMemoryMenus: MenusRepo = {
  async listAll() {
    store.ensureSeeded();
    return store.menus.map(m => toMenuWithItems(m));
  },

  async getActiveMenuForSection(sectionId: string) {
    store.ensureSeeded();
    const override = store.menus.find(m => m.sectionId === sectionId);
    const menu = override ?? store.menus.find(m => m.sectionId === null);
    if (!menu) return null;
    return toMenuWithItems(menu);
  },

  async ensureMenu(sectionId: string | null) {
    store.ensureSeeded();
    const existing = store.menus.find(m => m.sectionId === sectionId);
    if (existing) return { success: true, data: existing.id };
    const menu: import('./types').Menu = {
      id: String(Date.now()),
      sectionId,
      name: sectionId === null ? 'Global Snack Menu' : 'Section Menu',
      createdAt: new Date().toISOString(),
    };
    store.menus.push(menu);
    return { success: true, data: menu.id };
  },

  async addMenuItem(menuId: string, name: string, position: number) {
    store.ensureSeeded();
    store.menuItems.push({
      id: String(Date.now()),
      menuId,
      name,
      position,
      createdAt: new Date().toISOString(),
    });
    return { success: true, data: undefined };
  },

  async deleteMenuItem(itemId: string) {
    store.ensureSeeded();
    const idx = store.menuItems.findIndex(mi => mi.id === itemId);
    if (idx === -1) return { success: false, error: 'Menu item not found' };
    store.menuItems.splice(idx, 1);
    return { success: true, data: undefined };
  },

  async deleteSectionMenuOverride(menuId: string) {
    store.ensureSeeded();
    const idx = store.menus.findIndex(m => m.id === menuId && m.sectionId !== null);
    if (idx === -1) return { success: false, error: 'Menu override not found' };
    store.menus.splice(idx, 1);
    return { success: true, data: undefined };
  },
};
