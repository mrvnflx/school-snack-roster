
import type { SwapsRepo } from './contracts';
import { createClient } from '@/lib/supabase/server';
import type { DbResult } from './types';

export const supabaseSwaps: SwapsRepo = {
  async create(fromSlotId: string, toSlotId: string, requesterParentId: string, targetParentId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('swap_requests').insert({
      from_slot_id: fromSlotId,
      to_slot_id: toSlotId,
      requester_parent_id: requesterParentId,
      target_parent_id: targetParentId,
    });
    if (error) return { success: false, error: error.message };
    // Log notification
    await supabase.from('notifications_log').insert({
      parent_id: targetParentId,
      section_id: null,
      type: 'swap_requested',
      payload: { from_slot_id: fromSlotId, to_slot_id: toSlotId },
    });
    return { success: true, data: undefined };
  },

  async getById(id: string) {
    const supabase = await createClient();
    const { data } = await supabase
      .from('swap_requests')
      .select('*')
      .eq('id', id)
      .single();
    if (!data) return null;
    return {
      id: data.id,
      fromSlotId: data.from_slot_id,
      toSlotId: data.to_slot_id,
      requesterParentId: data.requester_parent_id,
      targetParentId: data.target_parent_id,
      status: data.status,
      createdAt: data.created_at,
      resolvedAt: data.resolved_at,
    };
  },

  async resolve(id: string, accept: boolean, userId: string): Promise<DbResult<void>> {
    const supabase = await createClient();
    const { data: swap } = await supabase
      .from('swap_requests')
      .select('*')
      .eq('id', id)
      .single();
    if (!swap) return { success: false, error: 'Swap not found' };
    if (swap.target_parent_id !== userId) return { success: false, error: 'Not your swap request' };
    if (swap.status !== 'pending') return { success: false, error: 'Already resolved' };

    if (accept) {
      const { data: slots } = await supabase
        .from('slots')
        .select('*')
        .in('id', [swap.from_slot_id, swap.to_slot_id]);
      if (!slots || slots.length < 2) return { success: true, data: undefined };
      const a = slots.find((s: any) => s.id === swap.from_slot_id);
      const b = slots.find((s: any) => s.id === swap.to_slot_id);
      if (a && b) {
        await supabase.from('slots').update({ child_id: b.child_id, parent_id: b.parent_id, menu_item_id: b.menu_item_id }).eq('id', a.id);
        await supabase.from('slots').update({ child_id: a.child_id, parent_id: a.parent_id, menu_item_id: a.menu_item_id }).eq('id', b.id);
      }
    }
    await supabase.from('swap_requests').update({ status: accept ? 'accepted' : 'declined', resolved_at: new Date().toISOString() }).eq('id', id);
    await supabase.from('notifications_log').insert({
      parent_id: swap.requester_parent_id,
      type: accept ? 'swap_accepted' : 'swap_declined',
      payload: { swap_id: id },
    });
    return { success: true, data: undefined };
  },
};
