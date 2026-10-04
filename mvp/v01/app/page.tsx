import Link from "next/link";
import { requireUser, getCurrentYearMonth } from "@/lib/admin-helpers";
import { mapToSlotRowSlot, type Child } from "@/lib/slot-utils";
import type { SlotWithDetails } from "@/lib/db/types";
import ParentView from "@/app/parent-view";

export default async function Home() {
  const { db, user, profile } = await requireUser();
  const { year, month } = getCurrentYearMonth();

  const sections = await db.sections.list(false);

  // Pre-fetch data for every section so the client can switch tabs without round-trips
  const sectionData = await Promise.all(
    sections.map(async (section) => {
      const schedule = await db.schedules.getBySectionYearMonth(
        section.id,
        year,
        month
      );
      const slots: SlotWithDetails[] = schedule
        ? await db.slots.listBySchedule(schedule.id)
        : [];

      const activeMenu = await db.menus.getActiveMenuForSection(section.id);
      const menuItems = (activeMenu?.items ?? []).map((item) => ({
        id: item.id,
        name: item.name,
      }));

      const allChildren = await db.children.listWithSection();
      const myChildrenInSection: Child[] = allChildren
        .filter((c) => c.child.sectionId === section.id && c.parentId === user!.id)
        .map((c) => ({ id: c.child.id, name: c.child.name }));

      const hasSignedUp = slots.some((s) => s.parentId === user!.id);
      const isMySection = myChildrenInSection.length > 0;

      return {
        id: section.id,
        name: section.name,
        slots: slots.map(mapToSlotRowSlot),
        menuItems,
        myChildren: myChildrenInSection,
        hasSignedUp,
        isMySection,
      };
    })
  );

  return (
    <>
      <div className="sr-top">
        <div className="sr-brand">
          <span className="sr-brand-dot" />
          <h1>Snack Roster</h1>
        </div>
        {profile?.role === "admin" && (
          <Link href="/admin" className="sr-btn-ghost">
            Admin
          </Link>
        )}
      </div>

      <p className="sr-muted" style={{ marginBottom: 14 }}>
        {profile?.fullName || user!.phone} — pick a section to view its calendar.
      </p>

      <ParentView
        sections={sectionData}
        currentUserId={user!.id}
        year={year}
        month={month}
      />
    </>
  );
}
