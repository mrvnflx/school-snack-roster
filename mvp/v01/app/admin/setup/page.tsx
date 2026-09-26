import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SetupForms from "./setup-forms";

export default async function SetupPage() {
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

  const { data: sections } = await supabase
    .from("sections")
    .select("id, name")
    .order("name");
  const { data: holidays } = await supabase
    .from("holidays")
    .select("id, date, name")
    .order("date");
  const { data: blackouts } = await supabase
    .from("blackout_days")
    .select("id, date, reason, section_id")
    .order("date");

  return (
    <main className="mx-auto max-w-sm px-4 py-6">
      <Link href="/admin" className="text-sm text-gray-500">
        ← Admin
      </Link>
      <h1 className="text-2xl font-bold mt-1 mb-4">Setup</h1>
      <SetupForms
        sections={sections ?? []}
        holidays={holidays ?? []}
        blackouts={blackouts ?? []}
      />
    </main>
  );
}
