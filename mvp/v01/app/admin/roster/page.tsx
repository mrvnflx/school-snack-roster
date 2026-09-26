import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import RosterForms from "./roster-forms";

export default async function RosterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/");

  const { data: sections } = await supabase.from("sections").select("id, name").order("name");
  const { data: childrenRaw } = await supabase
    .from("children")
    .select("id, name, section_id, sections(name)")
    .order("name");
  const children = (childrenRaw ?? []).map((c: any) => ({
    ...c,
    sections: Array.isArray(c.sections) ? c.sections[0] ?? null : c.sections,
  }));

  return (
    <main className="mx-auto max-w-sm px-4 py-6">
      <Link href="/admin" className="text-sm text-gray-500">
        ← Admin
      </Link>
      <h1 className="text-2xl font-bold mt-1 mb-4">Roster</h1>
      <RosterForms sections={sections ?? []} children={children ?? []} />
    </main>
  );
}
