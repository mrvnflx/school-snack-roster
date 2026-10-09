import { requireAdmin } from "@/lib/admin-helpers";
import AdminLayout from "../admin-layout";
import RosterForms from "./roster-forms";

export default async function RosterPage() {
  const { db } = await requireAdmin();

  const sections = await db.sections.list();
  const childrenWithSection = await db.children.listWithSection();

  const children = childrenWithSection.map((c) => ({
    id: c.child.id,
    name: c.child.name,
    sectionId: c.child.sectionId,
    sectionName: c.sectionName,
  }));

  return (
    <AdminLayout activeHref="/admin/roster">
      <RosterForms sections={sections} children={children} />
    </AdminLayout>
  );
}
