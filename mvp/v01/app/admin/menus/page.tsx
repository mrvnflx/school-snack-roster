import { redirect } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import MenuForms from "./menu-forms";

export default async function MenusPage() {
  const db = getDb();
  const user = await db.auth.getUser();
  if (!user) redirect("/login");

  const profile = await db.profiles.getById(user.id);
  if (profile?.role !== "admin") redirect("/");

  const sections = await db.sections.list();
  const allMenus = await db.menus.listAll();

  const globalMenu = allMenus.find((m) => m.menu.sectionId === null) ?? null;
  const sectionMenus = allMenus.filter((m) => m.menu.sectionId !== null);

  return (
    <main className="mx-auto max-w-sm px-4 py-6">
      <Link href="/admin" className="text-sm text-gray-500">
        ← Admin
      </Link>
      <h1 className="text-2xl font-bold mt-1 mb-4">Menus</h1>
      <MenuForms
        sections={sections}
        globalMenu={globalMenu ? {
          id: globalMenu.menu.id,
          sectionId: globalMenu.menu.sectionId,
          name: globalMenu.menu.name,
          items: globalMenu.items,
        } : null}
        sectionMenus={sectionMenus.map((m) => ({
          id: m.menu.id,
          sectionId: m.menu.sectionId!,
          name: m.menu.name,
          items: m.items,
        }))}
      />
    </main>
  );
}
