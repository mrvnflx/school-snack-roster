import { redirect } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import AdminTabs from "../admin-tabs";
import RosterForms from "./roster-forms";

export default async function RosterPage() {
  const db = getDb();
  const user = await db.auth.getUser();
  if (!user) redirect("/login");

  const profile = await db.profiles.getById(user.id);
  if (profile?.role !== "admin") redirect("/");

  const sections = await db.sections.list();
  const childrenWithSection = await db.children.listWithSection();

  const children = childrenWithSection.map((c) => ({
    id: c.child.id,
    name: c.child.name,
    sectionId: c.child.sectionId,
    sectionName: c.sectionName,
  }));

  return (
    <>
      <div className="sr-top">
        <div className="sr-brand">
          <span className="sr-brand-dot" />
          <h1>Snack Roster</h1>
        </div>
        <Link href="/" className="sr-btn-ghost">Parent</Link>
      </div>

      <AdminTabs activeHref="/admin/roster" />

      <RosterForms sections={sections} children={children} />
    </>
  );
}
