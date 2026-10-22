
import type { SlotsRepo } from './contracts';
import { store } from './in-memory-store';
import type { DbResult, SlotWithDetails } from './types';

function slotWithDetails(slot: import('./types').Slot): SlotWithDetails {
  const child = store.children.find(c => c.id === slot.childId);
  const menuItem = store.menuItems.find(mi => mi.id === slot.menuItemId);
  return {
    ...slot,
    childName: child?.name ?? null,
    menuItemName: menuItem?.name ?? null,
  };
}

export const inMemorySlots: SlotsRepo = {
  async getById(id: string) {
    store.ensureSeeded();
    const slot = store.slots.find(s => s.id === id);
    return slot ?? null;
  },

  async listBySchedule(scheduleId: string) {
    store.ensureSeeded();
    return store.slots.filter(s => s.scheduleId === scheduleId).map(slotWithDetails);
  },

  async listBySectionAndMonth(sectionId: string, year: number, month: number) {
    store.ensureSeeded();
    const schedule = store.schedules.find(
      s => s.sectionId === sectionId && s.year === year && s.month === month
    );
    if (!schedule) return [];
    return store.slots.filter(s => s.scheduleId === schedule.id).map(slotWithDetails);
  },

  async signUp(slotId: string, childId: string, parentId: string, menuItemId: string) {
    store.ensureSeeded();
    const slot = store.slots.find(s => s.id === slotId);
    if (!slot) return { success: false, error: 'Slot not found' };
    if (slot.status !== 'open') return { success: false, error: 'That date is already taken' };
    slot.childId = childId;
    slot.parentId = parentId;
    slot.menuItemId = menuItemId;
    slot.status = 'filled';
    slot.signedUpAt = new Date().toISOString();
    return { success: true, data: undefined };
  },

  async cancel(slotId: string, parentId: string) {
    store.ensureSeeded();
    const slot = store.slots.find(s => s.id === slotId);
    if (!slot) return { success: false, error: 'Slot not found' };
    if (slot.parentId !== parentId) return { success: false, error: 'Not your slot' };
    // Check 3-day cutoff
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const slotDate = new Date(slot.date + 'T00:00:00');
    const daysUntil = Math.round((slotDate.getTime() - today.getTime()) / 86400000);
    if (daysUntil < 3) {
      return { success: false, error: 'Too close to the date — edits close 3 days before' };
    }
    slot.childId = null;
    slot.parentId = null;
    slot.menuItemId = null;
    slot.status = 'open';
    slot.signedUpAt = null;
    return { success: true, data: undefined };
  },

  async swapSlots(fromSlotId: string, toSlotId: string) {
    store.ensureSeeded();
    const a = store.slots.find(s => s.id === fromSlotId);
    const b = store.slots.find(s => s.id === toSlotId);
    if (!a || !b) throw new Error('Slots not found');
    // Swap child/parent/menu assignments
    const aChild = a.childId;
    const aParent = a.parentId;
    const aMenu = a.menuItemId;
    a.childId = b.childId;
    a.parentId = b.parentId;
    a.menuItemId = b.menuItemId;
    b.childId = aChild;
    b.parentId = aParent;
    b.menuItemId = aMenu;
  },
};
