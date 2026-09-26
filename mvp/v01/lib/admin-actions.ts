"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, ok: false as const };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return { supabase, ok: profile?.role === "admin", user };
}

export async function createSection(name: string) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { error: "Admin only." };
  const { error } = await supabase.from("sections").insert({ name });
  if (error) return { error: error.message };
  revalidatePath("/admin/setup");
  return { success: true };
}

export async function addHoliday(academicYear: string, date: string, name: string) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { error: "Admin only." };
  const { error } = await supabase
    .from("holidays")
    .insert({ academic_year: academicYear, date, name });
  if (error) return { error: error.message };
  revalidatePath("/admin/setup");
  return { success: true };
}

export async function addBlackoutDay(date: string, reason: string, sectionId: string | null) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { error: "Admin only." };
  const { error } = await supabase
    .from("blackout_days")
    .insert({ date, reason, section_id: sectionId });
  if (error) return { error: error.message };
  revalidatePath("/admin/setup");
  return { success: true };
}

export async function generateScheduleForSection(
  sectionId: string,
  year: number,
  month: number
) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { error: "Admin only." };
  const { error } = await supabase.rpc("generate_month_schedule", {
    p_section_id: sectionId,
    p_year: year,
    p_month: month,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

export async function addChildManual(name: string, sectionId: string) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { error: "Admin only." };
  const { error } = await supabase.from("children").insert({ name, section_id: sectionId });
  if (error) return { error: error.message };
  revalidatePath("/admin/roster");
  return { success: true };
}

export async function linkParentToChild(parentPhone: string, childId: string) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { error: "Admin only." };

  // Find or create a profile placeholder for this phone. Real auth user is
  // created automatically the first time the parent logs in via OTP —
  // this pre-links by phone so it resolves once they do.
  let { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("phone", parentPhone)
    .maybeSingle();

  if (!profile) {
    return {
      error:
        "No parent account found for that phone yet — they need to log in once first, then re-run this link.",
    };
  }

  const { error } = await supabase
    .from("parent_children")
    .insert({ parent_id: profile.id, child_id: childId });
  if (error) return { error: error.message };
  revalidatePath("/admin/roster");
  return { success: true };
}

export async function ensureMenu(sectionId: string | null) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { error: "Admin only." };
  const { data: existing } = await supabase
    .from("menus")
    .select("id")
    .is("section_id", sectionId)
    .maybeSingle();
  if (existing) return { success: true, menuId: existing.id };
  const { data, error } = await supabase
    .from("menus")
    .insert({ section_id: sectionId, name: sectionId ? "Section Menu" : "Global Snack Menu" })
    .select("id")
    .single();
  if (error) return { error: error.message };
  revalidatePath("/admin/menus");
  return { success: true, menuId: data.id };
}

export async function addMenuItem(menuId: string, name: string, position: number) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { error: "Admin only." };
  const { error } = await supabase.from("menu_items").insert({ menu_id: menuId, name, position });
  if (error) return { error: error.message };
  revalidatePath("/admin/menus");
  return { success: true };
}

export async function deleteMenuItem(itemId: string) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { error: "Admin only." };
  const { error } = await supabase.from("menu_items").delete().eq("id", itemId);
  if (error) return { error: error.message };
  revalidatePath("/admin/menus");
  return { success: true };
}

export async function deleteSectionMenuOverride(menuId: string) {
  // Deletes the override menu itself (its items cascade), reverting the
  // section back to inheriting the global menu.
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { error: "Admin only." };
  const { error } = await supabase.from("menus").delete().eq("id", menuId).not("section_id", "is", null);
  if (error) return { error: error.message };
  revalidatePath("/admin/menus");
  return { success: true };
}
export async function importRosterCsv(
  rows: { child_name: string; section_name: string; parent_phone: string }[]
) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { error: "Admin only." };

  const results: string[] = [];
  for (const row of rows) {
    const { data: section } = await supabase
      .from("sections")
      .select("id")
      .eq("name", row.section_name)
      .maybeSingle();
    if (!section) {
      results.push(`Skipped ${row.child_name}: section "${row.section_name}" not found.`);
      continue;
    }
    const { data: child, error: childErr } = await supabase
      .from("children")
      .insert({ name: row.child_name, section_id: section.id })
      .select("id")
      .single();
    if (childErr || !child) {
      results.push(`Failed to add ${row.child_name}: ${childErr?.message}`);
      continue;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("phone", row.parent_phone)
      .maybeSingle();
    if (profile) {
      await supabase.from("parent_children").insert({ parent_id: profile.id, child_id: child.id });
    } else {
      results.push(
        `${row.child_name} added, but parent ${row.parent_phone} hasn't logged in yet — link will need to happen after their first login.`
      );
    }
  }
  revalidatePath("/admin/roster");
  return { success: true, log: results };
}
