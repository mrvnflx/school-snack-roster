
import type { SchedulesRepo } from './contracts';
import { createClient } from '@/lib/supabase/server';
import type { DbResult } from './types';

export const supabaseSchedules: SchedulesRepo = {
  async getBySectionYearMonth(sectionId: string, year: number, month: number) {
    const supabase = await createClient();
    const { data } = await supabase
      .from('schedules')
      .select('id, section_id, year, month, generated_at')
      .eq('section_id', sectionId)
      .eq('year', year)
      .eq('month', month)
      .maybeSingle();
    if (!data) return null;
    return { id: data.id, sectionId: data.section_id, year: data.year, month: data.month, generatedAt: data.generated_at };
  },

  async generateForSection(sectionId: string, year: number, month: number) {
    const supabase = await createClient();
    const { error } = await supabase.rpc('generate_month_schedule', { p_section_id: sectionId, p_year: year, p_month: month });
    if (error) return { success: false, error: error.message };
    return { success: true, data: undefined };
  },

  async listBySection(sectionId: string) {
    const supabase = await createClient();
    const { data } = await supabase
      .from('schedules')
      .select('id, section_id, year, month, generated_at')
      .eq('section_id', sectionId);
    if (!data) return [];
    return data.map(row => ({ id: row.id, sectionId: row.section_id, year: row.year, month: row.month, generatedAt: row.generated_at }));
  },
};
