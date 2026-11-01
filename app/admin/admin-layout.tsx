import type { ReactNode } from "react";
import Link from "next/link";
import AdminTabs from "./admin-tabs";
import { BrandHeader } from "@/components/design-system";

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
      <BrandHeader
        actions={
          <Link href="/" className="sr-btn-ghost">
            Parent
          </Link>
        }
      />
      <AdminTabs activeHref={activeHref} />
      {children}
    </>
  );
}
