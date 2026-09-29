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
        <Link href="/admin/roster" className="sr-tab" style={{ textDecoration: "none" }}>Roster</Link>
        <Link href="/admin/menus" className="sr-tab active" style={{ textDecoration: "none" }}>Menu</Link>
        <Link href="/admin" className="sr-tab" style={{ textDecoration: "none" }}>Defaulters</Link>
      </div>

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
    </>
  );
}
