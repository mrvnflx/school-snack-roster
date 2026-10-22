import type { MenusRepo } from './contracts';
import { createClient } from '@/lib/supabase/server';
import type { DbResult, MenuWithItems } from './types';

interface MenuRow {
  id: string;
  section_id: string | null;
  name: string;
  created_at: string;
  menu_items: Array<{
    id: string;
    menu_id: string;
    name: string;
    position: number;
    created_at: string;
  }>;
}

function mapMenuWithItems(row: MenuRow): MenuWithItems {
  return {
    menu: {
      id: row.id,
      sectionId: row.section_id,
      name: row.name,
      createdAt: row.created_at,
    },
    items: row.menu_items.map(item => ({
      id: item.id,
      menuId: item.menu_id,
      name: item.name,
      position: item.position,
      createdAt: item.created_at,
    })),
  };
}

export const supabaseMenus: MenusRepo = {
  async listAll() {
    const supabase = await createClient();
    const { data } = await supabase
      .from('menus')
      .select(`
        id,
        section_id,
        name,
        created_at,
        menu_items (id, menu_id, name, position, created_at)
      `);
    if (!data) return [];
    const map = new Map<string, MenuWithItems>();
    for (const row of data as MenuRow[]) {
      const key = row.section_id ?? '___global___';
      const existing = map.get(key);
      if (existing) {
        existing.items.push(...row.menu_items.map(item => ({
          id: item.id,
          menuId: item.menu_id,
          name: item.name,
          position: item.position,
          createdAt: item.created_at,
        })));
      } else {
        map.set(key, mapMenuWithItems(row));
      }
    }
    return Array.from(map.values()).map(m => ({
      ...m,
      items: m.items.sort((a, b) => a.position - b.position),
    }));
  },

  async getActiveMenuForSection(sectionId: string) {
    const supabase = await createClient();
    let { data: override } = await supabase
      .from('menus')
      .select(`
        id,
        section_id,
        name,
        created_at,
        menu_items (id, menu_id, name, position, created_at)
      `)
      .eq('section_id', sectionId)
      .maybeSingle();
    if (override) return mapMenuWithItems(override as MenuRow);

    let { data: globalMenu } = await supabase
      .from('menus')
      .select(`
        id,
        section_id,
        name,
        created_at,
        menu_items (id, menu_id, name, position, created_at)
      `)
      .is('section_id', null)
      .maybeSingle();
    if (globalMenu) return mapMenuWithItems(globalMenu as MenuRow);
    return null;
  },

  async ensureMenu(sectionId: string | null) {
    const supabase = await createClient();
    const { data: existing } = await supabase
      .from('menus')
      .select('id')
      .is('section_id', sectionId)
      .maybeSingle();
    if (existing) return { success: true, data: existing.id };
    const { data, error } = await supabase
      .from('menus')
      .insert({ section_id: sectionId, name: sectionId === null ? 'Global Snack Menu' : 'Section Menu' })
      .select('id')
      .single();
    if (error || !data) return { success: false, error: error?.message ?? 'Failed to create menu' };
    return { success: true, data: data.id };
  },

  async addMenuItem(menuId: string, name: string, position: number) {
    const supabase = await createClient();
    const { error } = await supabase.from('menu_items').insert({ menu_id: menuId, name, position });
    if (error) return { success: false, error: error.message };
    return { success: true, data: undefined };
  },

  async deleteMenuItem(itemId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('menu_items').delete().eq('id', itemId);
    if (error) return { success: false, error: error.message };
    return { success: true, data: undefined };
  },

  async deleteSectionMenuOverride(menuId: string) {
    const supabase = await createClient();
    const { error } = await supabase
      .from('menus')
      .delete()
      .eq('id', menuId)
      .not('section_id', 'is', null);
    if (error) return { success: false, error: error.message };
    return { success: true, data: undefined };
  },
};
