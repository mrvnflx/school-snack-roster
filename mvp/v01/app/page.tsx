import { redirect } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import ParentView from "@/app/parent-view";
import type { SlotWithDetails } from "@/lib/db/types";

export default async function Home() {
  const db = getDb();
  const user = await db.auth.getUser();
  if (!user) redirect("/login");

  const profile = await db.profiles.getById(user.id);
  const sections = await db.sections.list(false);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

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
      const myChildrenInSection = allChildren
        .filter((c) => c.child.sectionId === section.id && c.parentId === user.id)
        .map((c) => ({ id: c.child.id, name: c.child.name }));

      const hasSignedUp = slots.some((s) => s.parentId === user.id);
      const isMySection = myChildrenInSection.length > 0;

      return {
        id: section.id,
        name: section.name,
        slots: slots.map((slot) => ({
          id: slot.id,
          date: slot.date,
          status: slot.status,
          child_id: slot.childId,
          parent_id: slot.parentId,
          children: slot.childName ? { name: slot.childName } : null,
          menu_items: slot.menuItemName ? { name: slot.menuItemName } : null,
        })),
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
        {profile?.fullName || user.phone} — pick a section to view its calendar.
      </p>

      <ParentView
        sections={sectionData}
        currentUserId={user.id}
        year={year}
        month={month}
      />
    </>
  );
}
