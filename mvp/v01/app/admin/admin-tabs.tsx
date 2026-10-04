import Link from "next/link";

/** Shared admin tab bar — matches the prototype's tab set:
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
    { label: "Defaulters", href: "/admin" },
    { label: "Menu", href: "/admin/menus" },
    { label: "Roster", href: "/admin/roster" },
    { label: "Blackout days", href: "/admin/setup" },
  ];

  return (
    <div className="sr-tabs">
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          href={tab.href}
          className={`sr-tab${activeHref === tab.href ? " active" : ""}`}
          style={{ textDecoration: "none" }}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
