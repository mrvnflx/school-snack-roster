import { redirect } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import AdminTabs from "../admin-tabs";
import SetupForms from "./setup-forms";

export default async function SetupPage() {
  const db = getDb();
  const user = await db.auth.getUser();
  if (!user) redirect("/login");

  const profile = await db.profiles.getById(user.id);
  if (profile?.role !== "admin") redirect("/");

  const sections = await db.sections.list();
  const holidays = await db.holidays.list();
  const blackouts = await db.blackouts.list();

  return (
    <>
      <div className="sr-top">
        <div className="sr-brand">
          <span className="sr-brand-dot" />
          <h1>Snack Roster</h1>
        </div>
        <Link href="/" className="sr-btn-ghost">Parent</Link>
      </div>

      <AdminTabs activeHref="/admin/setup" />

      <SetupForms
        sections={sections}
        holidays={holidays}
        blackouts={blackouts.map(b => ({
          id: b.id,
          date: b.date,
          reason: b.reason ?? "",
          sectionId: b.sectionId,
        }))}
      />
    </>
  );
}
