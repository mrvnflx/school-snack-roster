
import type { AuthRepo } from './contracts';
import { createClient } from '@/lib/supabase/server';

export const supabaseAuth: AuthRepo = {
  async getUser() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name, phone')
      .eq('id', user.id)
      .maybeSingle();
    return {
      id: user.id,
      phone: user.phone,
      role: profile?.role,
      fullName: profile?.full_name,
    };
  },
};
