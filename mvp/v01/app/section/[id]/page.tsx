
import { redirect } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import SlotRow from "./slot-row";

type SlotRowSlot = {
  id: string;
  date: string;
  status: "open" | "filled" | "skipped";
  child_id: string | null;
  parent_id: string | null;
  children: { name: string } | null;
  menu_items: { name: string } | null;
};

type ChildOption = { id: string; name: string };
type MenuOption = { id: string; name: string };

function mapToSlotRowSlot(slot: import("@/lib/db/types").SlotWithDetails): SlotRowSlot {
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

export default async function SectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sectionId } = await params;
  const db = getDb();
  const user = await db.auth.getUser();
  if (!user) redirect("/login");

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const section = await db.sections.getById(sectionId);
  if (!section) redirect("/");

  const slots = await db.slots.listBySectionAndMonth(sectionId, year, month);
  const slotRows: SlotRowSlot[] = slots.map(mapToSlotRowSlot);

  const activeMenu = await db.menus.getActiveMenuForSection(sectionId);
  const menuItems: MenuOption[] = activeMenu?.items.map((item) => ({
    id: item.id,
    name: item.name,
  })) || [];

  // Get children linked to this parent in this section
  const allChildren = await db.children.listWithSection();
  const myChildrenInSection: ChildOption[] = allChildren
    .filter((c) => c.child.sectionId === sectionId)
    .map((c) => ({ id: c.child.id, name: c.child.name }));

  const hasSignedUp = slots.some((s) => s.parentId === user!.id);

  return (
    <main className="mx-auto max-w-sm px-4 py-6">
      <Link href="/" className="text-sm text-gray-500">
        ← All sections
      </Link>
      <h1 className="text-2xl font-bold mt-1 mb-1">{section.name}</h1>
      <p className="text-sm text-gray-500 mb-4">
        {now.toLocaleString("default", { month: "long", year: "numeric" })}
        {!hasSignedUp && (
          <span className="text-amber-700"> — you haven't signed up yet</span>
        )}
      </p>

      {!slots.length && (
        <p className="text-sm text-gray-400">
          No schedule generated for this month yet. Ask admin to generate it.
        </p>
      )}

      <ul className="space-y-2">
        {slotRows.map((slot) => (
          <SlotRow
            key={slot.id}
            slot={slot}
            myChildren={myChildrenInSection}
            menuItems={menuItems}
            currentUserId={user!.id}
            allSlots={slotRows}
          />
        ))}
      </ul>
    </main>
  );
}
