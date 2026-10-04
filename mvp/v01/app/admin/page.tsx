import { redirect } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import GenerateButton from "./generate-button";
import SectionsForms from "./sections-forms";
import AdminTabs from "./admin-tabs";

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

  return (
    <>
      <div className="sr-top">
        <div className="sr-brand">
          <span className="sr-brand-dot" />
          <h1>Snack Roster</h1>
        </div>
        <Link href="/" className="sr-btn-ghost">
          Parent
        </Link>
      </div>

      <AdminTabs activeHref="/admin" />

      <div className="sr-card">
        <div className="sr-section-title">
          Schedule auto-generated for September 2026
        </div>
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

      {/* Sections management */}
      <SectionsForms sections={sections} />

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

      {/* Quick link to full defaulters list */}
      <div className="sr-banner" style={{ marginTop: 10 }}>
        <Link href="/admin/defaulters" className="sr-link">
          View full defaulters list
        </Link>
      </div>
    </>
  );
}
