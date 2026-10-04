import { redirect } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import type { SlotWithDetails, ChildWithSection } from "@/lib/db/types";
import GenerateButton from "./generate-button";

export default async function AdminDashboard() {
  const db = getDb();
  const user = await db.auth.getUser();
  if (!user) redirect("/login");

  const profile = await db.profiles.getById(user.id);
  if (profile?.role !== "admin") redirect("/");

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const sections = await db.sections.list();

  // Per-section stats
  const sectionStats = await Promise.all(
    sections.map(async (section) => {
      const schedule = await db.schedules.getBySectionYearMonth(section.id, year, month);
      if (!schedule) {
        return { id: section.id, name: section.name, total: 0, filled: 0, generated: false };
      }
      const slots = await db.slots.listBySchedule(schedule.id);
      const total = slots.length;
      const filled = slots.filter((s) => s.status === "filled").length;
      return { id: section.id, name: section.name, total, filled, generated: true };
    })
  );

  // All slots across sections for this month
  const allSlots = await Promise.all(
    sections.map((s) => db.slots.listBySectionAndMonth(s.id, year, month))
  );
  const flatSlots: SlotWithDetails[] = allSlots.flat();

  // Defaulter list — parents with children in a section who have no filled slot this month
  const defaulters = await computeDefaulters(db, sections, flatSlots);

  return (
    <>
      <div className="sr-top">
        <div className="sr-brand">
          <span className="sr-brand-dot" />
          <h1>Snack Roster</h1>
        </div>
        <Link href="/" className="sr-btn-ghost">Parent</Link>
      </div>

      <div className="sr-tabs" role="tablist">
        <Link href="/admin/setup" className="sr-tab" style={{ textDecoration: "none" }}>
          Overview
        </Link>
        <Link href="/admin/roster" className="sr-tab" style={{ textDecoration: "none" }}>
          Roster
        </Link>
        <Link href="/admin/menus" className="sr-tab" style={{ textDecoration: "none" }}>
          Menu
        </Link>
        <button className="sr-tab" style={{ textDecoration: "none" }}>
          Defaulters
        </button>
      </div>

      <div className="sr-card">
        <div className="sr-section-title">Schedule auto-generated for September 2026</div>
        {/* Stats */}
        <div className="sr-stat-row">
          {sectionStats.map((s) => (
            <div className="sr-stat" key={s.id}>
              <div className="sr-stat-num">{s.filled}/{s.total}</div>
              <div className="sr-stat-lbl">{s.name}</div>
            </div>
          ))}
        </div>

        <p className="sr-muted" style={{ fontSize: "12px", marginBottom: 10 }}>
          Weekdays only. No manual drafting needed.
        </p>
      </div>

      {/* Section generation cards */}
      {sectionStats.map((s) => (
        <div className="sr-card" key={s.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div className="sr-section-title" style={{ marginBottom: 0 }}>{s.name}</div>
              <div className="sr-muted" style={{ fontSize: "12px" }}>
                {s.generated ? `${s.filled} of ${s.total} slots filled` : "No schedule yet"}
              </div>
            </div>
            <GenerateButton sectionId={s.id} year={year} month={month} />
          </div>
        </div>
      ))}

      {/* Defaulters */}
      <div className="sr-card">
        <div className="sr-section-title">Not yet signed up this month</div>

        {defaulters.length === 0 && (
          <div className="sr-empty">
            {flatSlots.length === 0 ? "No schedules generated yet." : "Everyone is signed up."}
          </div>
        )}

        {defaulters.map((d, i) => (
          <div className="sr-defaulter" key={i}>
            <span>{d.parent}</span>
            <span className="sr-chip sr-chip-open">{d.section}</span>
          </div>
        ))}

        <div className="sr-banner" style={{ marginTop: 10 }}>
          Reminders: daily from 5 days before month start, continuing 3 days into the month.
          After that, parents land here for manual follow-up.
        </div>
      </div>
    </>
  );
}

async function computeDefaulters(
  db: ReturnType<typeof getDb>,
  sections: { id: string; name: string }[],
  flatSlots: SlotWithDetails[]
): Promise<{ parent: string; section: string }[]> {
  // Build a set of parent+section pairs that have at least one filled slot this month
  const filledBySectionParent = new Set(
    flatSlots
      .filter((slot) => slot.parentId !== null)
      .map((slot) => `${slot.sectionId}:${slot.parentId}`)
  );

  const defaulters: { parent: string; section: string }[] = [];
  const seen = new Set<string>();

  // Get all children-with-section and all profiles
  const childrenWithSection = await db.children.listWithSection();
  const allProfiles = await db.profiles.listAll();

  for (const { child, sectionName, parentId } of childrenWithSection as ChildWithSection[]) {
    if (!sectionName) continue;
    const parent = (parentId ? allProfiles.find((p) => p.id === parentId) : undefined);
    if (!parent || parent.role !== "parent") continue;

    const key = `${child.sectionId}:${parent.id}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (!filledBySectionParent.has(key)) {
      defaulters.push({
        parent: parent.fullName ?? parent.phone ?? parent.id,
        section: sectionName,
      });
    }
  }

  return defaulters;
}
