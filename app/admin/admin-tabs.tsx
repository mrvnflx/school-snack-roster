import { Tabs } from "@/components/design-system";

/** Shared admin tab bar:
 *  Overview | Defaulters | Menu | Roster | Blackout days
 *
 * Note: Overview and Defaulters both render on the /admin dashboard.
 * "Blackout days" maps to /admin/setup (which also manages sections + holidays).
 */
export default function AdminTabs({
  activeHref,
}: {
  activeHref: string;
}) {
  const tabs = [
    { label: "Overview", href: "/admin" },
    { label: "Defaulters", href: "/admin/defaulters" },
    { label: "Menu", href: "/admin/menus" },
    { label: "Roster", href: "/admin/roster" },
    { label: "Blackout days", href: "/admin/setup" },
  ];

  return (
    <Tabs
      ariaLabel="Admin sections"
      items={tabs.map((tab) => ({
        id: tab.href,
        label: tab.label,
        href: tab.href,
      }))}
      selectedId={activeHref}
    />
  );
}
