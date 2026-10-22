"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";

const EDIT_CUTOFF_DAYS = 3;

function daysUntil(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export async function signUpForSlot(
  slotId: string,
  childId: string,
  menuItemId: string
) {
  const db = getDb();
  const user = await db.auth.getUser();
  if (!user) return { error: "Not logged in." };

  const slot = await db.slots.getById(slotId);
  if (!slot) return { error: "Slot not found." };
  if (slot.status !== "open") return { error: "That date is already taken." };

  const result = await db.slots.signUp(slotId, childId, user.id, menuItemId);
  if (!result.success) return { error: result.error };

  revalidatePath(`/section/${slot.sectionId}`);
  return { success: true };
}

export async function cancelSignUp(slotId: string) {
  const db = getDb();
  const user = await db.auth.getUser();
  if (!user) return { error: "Not logged in." };

  const slot = await db.slots.getById(slotId);
  if (!slot) return { error: "Slot not found." };
  if (slot.parentId !== user.id) return { error: "Not your slot." };
  if (daysUntil(slot.date) < EDIT_CUTOFF_DAYS)
    return { error: `Too close to the date — edits close ${EDIT_CUTOFF_DAYS} days before.` };

  const result = await db.slots.cancel(slotId, user.id);
  if (!result.success) return { error: result.error };

  revalidatePath(`/section/${slot.sectionId}`);
  return { success: true };
}

export async function requestSwap(fromSlotId: string, toSlotId: string) {
  const db = getDb();
  const user = await db.auth.getUser();
  if (!user) return { error: "Not logged in." };

  const [fromSlot, toSlot] = await Promise.all([
    db.slots.getById(fromSlotId),
    db.slots.getById(toSlotId),
  ]);
  if (!fromSlot || !toSlot) return { error: "Slot not found." };
  if (fromSlot.parentId !== user.id) return { error: "Not your slot." };
  if (!toSlot.parentId) return { error: "Target slot is unfilled." };
  if (daysUntil(toSlot.date) < EDIT_CUTOFF_DAYS)
    return { error: `Too close to the date — swaps close ${EDIT_CUTOFF_DAYS} days before.` };

  const swapResult = await db.swaps.create(fromSlotId, toSlotId, user.id, toSlot.parentId!);
  if (!swapResult.success) return { error: swapResult.error };

  await db.notifications.log(toSlot.parentId!, toSlot.sectionId, "swap_requested", {
    from_slot_id: fromSlotId,
    to_slot_id: toSlotId,
  });

  revalidatePath(`/section/${fromSlot.sectionId}`);
  return { success: true };
}

export async function respondToSwap(swapId: string, accept: boolean) {
  const db = getDb();
  const user = await db.auth.getUser();
  if (!user) return { error: "Not logged in." };

  const swap = await db.swaps.getById(swapId);
  if (!swap) return { error: "Swap not found." };
  if (swap.targetParentId !== user.id) return { error: "Not your swap request." };
  if (swap.status !== "pending") return { error: "Already resolved." };

  if (accept) {
    await db.slots.swapSlots(swap.fromSlotId, swap.toSlotId);
  }

  const result = await db.swaps.resolve(swapId, accept, user.id);
  if (!result.success) return { error: result.error };

  await db.notifications.log(swap.requesterParentId, null, accept ? "swap_accepted" : "swap_declined", {
    swap_id: swapId,
  });

  revalidatePath("/");
  return { success: true };
}
