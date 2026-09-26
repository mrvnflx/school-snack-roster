import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import MenuForms from "./menu-forms";

export default async function MenusPage() {
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

  const { data: menus } = await supabase
    .from("menus")
    .select("id, section_id, name, menu_items(id, name, position)");

  const globalMenu = (menus ?? []).find((m) => m.section_id === null) ?? null;
  const sectionMenus = (menus ?? []).filter((m) => m.section_id !== null);

  const normalize = (m: any) =>
    m
      ? { ...m, menu_items: (m.menu_items ?? []).sort((a: any, b: any) => a.position - b.position) }
      : null;

  return (
    <main className="mx-auto max-w-sm px-4 py-6">
      <Link href="/admin" className="text-sm text-gray-500">
        ← Admin
      </Link>
      <h1 className="text-2xl font-bold mt-1 mb-4">Menus</h1>
      <MenuForms
        sections={sections ?? []}
        globalMenu={normalize(globalMenu)}
        sectionMenus={sectionMenus.map(normalize)}
      />
    </main>
  );
}
