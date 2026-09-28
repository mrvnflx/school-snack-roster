import type { ProfilesRepo } from './contracts';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from './types';

export const supabaseProfiles: ProfilesRepo = {
  async getById(id: string) {
    const supabase = await createClient();
    const { data } = await supabase.from('profiles').select('id, role, full_name, phone, created_at').eq('id', id).single();
    if (!data) return null;
    return { id: data.id, role: data.role as Profile['role'], fullName: data.full_name, phone: data.phone, createdAt: data.created_at };
  },

  async getByPhone(phone: string) {
    const supabase = await createClient();
    const { data } = await supabase.from('profiles').select('id, role, full_name, phone, created_at').eq('phone', phone).single();
    if (!data) return null;
    return { id: data.id, role: data.role as Profile['role'], fullName: data.full_name, phone: data.phone, createdAt: data.created_at };
  },

  async create(id: string, phone: string, fullName?: string) {
    const supabase = await createClient();
    await supabase.from('profiles').insert({ id, phone, full_name: fullName ?? null });
  },

  async updateRole(id: string, role: 'admin' | 'parent') {
    const supabase = await createClient();
    await supabase.from('profiles').update({ role }).eq('id', id);
  },

  async listAll() {
    const supabase = await createClient();
    const { data } = await supabase.from('profiles').select('id, role, full_name, phone, created_at');
    if (!data) return [];
    return data.map((row: any) => ({
      id: row.id,
      role: row.role as Profile['role'],
      fullName: row.full_name,
      phone: row.phone,
      createdAt: row.created_at,
    }));
  },
};
