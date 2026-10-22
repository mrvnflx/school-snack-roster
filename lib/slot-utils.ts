/** Shared types for the SlotRow component.
 * This module contains only type definitions — no runtime code,
 * no "use client" directive. Safe for both server and client modules
 * to import from.
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
