import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SlotRow from "./slot-row";

export default async function SectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sectionId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const { data: section } = await supabase
    .from("sections")
    .select("id, name")
    .eq("id", sectionId)
    .single();

  const { data: schedule } = await supabase
    .from("schedules")
    .select("id")
    .eq("section_id", sectionId)
    .eq("year", year)
    .eq("month", month)
    .single();

  const { data: slotsRaw } = schedule
    ? await supabase
        .from("slots")
        .select("id, date, status, child_id, parent_id, menu_item_id, children(name), menu_items(name)")
        .eq("schedule_id", schedule.id)
        .order("date")
    : { data: [] };
  const slots = (slotsRaw ?? []).map((s: any) => ({
    ...s,
    children: Array.isArray(s.children) ? s.children[0] ?? null : s.children,
    menu_items: Array.isArray(s.menu_items) ? s.menu_items[0] ?? null : s.menu_items,
  }));

  // Active menu for this section: override if present, else global.
  const { data: overrideMenu } = await supabase
    .from("menus")
    .select("id")
    .eq("section_id", sectionId)
    .maybeSingle();
  const { data: globalMenu } = await supabase
    .from("menus")
    .select("id")
    .is("section_id", null)
    .maybeSingle();
  const menuId = overrideMenu?.id ?? globalMenu?.id;
  const { data: menuItems } = menuId
    ? await supabase
        .from("menu_items")
        .select("id, name")
        .eq("menu_id", menuId)
        .order("position")
    : { data: [] };

  // This parent's children in this section (for the sign-up dropdown).
  const { data: myChildren } = await supabase
    .from("parent_children")
    .select("children!inner(id, name, section_id)")
    .eq("parent_id", user.id);
  const myChildrenInSection = (myChildren ?? [])
    .map((r: any) => r.children)
    .filter((c: any) => c.section_id === sectionId);

  const hasSignedUp = (slots ?? []).some((s: any) => s.parent_id === user.id);

  return (
    <main className="mx-auto max-w-sm px-4 py-6">
      <Link href="/" className="text-sm text-gray-500">
        ← All sections
      </Link>
      <h1 className="text-2xl font-bold mt-1 mb-1">{section?.name}</h1>
      <p className="text-sm text-gray-500 mb-4">
        {now.toLocaleString("default", { month: "long", year: "numeric" })}
        {!hasSignedUp && (
          <span className="text-amber-700"> — you haven't signed up yet</span>
        )}
      </p>

      {!slots?.length && (
        <p className="text-sm text-gray-400">
          No schedule generated for this month yet. Ask admin to generate it.
        </p>
      )}

      <ul className="space-y-2">
        {slots?.map((slot: any) => (
          <SlotRow
            key={slot.id}
            slot={slot}
            myChildren={myChildrenInSection}
            menuItems={menuItems ?? []}
            currentUserId={user.id}
            allSlots={slots}
          />
        ))}
      </ul>
    </main>
  );
}
