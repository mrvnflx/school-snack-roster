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

  const allChildren = await db.children.listWithSection();
  const myChildrenInSection: ChildOption[] = allChildren
    .filter((c) => c.child.sectionId === sectionId)
    .map((c) => ({ id: c.child.id, name: c.child.name }));

  const hasSignedUp = slots.some((s) => s.parentId === user!.id);

  // Determine if this is the user's section (they have a child enrolled)
  const myChildInThisSection = myChildrenInSection.length > 0;

  return (
    <>
      <Link href="/" className="sr-link-return">
        ← All sections
      </Link>

      <h1 style={{ fontSize: "22px", marginBottom: 2 }}>{section.name}</h1>
      <p className="sr-muted" style={{ marginBottom: 14 }}>
        September 2026
        {!hasSignedUp && myChildInThisSection && (
          <> — you haven&apos;t signed up yet</>
        )}
      </p>

      {!slots.length ? (
        <div className="sr-card">
          <p className="sr-muted">No schedule generated for this month yet.</p>
        </div>
      ) : (
        <div className="sr-card">
          <div className="sr-section-title">{section.name} — September 2026</div>

          {hasSignedUp && myChildInThisSection && (
            <div className="sr-banner ok">
              You&apos;re all set for {section.name} this month ✓
            </div>
          )}
          {!hasSignedUp && myChildInThisSection && (
            <div className="sr-banner">
              You haven&apos;t signed up for {section.name} yet this month — pick an open date below.
            </div>
          )}
          {!myChildInThisSection && (
            <div className="sr-banner">
              Read-only view — your child isn&apos;t in this section.
            </div>
          )}

          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {slotRows.map((slot) => (
              <SlotRow
                key={slot.id}
                slot={slot}
                myChildren={myChildrenInSection}
                menuItems={menuItems}
                currentUserId={user!.id}
                allSlots={slotRows}
                isMySection={myChildInThisSection}
              />
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
