import { redirect } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";

export default async function Home() {
  const db = getDb();
  const user = await db.auth.getUser();
  if (!user) redirect("/login");

  const profile = await db.profiles.getById(user.id);
  const sections = await db.sections.list(false);

  return (
    <main className="mx-auto max-w-sm px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Snack Roster</h1>
        {profile?.role === "admin" && (
          <Link href="/admin" className="text-sm underline text-green-800">
            Admin
          </Link>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {profile?.fullName || user.phone} — pick a section to view its
        calendar.
      </p>

      <ul className="space-y-2">
        {sections?.map((s) => (
          <li key={s.id}>
            <Link
              href={`/section/${s.id}`}
              className="block border rounded-lg px-4 py-3 hover:bg-gray-50"
            >
              {s.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
