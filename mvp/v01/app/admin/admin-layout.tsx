import type { ReactNode } from "react";
import Link from "next/link";
import AdminTabs from "./admin-tabs";

/** Shared admin layout: top bar + tab bar + content wrapper.
 * Eliminates the duplicated auth guard + top bar across admin sub-pages.
 * Usage: export default async function Page() {
 *   const { db, user, profile } = await requireAdmin();
 *   return <AdminLayout activeHref="/admin" db={db}>...</AdminLayout>;
 *   // or better: <AdminLayout activeHref="/admin">...</AdminLayout>
 * }
 * Note: the auth guard runs in each page before calling this.
 */
export default function AdminLayout({
  activeHref,
  children,
}: {
  activeHref: string;
  children: ReactNode;
}) {
  return (
    <>
      <div className="sr-top">
        <div className="sr-brand">
          <span className="sr-brand-dot" />
          <h1>Snack Roster</h1>
        </div>
        <Link href="/" className="sr-btn-ghost">
          Parent
        </Link>
      </div>
      <AdminTabs activeHref={activeHref} />
      {children}
    </>
  );
}
