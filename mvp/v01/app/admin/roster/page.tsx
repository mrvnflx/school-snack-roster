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
    <main className="mx-auto max-w-sm px-4 py-6">
      <Link href="/admin" className="text-sm text-gray-500">
        ← Admin
      </Link>
      <h1 className="text-2xl font-bold mt-1 mb-4">Roster</h1>
      <RosterForms sections={sections} children={children} />
    </main>
  );
}
