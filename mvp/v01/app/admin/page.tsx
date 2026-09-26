import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GenerateButton from "./generate-button";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/");

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const { data: sections } = await supabase
    .from("sections")
    .select("id, name")
    .eq("archived", false)
    .order("name");

  const sectionStats = await Promise.all(
    (sections ?? []).map(async (section) => {
      const { data: schedule } = await supabase
        .from("schedules")
        .select("id")
        .eq("section_id", section.id)
        .eq("year", year)
        .eq("month", month)
        .maybeSingle();

      if (!schedule) return { ...section, total: 0, filled: 0, generated: false };

      const { data: slots } = await supabase
        .from("slots")
        .select("status")
        .eq("schedule_id", schedule.id);

      const total = slots?.length ?? 0;
      const filled = slots?.filter((s) => s.status === "filled").length ?? 0;
      return { ...section, total, filled, generated: true };
    })
  );

  // Defaulter list: parents linked to children in a section who have no
  // filled slot in that section for the current month, past the grace period.
  const { data: settings } = await supabase
    .from("reminder_settings")
    .select("grace_days_into_month")
    .eq("id", 1)
    .single();
  const graceDays = settings?.grace_days_into_month ?? 3;
  const pastGrace = now.getDate() > graceDays;

  let defaulters: { parent: string; section: string }[] = [];
  if (pastGrace) {
    const { data: links } = await supabase
      .from("parent_children")
      .select("parent_id, children(section_id, name), profiles(full_name, phone)");
    const { data: allSlots } = await supabase
      .from("slots")
      .select("parent_id, section_id")
      .not("parent_id", "is", null);

    const bySectionParent = new Set(
      (allSlots ?? []).map((s) => `${s.section_id}:${s.parent_id}`)
    );
    const seen = new Set<string>();
    for (const link of links ?? []) {
      const sectionId = (link as any).children?.section_id;
      if (!sectionId) continue;
      const key = `${sectionId}:${link.parent_id}`;
      if (bySectionParent.has(key) || seen.has(key)) continue;
      seen.add(key);
      const sectionName = sections?.find((s) => s.id === sectionId)?.name ?? "?";
      const parentLabel =
        (link as any).profiles?.full_name || (link as any).profiles?.phone || link.parent_id;
      defaulters.push({ parent: parentLabel, section: sectionName });
    }
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Admin</h1>
        <Link href="/" className="text-sm text-gray-500">
          Parent view
        </Link>
      </div>

      <nav className="flex gap-3 text-sm mb-6">
        <Link href="/admin/setup" className="underline text-green-800">
          Sections / Holidays / Menu
        </Link>
        <Link href="/admin/roster" className="underline text-green-800">
          Roster
        </Link>
        <Link href="/admin/menus" className="underline text-green-800">
          Menus
        </Link>
      </nav>

      <h2 className="font-semibold mb-2">
        This month —{" "}
        {now.toLocaleString("default", { month: "long", year: "numeric" })}
      </h2>
      <ul className="space-y-2 mb-6">
        {sectionStats.map((s) => (
          <li key={s.id} className="border rounded-lg px-3 py-2 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{s.name}</p>
              <p className="text-xs text-gray-500">
                {s.generated ? `${s.filled} / ${s.total} slots filled` : "No schedule yet"}
              </p>
            </div>
            <GenerateButton sectionId={s.id} year={year} month={month} />
          </li>
        ))}
      </ul>

      <h2 className="font-semibold mb-2">Defaulters (past grace window)</h2>
      {!pastGrace && (
        <p className="text-xs text-gray-400">
          Grace window ({graceDays} days into month) hasn't lapsed yet.
        </p>
      )}
      {pastGrace && defaulters.length === 0 && (
        <p className="text-xs text-gray-400">No defaulters 🎉</p>
      )}
      <ul className="space-y-1">
        {defaulters.map((d, i) => (
          <li key={i} className="text-sm border-b py-1">
            {d.parent} — <span className="text-gray-500">{d.section}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
