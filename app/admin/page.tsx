import Link from "next/link";
import { requireAdmin, getCurrentYearMonth } from "@/lib/admin-helpers";
import GenerateButton from "./generate-button";
import SectionsForms from "./sections-forms";
import AdminLayout from "./admin-layout";

export default async function AdminDashboard() {
  const { db, user, profile } = await requireAdmin();
  const { year, month } = getCurrentYearMonth();

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

  return (
    <AdminLayout activeHref="/admin">
      <div className="card">
        <div className="section-title">
          Schedule auto-generated for September 2026
        </div>
        {/* Stats */}
        <div className="stat-row">
          {sectionStats.map((s) => (
            <div className="stat" key={s.id}>
              <div className="stat-num">{s.filled}/{s.total}</div>
              <div className="stat-lbl">{s.name}</div>
            </div>
          ))}
        </div>

        <p className="muted" style={{ fontSize: "12px", marginBottom: 10 }}>
          Weekdays only. No manual drafting needed.
        </p>
      </div>

      {/* Section generation cards */}
      {sectionStats.map((s) => (
        <div className="card" key={s.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div className="section-title" style={{ marginBottom: 0 }}>{s.name}</div>
              <div className="muted" style={{ fontSize: "12px" }}>
                {s.generated ? `${s.filled} of ${s.total} slots filled` : "No schedule yet"}
              </div>
            </div>
            <GenerateButton sectionId={s.id} year={year} month={month} />
          </div>
        </div>
      ))}

      {/* Sections management (moved to bottom — infrequent action) */}
      <SectionsForms sections={sections} />

      {/* Quick link to full defaulters list */}
      <div className="banner" style={{ marginTop: 10 }}>
        <Link href="/admin/defaulters" className="link">
          View full defaulters list
        </Link>
      </div>
    </AdminLayout>
  );
}
