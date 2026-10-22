
import type { BlackoutsRepo } from './contracts';
import { createClient } from '@/lib/supabase/server';
import type { DbResult } from './types';

export const supabaseBlackouts: BlackoutsRepo = {
  async list() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('blackout_days').select('id, date, reason, section_id, created_at').order('date');
    if (error) return [];
    return (data ?? []).map(row => ({
      id: row.id,
      date: row.date,
      reason: row.reason,
      sectionId: row.section_id,
      createdAt: row.created_at,
    }));
  },

  async create(date: string, reason: string | null, sectionId: string | null) {
    const supabase = await createClient();
    const { error } = await supabase
      .from('blackout_days')
      .insert({ date, reason, section_id: sectionId });
    if (error) return { success: false, error: error.message };
    return { success: true, data: undefined };
  },

  async remove(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('blackout_days').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true, data: undefined };
  },
};
