"use client";

import { useState, useTransition } from "react";
import { signUpForSlot, cancelSignUp, requestSwap } from "@/lib/actions";
import type { Child, SlotRowSlot } from "@/lib/slot-utils";
import { RosterSlot } from "@/components/design-system";

type MenuItem = { id: string; name: string };

export { type Child, type SlotRowSlot } from "@/lib/slot-utils";

export default function SlotRow({
  slot,
  myChildren,
  menuItems,
  currentUserId,
  allSlots,
  isMySection,
}: {
  slot: SlotRowSlot;
  myChildren: Child[];
  menuItems: MenuItem[];
  currentUserId: string;
  allSlots: SlotRowSlot[];
  isMySection: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [childId, setChildId] = useState(myChildren[0]?.id ?? "");
  const [menuItemId, setMenuItemId] = useState(menuItems[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isMine = slot.parent_id === currentUserId;

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
    const mySlots = allSlots.filter((s) => s.parent_id === currentUserId);
    if (!mySlots[0]) return setError("You don't have a slot to offer for swap.");
    setError(null);
    startTransition(async () => {
      const res = await requestSwap(mySlots[0].id, slot.id);
      if (res?.error) setError(res.error);
      else setOpen(false);
    });
  }

  const actions = (
    <>
      {isMine && slot.status === "filled" && (
        <button
          onClick={submitCancel}
          disabled={pending}
          className="sr-btn sr-btn-secondary sr-btn-sm"
        >
          {pending ? "Saving…" : "Cancel"}
        </button>
      )}
      {!isMine && slot.status === "open" && isMySection && myChildren.length > 0 && (
        <button
          onClick={() => setOpen(!open)}
          className="sr-btn sr-btn-primary sr-btn-sm"
        >
          {open ? "Close" : "Sign up"}
        </button>
      )}
      {!isMine && slot.status === "filled" && isMySection && (
        <button
          onClick={() => setOpen(!open)}
          className="sr-btn sr-btn-secondary sr-btn-sm"
        >
          {open ? "Close" : "Request swap"}
        </button>
      )}
      {!isMySection && slot.status === "filled" && (
        <span className="sr-chip sr-chip-filled">Filled</span>
      )}
      {!isMySection && slot.status === "open" && (
        <span className="sr-chip sr-chip-open">Open</span>
      )}
    </>
  );

  return (
    <RosterSlot
      date={slot.date}
      status={slot.status === "filled" ? "filled" : "open"}
      childName={slot.children?.name}
      menuItem={slot.menu_items?.name}
      isMine={isMine}
      actions={actions}
    >
      {open && slot.status === "open" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          <select
            value={childId}
            onChange={(e) => setChildId(e.target.value)}
            className="sr-input"
          >
            {myChildren.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={menuItemId}
            onChange={(e) => setMenuItemId(e.target.value)}
            className="sr-input"
          >
            {menuItems.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <button
            onClick={submitSignup}
            disabled={pending}
            className="sr-btn sr-btn-primary sr-btn-block"
          >
            {pending ? "Saving…" : "Confirm sign-up"}
          </button>
        </div>
      )}

      {open && slot.status === "filled" && !isMine && isMySection && (
        <div className="sr-row">
          <button
            onClick={submitSwap}
            disabled={pending}
            className="sr-btn sr-btn-primary sr-btn-block"
          >
            {pending ? "Sending…" : "Send swap request"}
          </button>
        </div>
      )}

      {error && <p className="sr-muted" style={{ marginTop: 6 }}>{error}</p>}
    </RosterSlot>
  );
}
