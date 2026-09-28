import type { ChildrenRepo } from './contracts';
import { createClient } from '@/lib/supabase/server';
import type { DbResult } from './types';

interface ParentChildRow {
  parent_id: string;
}

interface ChildRow {
  id: string;
  name: string;
  section_id: string;
  created_at: string;
  sections: { name: string } | { name: string }[] | null;
  parent_children: ParentChildRow[] | null;
}

function mapChildWithSection(row: ChildRow): import('./types').ChildWithSection {
  const parentId =
    Array.isArray(row.parent_children) && row.parent_children.length > 0
      ? row.parent_children[0]?.parent_id ?? null
      : null;

  return {
    child: {
      id: row.id,
      name: row.name,
      sectionId: row.section_id,
      createdAt: row.created_at,
    },
    sectionName:
      Array.isArray(row.sections)
        ? row.sections[0]?.name ?? null
        : row.sections?.name ?? null,
    parentId,
  };
}

export const supabaseChildren: ChildrenRepo = {
  async listWithSection() {
    const supabase = await createClient();
    const { data } = await supabase
      .from('children')
      .select('id, name, section_id, created_at, sections(name), parent_children(parent_id)')
      .order('name');
    if (!data) return [];
    return (data as ChildRow[]).map(mapChildWithSection);
  },

  async create(name: string, sectionId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('children').insert({ name, section_id: sectionId });
    if (error) return { success: false, error: error.message };
    return { success: true, data: undefined };
  },

  async linkParent(parentPhone: string, childId: string) {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', parentPhone)
      .maybeSingle();
    if (!profile) {
      return { success: false, error: 'No parent account found for that phone yet — they need to log in once first, then re-run this link.' };
    }
    const { error } = await supabase
      .from('parent_children')
      .insert({ parent_id: profile.id, child_id: childId });
    if (error) return { success: false, error: error.message };
    return { success: true, data: undefined };
  },

  async importRosterCsv(rows: { child_name: string; section_name: string; parent_phone: string }[]) {
    const supabase = await createClient();
    const log: string[] = [];
    for (const row of rows) {
      const { data: section } = await supabase
        .from('sections')
        .select('id')
        .eq('name', row.section_name)
        .maybeSingle();
      if (!section) {
        log.push(`Skipped ${row.child_name}: section "${row.section_name}" not found.`);
        continue;
      }
      const { data: child, error: childErr } = await supabase
        .from('children')
        .insert({ name: row.child_name, section_id: section.id })
        .select('id')
        .single();
      if (childErr || !child) {
        log.push(`Failed to add ${row.child_name}: ${childErr?.message}`);
        continue;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', row.parent_phone)
        .maybeSingle();
      if (profile) {
        await supabase.from('parent_children').insert({ parent_id: profile.id, child_id: child.id });
      } else {
        log.push(`${row.child_name} added, but parent ${row.parent_phone} hasn't logged in yet — link will need to happen after their first login.`);
      }
    }
    return { success: true, data: { log } };
  },
};
