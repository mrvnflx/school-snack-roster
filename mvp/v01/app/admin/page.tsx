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
    <main className="mx-auto max-w-sm px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Admin</h1>
        <Link href="/" className="text-sm text-gray-500">
          Parent view
        </Link>
      </div>

      <nav className="flex gap-3 text-sm mb-6">
        <Link href="/admin/setup" className="underline text-green-800">
          Sections / Holidays / Menu
        </Link>
        <Link href="/admin/roster" className="underline text-green-800">
          Roster
        </Link>
        <Link href="/admin/menus" className="underline text-green-800">
          Menus
        </Link>
      </nav>

      <h2 className="font-semibold mb-2">
        This month —{" "}
        {now.toLocaleString("default", { month: "long", year: "numeric" })}
      </h2>
      <ul className="space-y-2 mb-6">
        {sectionStats.map((s) => (
          <li key={s.id} className="border rounded-lg px-3 py-2 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{s.name}</p>
              <p className="text-xs text-gray-500">
                {s.generated ? `${s.filled} / ${s.total} slots filled` : "No schedule yet"}
              </p>
            </div>
            <GenerateButton sectionId={s.id} year={year} month={month} />
          </li>
        ))}
      </ul>

      <h2 className="font-semibold mb-2">Defaulters (past grace window)</h2>
      {defaulters.length === 0 && (
        <p className="text-xs text-gray-400">
          {flatSlots.length === 0
            ? "No schedules generated yet."
            : "Everyone is signed up."}
        </p>
      )}
      <ul className="space-y-1">
        {defaulters.map((d, i) => (
          <li key={i} className="text-sm border-b py-1">
            {d.parent} — <span className="text-gray-500">{d.section}</span>
          </li>
        ))}
      </ul>
    </main>
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
