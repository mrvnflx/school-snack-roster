import { redirect } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
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
        <Link href="/admin" className="sr-btn-ghost">Admin</Link>
      </div>

      <div className="sr-tabs" style={{ marginBottom: 0 }}>
        <Link href="/admin" className="sr-tab" style={{ textDecoration: "none" }}>Overview</Link>
        <Link href="/admin/roster" className="sr-tab active" style={{ textDecoration: "none" }}>Roster</Link>
        <Link href="/admin/menus" className="sr-tab" style={{ textDecoration: "none" }}>Menu</Link>
        <Link href="/admin" className="sr-tab" style={{ textDecoration: "none" }}>Defaulters</Link>
      </div>

      <RosterForms sections={sections} children={children} />
    </>
  );
}
