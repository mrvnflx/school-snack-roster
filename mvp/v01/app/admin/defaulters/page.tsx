import { requireAdmin, getCurrentYearMonth, computeDefaulters } from "@/lib/admin-helpers";
import AdminLayout from "../admin-layout";

export default async function DeferersPage() {
  const { db } = await requireAdmin();
  const { year, month } = getCurrentYearMonth();

  const sections = await db.sections.list();

  // All slots across sections for this month
  const allSlots = await Promise.all(
    sections.map((s) => db.slots.listBySectionAndMonth(s.id, year, month))
  );
  const flatSlots = allSlots.flat();

  // Defaulter list
  const defaulters = await computeDefaulters(db, sections, flatSlots);

  return (
    <AdminLayout activeHref="/admin/defaulters">
      <div className="sr-card">
        <div className="sr-section-title">Not yet signed up this month</div>

        {defaulters.length === 0 && (
          <div className="sr-empty">No defaulters this month — everyone is signed up.</div>
        )}

        {Object.entries(
          defaulters.reduce(
            (groups: Record<string, string[]>, d) => {
              (groups[d.section] = groups[d.section] || []).push(d.parent);
              return groups;
            },
            {}
          )
        ).map(([section, parents]) => (
          <div className="sr-card" key={section}>
            <div className="sr-section-title">{section}</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {parents.map((p, i) => (
                <li key={i} className="sr-defaulter">
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="sr-banner" style={{ marginTop: 10 }}>
          Reminders: daily from 5 days before month start, continuing 3 days
          into the month. After that, parents land here for manual follow-up.
        </div>
      </div>
    </AdminLayout>
  );
}
