import { requireAdmin } from "@/lib/admin-helpers";
import AdminLayout from "../admin-layout";
import SetupForms from "./setup-forms";

export default async function SetupPage() {
  const { db } = await requireAdmin();

  const sections = await db.sections.list();
  const holidays = await db.holidays.list();
  const blackouts = await db.blackouts.list();

  return (
    <AdminLayout activeHref="/admin/setup">
      <SetupForms
        sections={sections}
        holidays={holidays}
        blackouts={blackouts.map((b) => ({
          id: b.id,
          date: b.date,
          reason: b.reason ?? "",
          sectionId: b.sectionId,
        }))}
      />
    </AdminLayout>
  );
}
