
import type { HolidaysRepo } from './contracts';
import { createClient } from '@/lib/supabase/server';
import type { DbResult } from './types';

export const supabaseHolidays: HolidaysRepo = {
  async list() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('holidays').select('id, academic_year, date, name, created_at').order('date');
    if (error) return [];
    return (data ?? []).map(row => ({
      id: row.id,
      academicYear: row.academic_year,
      date: row.date,
      name: row.name,
      createdAt: row.created_at,
    }));
  },

  async create(academicYear: string, date: string, name: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('holidays').insert({ academic_year: academicYear, date, name });
    if (error) return { success: false, error: error.message };
    return { success: true, data: undefined };
  },
};
