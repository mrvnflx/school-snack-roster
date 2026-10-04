import { requireAdmin } from "@/lib/admin-helpers";
import AdminLayout from "../admin-layout";
import MenuForms from "./menu-forms";

export default async function MenusPage() {
  const { db } = await requireAdmin();

  const sections = await db.sections.list();
  const allMenus = await db.menus.listAll();

  const globalMenu = allMenus.find((m) => m.menu.sectionId === null) ?? null;
  const sectionMenus = allMenus.filter((m) => m.menu.sectionId !== null);

  return (
    <AdminLayout activeHref="/admin/menus">
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
    </AdminLayout>
  );
}
