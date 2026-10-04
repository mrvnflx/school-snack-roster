import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import type { Db } from "@/lib/db";
import type { SlotWithDetails, ChildWithSection } from "@/lib/db/types";

export async function requireUser() {
  const db = getDb();
  const user = await db.auth.getUser();
  if (!user) redirect("/login");
  const profile = await db.profiles.getById(user.id);
  return { db, user, profile };
}

export async function requireAdmin() {
  const { db, user, profile } = await requireUser();
  if (profile?.role !== "admin") redirect("/");
  return { db, user, profile };
}

export function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export async function computeDefaulters(
  db: Db,
  sections: { id: string; name: string }[],
  flatSlots: SlotWithDetails[]
): Promise<{ parent: string; section: string }[]> {
  // Build a set of parent+section pairs that have at least one filled slot this month
  const filledBySectionParent = new Set(
    flatSlots
      .filter((slot) => slot.parentId !== null)
      .map((slot) => `${slot.sectionId}:${slot.parentId}`)
  );

  const defaulters: { parent: string; section: string }[] = [];
  const seen = new Set<string>();

  // Get all children-with-section and all profiles
  const childrenWithSection = await db.children.listWithSection();
  const allProfiles = await db.profiles.listAll();

  for (const { child, sectionName, parentId } of childrenWithSection as ChildWithSection[]) {
    if (!sectionName) continue;
    const parent = parentId ? allProfiles.find((p) => p.id === parentId) : undefined;
    if (!parent || parent.role !== "parent") continue;

    const key = `${child.sectionId}:${parent.id}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (!filledBySectionParent.has(key)) {
      defaulters.push({
        parent: parent.fullName ?? parent.phone ?? parent.id,
        section: sectionName,
      });
    }
  }

  return defaulters;
}
