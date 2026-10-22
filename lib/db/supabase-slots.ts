import type { SlotsRepo } from './contracts';
import { createClient } from '@/lib/supabase/server';
import type { DbResult, SlotWithDetails } from './types';

interface SlotRow {
  id: string;
  schedule_id: string;
  section_id: string;
  date: string;
  status: string;
  child_id: string | null;
  parent_id: string | null;
  menu_item_id: string | null;
  signed_up_at: string | null;
  created_at: string;
  children: { id: string; name: string } | null;
  menu_items: { id: string; name: string } | null;
}

function mapSlot(row: SlotRow): SlotWithDetails {
  return {
    id: row.id,
    scheduleId: row.schedule_id,
    sectionId: row.section_id,
    date: row.date,
    status: row.status as SlotWithDetails['status'],
    childId: row.child_id,
    parentId: row.parent_id,
    menuItemId: row.menu_item_id,
    signedUpAt: row.signed_up_at,
    createdAt: row.created_at,
    childName: row.children?.name ?? null,
    menuItemName: row.menu_items?.name ?? null,
  };
}

export const supabaseSlots: SlotsRepo = {
  async getById(id: string) {
    const supabase = await createClient();
    const { data } = await supabase
      .from('slots')
      .select(`id, schedule_id, section_id, date, status, child_id, parent_id,
        menu_item_id, signed_up_at, created_at`)
      .eq('id', id)
      .single();
    if (!data) return null;
    return {
      id: data.id, scheduleId: data.schedule_id, sectionId: data.section_id,
      date: data.date, status: data.status as SlotWithDetails['status'], childId: data.child_id,
      parentId: data.parent_id, menuItemId: data.menu_item_id,
      signedUpAt: data.signed_up_at, createdAt: data.created_at,
      childName: null, menuItemName: null,
    };
  },

  async listBySchedule(scheduleId: string) {
    const supabase = await createClient();
    const { data } = await supabase
      .from('slots')
      .select(`id, schedule_id, section_id, date, status, child_id, parent_id,
        menu_item_id, signed_up_at, created_at,
        children (id, name),
        menu_items (id, name)`)
      .eq('schedule_id', scheduleId)
      .order('date');
    if (!data) return [];
    return (data as unknown as SlotRow[]).map(mapSlot);
  },

  async listBySectionAndMonth(sectionId: string, year: number, month: number) {
    const supabase = await createClient();
    const { data: schedule } = await supabase
      .from('schedules')
      .select('id')
      .eq('section_id', sectionId)
      .eq('year', year)
      .eq('month', month)
      .maybeSingle();
    if (!schedule) return [];
    const { data } = await supabase
      .from('slots')
      .select(`id, schedule_id, section_id, date, status, child_id, parent_id,
        menu_item_id, signed_up_at, created_at,
        children (id, name),
        menu_items (id, name)`)
      .eq('schedule_id', schedule.id)
      .order('date');
    if (!data) return [];
    return (data as unknown as SlotRow[]).map(mapSlot);
  },

  async signUp(slotId: string, childId: string, parentId: string, menuItemId: string) {
    const supabase = await createClient();
    const { error } = await supabase
      .from('slots')
      .update({ child_id: childId, parent_id: parentId, menu_item_id: menuItemId, status: 'filled', signed_up_at: new Date().toISOString() })
      .eq('id', slotId)
      .eq('status', 'open');
    if (error) return { success: false, error: error.message };
    return { success: true, data: undefined };
  },

  async cancel(slotId: string, parentId: string) {
    const supabase = await createClient();
    const { data: slot } = await supabase
      .from('slots')
      .select('date, parent_id')
      .eq('id', slotId)
      .single();
    if (!slot) return { success: false, error: 'Slot not found' };
    if (slot.parent_id !== parentId) return { success: false, error: 'Not your slot' };
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const slotDate = new Date(slot.date + 'T00:00:00');
    const daysUntil = Math.round((slotDate.getTime() - today.getTime()) / 86400000);
    if (daysUntil < 3) return { success: false, error: 'Too close to the date — edits close 3 days before' };
    const { error } = await supabase
      .from('slots')
      .update({ child_id: null, parent_id: null, menu_item_id: null, status: 'open', signed_up_at: null })
      .eq('id', slotId);
    if (error) return { success: false, error: error.message };
    return { success: true, data: undefined };
  },

  async swapSlots(fromSlotId: string, toSlotId: string) {
    const supabase = await createClient();
    const { data: slots } = await supabase
      .from('slots')
      .select('*')
      .in('id', [fromSlotId, toSlotId]);
    if (!slots || slots.length < 2) return;
    const a = slots.find((s: any) => s.id === fromSlotId);
    const b = slots.find((s: any) => s.id === toSlotId);
    if (!a || !b) return;
    await supabase.from('slots').update({ child_id: b.child_id, parent_id: b.parent_id, menu_item_id: b.menu_item_id }).eq('id', a.id);
    await supabase.from('slots').update({ child_id: a.child_id, parent_id: a.parent_id, menu_item_id: a.menu_item_id }).eq('id', b.id);
  },
};
