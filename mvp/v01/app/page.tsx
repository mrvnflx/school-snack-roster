import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const { data: sections } = await supabase
    .from("sections")
    .select("id, name")
    .eq("archived", false)
    .order("name");

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
        {profile?.full_name || user.phone} — pick a section to view its
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
