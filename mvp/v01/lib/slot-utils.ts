import type { SlotWithDetails } from "@/lib/db/types";

/** Shared types and mappers for the SlotRow component.
 * Lives outside "use client" modules so server components can import
 * without pulling in client bundle.
 */

export type Child = { id: string; name: string };

export type SlotRowSlot = {
  id: string;
  date: string;
  status: "open" | "filled" | "skipped";
  child_id: string | null;
  parent_id: string | null;
  children: { name: string } | null;
  menu_items: { name: string } | null;
};

export function mapToSlotRowSlot(slot: SlotWithDetails): SlotRowSlot {
  return {
    id: slot.id,
    date: slot.date,
    status: slot.status,
    child_id: slot.childId,
    parent_id: slot.parentId,
    children: slot.childName ? { name: slot.childName } : null,
    menu_items: slot.menuItemName ? { name: slot.menuItemName } : null,
  };
}
