import Link from "next/link";
import { requireUser, getCurrentYearMonth, mapToSlotRowSlot, computeDefaulters, DefaultersSlot } from "@/lib/admin-helpers";
import type { Child } from "@/lib/slot-utils";
import type { SlotWithDetails } from "@/lib/db/types";
import ParentView from "@/app/parent-view";
import { BrandHeader } from "@/components/design-system";

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

  // Flatten slots (with sectionId) so we can compute per-section defaulters.
  const flatSlots: DefaultersSlot[] = sectionData.flatMap((s) =>
    s.slots.map((slot) => ({
      sectionId: s.id,
      parentId: slot.parent_id,
    }))
  );

  // Per-section defaulters (parents in each section who haven't signed up yet).
  const allDefaulters = await computeDefaulters(db, sections, flatSlots);

  const defaultersBySection = new Map<string, { parent: string; section: string }[]>();
  for (const section of sections) {
    defaultersBySection.set(section.id, allDefaulters.filter((d) => d.section === section.name));
  }

  const sectionDataWithDefaulters = sectionData.map((s) => ({
    ...s,
    defaulters: defaultersBySection.get(s.id) ?? [],
  }));

  return (
    <>
      <BrandHeader
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {profile?.role === "admin" && (
              <Link href="/admin" className="sr-btn-ghost">
                Admin
              </Link>
            )}
            <Link href="/proto" className="sr-btn-ghost">
              Proto
            </Link>
          </div>
        }
      />

      <p className="sr-muted" style={{ marginBottom: 14 }}>
        {profile?.fullName || user!.phone} — pick a section to view its calendar.
      </p>

      <ParentView
        sections={sectionDataWithDefaulters}
        currentUserId={user!.id}
        year={year}
        month={month}
      />
    </>
  );
}
