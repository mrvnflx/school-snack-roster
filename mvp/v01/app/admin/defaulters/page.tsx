import { redirect } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import type { SlotWithDetails } from "@/lib/db/types";
import AdminTabs from "../admin-tabs";
import { computeDefaulters } from "@/lib/admin-helpers";

export default async function DeferersPage() {
  const db = getDb();
  const user = await db.auth.getUser();
  if (!user) redirect("/login");

  const profile = await db.profiles.getById(user.id);
  if (profile?.role !== "admin") redirect("/");

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const sections = await db.sections.list();

  // All slots across sections for this month
  const allSlots = await Promise.all(
    sections.map((s) => db.slots.listBySectionAndMonth(s.id, year, month))
  );
  const flatSlots: SlotWithDetails[] = allSlots.flat();

  // Defaulter list
  const defaulters = await computeDefaulters(db, sections, flatSlots);

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

      <AdminTabs activeHref="/admin/defaulters" />

      <div className="sr-card">
        <div className="sr-section-title">Not yet signed up this month</div>

        {defaulters.length === 0 && (
          <div className="sr-empty">
            {flatSlots.length === 0
              ? "No schedules generated yet."
              : "Everyone is signed up."}
          </div>
        )}

        {defaulters.map((d, i) => (
          <div className="sr-defaulter" key={i}>
            <span>{d.parent}</span>
            <span className="sr-chip sr-chip-open">{d.section}</span>
          </div>
        ))}

        <div className="sr-banner" style={{ marginTop: 10 }}>
          Reminders: daily from 5 days before month start, continuing 3 days
          into the month. After that, parents land here for manual follow-up.
        </div>
      </div>
    </>
  );
}
