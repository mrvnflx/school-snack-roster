import type { SwapsRepo } from './contracts';
import { store } from './in-memory-store';
import type { DbResult } from './types';

function swapSlotData(a: typeof store.slots[0], b: typeof store.slots[0]) {
  const tmpChild = a.childId;
  const tmpParent = a.parentId;
  const tmpMenu = a.menuItemId;
  const tmpSignedUp = a.signedUpAt;
  // Write b's data into a
  Object.assign(a, {
    childId: b.childId,
    parentId: b.parentId,
    menuItemId: b.menuItemId,
    signedUpAt: b.signedUpAt,
  });
  // Write a's original data into b
  Object.assign(b, {
    childId: tmpChild,
    parentId: tmpParent,
    menuItemId: tmpMenu,
    signedUpAt: tmpSignedUp,
  });
}

export const inMemorySwaps: SwapsRepo = {
  async create(
    fromSlotId: string,
    toSlotId: string,
    requesterParentId: string,
    targetParentId: string
  ) {
    store.ensureSeeded();
    store.swapRequests.push({
      id: String(Date.now()),
      fromSlotId,
      toSlotId,
      requesterParentId,
      targetParentId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    });
    // Log notification
    store.notifications.push({
      id: String(Date.now()),
      parentId: targetParentId,
      sectionId: null,
      type: 'swap_requested',
      payload: { fromSlotId, toSlotId },
      sent: false,
      createdAt: new Date().toISOString(),
    });
    return { success: true, data: undefined };
  },

  async getById(id: string) {
    store.ensureSeeded();
    return store.swapRequests.find(s => s.id === id) ?? null;
  },

  async resolve(id: string, accept: boolean, userId: string) {
    store.ensureSeeded();
    const swap = store.swapRequests.find(s => s.id === id);
    if (!swap) return { success: false, error: 'Swap not found' };
    if (swap.targetParentId !== userId) return { success: false, error: 'Not your swap request' };
    if (swap.status !== 'pending') return { success: false, error: 'Already resolved' };

    if (accept) {
      const fromSlot = store.slots.find(s => s.id === swap.fromSlotId);
      const toSlot = store.slots.find(s => s.id === swap.toSlotId);
      if (fromSlot && toSlot) swapSlotData(fromSlot, toSlot);
    }
    swap.status = accept ? 'accepted' : 'declined';
    swap.resolvedAt = new Date().toISOString();

    store.notifications.push({
      id: String(Date.now()),
      parentId: swap.requesterParentId,
      sectionId: null,
      type: accept ? 'swap_accepted' : 'swap_declined',
      payload: { swapId: id },
      sent: false,
      createdAt: new Date().toISOString(),
    });

    return { success: true, data: undefined };
  },
};
