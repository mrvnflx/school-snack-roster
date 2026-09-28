
import type { SectionsRepo } from './contracts';
import { createClient } from '@/lib/supabase/server';
import type { DbResult } from './types';

export const supabaseSections: SectionsRepo = {
  async list(archived = false) {
    const supabase = await createClient();
    let query = supabase.from('sections').select('id, name, archived, created_at').order('name');
    if (archived === false) query = query.eq('archived', false);
    if (archived === true) query = query.eq('archived', true);
    const { data, error } = await query;
    if (error) return [];
    return (data ?? []).map(row => ({
      id: row.id,
      name: row.name,
      archived: row.archived,
      createdAt: row.created_at,
    }));
  },

  async getById(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('sections')
      .select('id, name, archived, created_at')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return {
      id: data.id,
      name: data.name,
      archived: data.archived,
      createdAt: data.created_at,
    };
  },

  async create(name: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('sections').insert({ name });
    if (error) return { success: false, error: error.message };
    return { success: true, data: undefined };
  },

  async archive(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('sections').update({ archived: true }).eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true, data: undefined };
  },
};
