import { redirect } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
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
    <main className="mx-auto max-w-sm px-4 py-6">
      <Link href="/admin" className="text-sm text-gray-500">
        ← Admin
      </Link>
      <h1 className="text-2xl font-bold mt-1 mb-4">Setup</h1>
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
    </main>
  );
}
