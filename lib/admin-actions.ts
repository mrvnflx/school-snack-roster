"use server";

import { revalidatePath } from "next/cache";
import type { Db } from "@/lib/db";
import { getDb } from "@/lib/db";

async function requireAdmin(db: Db) {
  const user = await db.auth.getUser();
  if (!user) return { db, ok: false as const };
  const profile = await db.profiles.getById(user.id);
  return { db, ok: profile?.role === "admin", user };
}

export async function createSection(name: string) {
  const db = getDb();
  const { ok } = await requireAdmin(db);
  if (!ok) return { error: "Admin only." };
  const result = await db.sections.create(name);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/setup");
  return { success: true };
}

export async function addHoliday(academicYear: string, date: string, name: string) {
  const db = getDb();
  const { ok } = await requireAdmin(db);
  if (!ok) return { error: "Admin only." };
  const result = await db.holidays.create(academicYear, date, name);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/setup");
  return { success: true };
}

export async function addBlackoutDay(date: string, reason: string, sectionId: string | null) {
  const db = getDb();
  const { ok } = await requireAdmin(db);
  if (!ok) return { error: "Admin only." };
  const result = await db.blackouts.create(date, reason || null, sectionId || null);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/setup");
  return { success: true };
}

export async function generateScheduleForSection(sectionId: string, year: number, month: number) {
  const db = getDb();
  const { ok } = await requireAdmin(db);
  if (!ok) return { error: "Admin only." };
  const result = await db.schedules.generateForSection(sectionId, year, month);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin");
  return { success: true };
}

export async function addChildManual(name: string, sectionId: string) {
  const db = getDb();
  const { ok } = await requireAdmin(db);
  if (!ok) return { error: "Admin only." };
  const result = await db.children.create(name, sectionId);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/roster");
  return { success: true };
}

export async function linkParentToChild(parentPhone: string, childId: string) {
  const db = getDb();
  const { ok } = await requireAdmin(db);
  if (!ok) return { error: "Admin only." };
  const result = await db.children.linkParent(parentPhone, childId);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/roster");
  return { success: true };
}

export async function ensureMenu(sectionId: string | null) {
  const db = getDb();
  const { ok } = await requireAdmin(db);
  if (!ok) return { error: "Admin only." };
  const result = await db.menus.ensureMenu(sectionId);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/menus");
  return { success: true, menuId: result.data };
}

export async function addMenuItem(menuId: string, name: string, position: number) {
  const db = getDb();
  const { ok } = await requireAdmin(db);
  if (!ok) return { error: "Admin only." };
  const result = await db.menus.addMenuItem(menuId, name, position);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/menus");
  return { success: true };
}

export async function deleteMenuItem(itemId: string) {
  const db = getDb();
  const { ok } = await requireAdmin(db);
  if (!ok) return { error: "Admin only." };
  const result = await db.menus.deleteMenuItem(itemId);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/menus");
  return { success: true };
}

export async function deleteSectionMenuOverride(menuId: string) {
  const db = getDb();
  const { ok } = await requireAdmin(db);
  if (!ok) return { error: "Admin only." };
  const result = await db.menus.deleteSectionMenuOverride(menuId);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/menus");
  return { success: true };
}

export async function importRosterCsv(
  rows: { child_name: string; section_name: string; parent_phone: string }[]
) {
  const db = getDb();
  const { ok } = await requireAdmin(db);
  if (!ok) return { success: false, error: "Admin only." };
  const result = await db.children.importRosterCsv(rows);
  if (!result.success) return { success: false, error: result.error };
  revalidatePath("/admin/roster");
  return { success: true, data: result.data };
}
