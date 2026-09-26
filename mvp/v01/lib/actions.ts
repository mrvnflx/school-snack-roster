"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in." };

  const { data: slot } = await supabase
    .from("slots")
    .select("date, status, section_id")
    .eq("id", slotId)
    .single();
  if (!slot) return { error: "Slot not found." };
  if (slot.status !== "open") return { error: "That date is already taken." };

  const { error } = await supabase
    .from("slots")
    .update({
      child_id: childId,
      parent_id: user.id,
      menu_item_id: menuItemId,
      status: "filled",
      signed_up_at: new Date().toISOString(),
    })
    .eq("id", slotId)
    .eq("status", "open"); // guards against race conditions

  if (error) return { error: error.message };
  revalidatePath(`/section/${slot.section_id}`);
  return { success: true };
}

export async function cancelSignUp(slotId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in." };

  const { data: slot } = await supabase
    .from("slots")
    .select("date, parent_id, section_id")
    .eq("id", slotId)
    .single();
  if (!slot) return { error: "Slot not found." };
  if (slot.parent_id !== user.id) return { error: "Not your slot." };
  if (daysUntil(slot.date) < EDIT_CUTOFF_DAYS)
    return { error: `Too close to the date — edits close ${EDIT_CUTOFF_DAYS} days before.` };

  const { error } = await supabase
    .from("slots")
    .update({ child_id: null, parent_id: null, menu_item_id: null, status: "open", signed_up_at: null })
    .eq("id", slotId);

  if (error) return { error: error.message };
  revalidatePath(`/section/${slot.section_id}`);
  return { success: true };
}

export async function requestSwap(fromSlotId: string, toSlotId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in." };

  const { data: slots } = await supabase
    .from("slots")
    .select("id, date, parent_id, section_id")
    .in("id", [fromSlotId, toSlotId]);

  const fromSlot = slots?.find((s) => s.id === fromSlotId);
  const toSlot = slots?.find((s) => s.id === toSlotId);
  if (!fromSlot || !toSlot) return { error: "Slot not found." };
  if (fromSlot.parent_id !== user.id) return { error: "Not your slot." };
  if (!toSlot.parent_id) return { error: "Target slot is unfilled." };
  if (daysUntil(toSlot.date) < EDIT_CUTOFF_DAYS)
    return { error: `Too close to the date — swaps close ${EDIT_CUTOFF_DAYS} days before.` };

  const { error } = await supabase.from("swap_requests").insert({
    from_slot_id: fromSlotId,
    to_slot_id: toSlotId,
    requester_parent_id: user.id,
    target_parent_id: toSlot.parent_id,
  });
  if (error) return { error: error.message };

  await supabase.from("notifications_log").insert({
    parent_id: toSlot.parent_id,
    section_id: toSlot.section_id,
    type: "swap_requested",
    payload: { from_slot_id: fromSlotId, to_slot_id: toSlotId },
  });

  revalidatePath(`/section/${fromSlot.section_id}`);
  return { success: true };
}

export async function respondToSwap(
  swapId: string,
  accept: boolean
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in." };

  const { data: swap } = await supabase
    .from("swap_requests")
    .select("*")
    .eq("id", swapId)
    .single();
  if (!swap) return { error: "Swap not found." };
  if (swap.target_parent_id !== user.id) return { error: "Not your swap request." };
  if (swap.status !== "pending") return { error: "Already resolved." };

  if (accept) {
    // Swap the child/parent/menu assignments between the two slots.
    const { data: slots } = await supabase
      .from("slots")
      .select("*")
      .in("id", [swap.from_slot_id, swap.to_slot_id]);
    const a = slots?.find((s) => s.id === swap.from_slot_id);
    const b = slots?.find((s) => s.id === swap.to_slot_id);
    if (!a || !b) return { error: "Slots missing." };

    await supabase
      .from("slots")
      .update({ child_id: b.child_id, parent_id: b.parent_id, menu_item_id: b.menu_item_id })
      .eq("id", a.id);
    await supabase
      .from("slots")
      .update({ child_id: a.child_id, parent_id: a.parent_id, menu_item_id: a.menu_item_id })
      .eq("id", b.id);
  }

  await supabase
    .from("swap_requests")
    .update({ status: accept ? "accepted" : "declined", resolved_at: new Date().toISOString() })
    .eq("id", swapId);

  await supabase.from("notifications_log").insert({
    parent_id: swap.requester_parent_id,
    type: accept ? "swap_accepted" : "swap_declined",
    payload: { swap_id: swapId },
  });

  revalidatePath("/");
  return { success: true };
}
