
import type { NotificationsRepo } from './contracts';
import { createClient } from '@/lib/supabase/server';

export const supabaseNotifications: NotificationsRepo = {
  async log(parentId: string, sectionId: string | null, type: string, payload: Record<string, unknown>) {
    const supabase = await createClient();
    await supabase.from('notifications_log').insert({
      parent_id: parentId,
      section_id: sectionId,
      type,
      payload,
    });
  },
};
