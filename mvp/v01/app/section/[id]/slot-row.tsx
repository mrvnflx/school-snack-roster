"use client";

import { useState, useTransition } from "react";
import { signUpForSlot, cancelSignUp, requestSwap } from "@/lib/actions";

type Child = { id: string; name: string };
type MenuItem = { id: string; name: string };
type Slot = {
  id: string;
  date: string;
  status: "open" | "filled" | "skipped";
  child_id: string | null;
  parent_id: string | null;
  children: { name: string } | null;
  menu_items: { name: string } | null;
};

export default function SlotRow({
  slot,
  myChildren,
  menuItems,
  currentUserId,
  allSlots,
}: {
  slot: Slot;
  myChildren: Child[];
  menuItems: MenuItem[];
  currentUserId: string;
  allSlots: Slot[];
}) {
  const [open, setOpen] = useState(false);
  const [childId, setChildId] = useState(myChildren[0]?.id ?? "");
  const [menuItemId, setMenuItemId] = useState(menuItems[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const dateLabel = new Date(slot.date + "T00:00:00").toLocaleDateString(
    "default",
    { weekday: "short", month: "short", day: "numeric" }
  );
  const isMine = slot.parent_id === currentUserId;
  const mySlots = allSlots.filter((s) => s.parent_id === currentUserId);

  function submitSignup() {
    setError(null);
    startTransition(async () => {
      const res = await signUpForSlot(slot.id, childId, menuItemId);
      if (res?.error) setError(res.error);
      else setOpen(false);
    });
  }

  function submitCancel() {
    setError(null);
    startTransition(async () => {
      const res = await cancelSignUp(slot.id);
      if (res?.error) setError(res.error);
    });
  }

  function submitSwap() {
    if (!mySlots[0]) return setError("You don't have a slot to offer for swap.");
    setError(null);
    startTransition(async () => {
      const res = await requestSwap(mySlots[0].id, slot.id);
      if (res?.error) setError(res.error);
      else setOpen(false);
    });
  }

  return (
    <li className="border rounded-lg px-3 py-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">{dateLabel}</p>
          {slot.status === "filled" ? (
            <p className="text-xs text-gray-500">
              {slot.children?.name} — {slot.menu_items?.name}
              {isMine && <span className="text-green-700"> (you)</span>}
            </p>
          ) : (
            <p className="text-xs text-gray-400">Open</p>
          )}
        </div>

        {isMine && (
          <button
            onClick={submitCancel}
            disabled={pending}
            className="text-xs text-red-600 underline"
          >
            Cancel
          </button>
        )}
        {!isMine && slot.status === "open" && myChildren.length > 0 && (
          <button
            onClick={() => setOpen(!open)}
            className="text-xs text-green-800 underline"
          >
            {open ? "Close" : "Sign up"}
          </button>
        )}
        {!isMine && slot.status === "filled" && (
          <button
            onClick={() => setOpen(!open)}
            className="text-xs text-blue-700 underline"
          >
            {open ? "Close" : "Request swap"}
          </button>
        )}
      </div>

      {open && slot.status === "open" && (
        <div className="mt-2 space-y-2">
          <select
            value={childId}
            onChange={(e) => setChildId(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm"
          >
            {myChildren.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={menuItemId}
            onChange={(e) => setMenuItemId(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm"
          >
            {menuItems.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <button
            onClick={submitSignup}
            disabled={pending}
            className="w-full bg-green-800 text-white rounded py-1.5 text-sm"
          >
            {pending ? "Saving…" : "Confirm sign-up"}
          </button>
        </div>
      )}

      {open && slot.status === "filled" && !isMine && (
        <div className="mt-2">
          <button
            onClick={submitSwap}
            disabled={pending}
            className="w-full bg-blue-700 text-white rounded py-1.5 text-sm"
          >
            {pending ? "Sending…" : "Send swap request"}
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </li>
  );
}
