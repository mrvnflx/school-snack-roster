
import type {
  Profile, Section, Holiday, BlackoutDay, Menu, MenuItem, Child,
  Slot, SlotWithDetails, SwapRequest, Notification, Schedule,
  ReminderSettings, ParentChildLink
} from './types';

let nextId = 1;
function uid(): string {
  return String(nextId++);
}

const sections: Section[] = [
  { id: uid(), name: 'Env-1', archived: false, createdAt: new Date().toISOString() },
  { id: uid(), name: 'Elementary', archived: false, createdAt: new Date().toISOString() },
  { id: uid(), name: 'Env-2', archived: false, createdAt: new Date().toISOString() },
];

const profiles: Profile[] = [
  { id: uid(), role: 'admin', fullName: 'Admin User', phone: '+919876543210', createdAt: new Date().toISOString() },
  { id: uid(), role: 'parent', fullName: 'Priya Nair', phone: '+919876543211', createdAt: new Date().toISOString() },
  { id: uid(), role: 'parent', fullName: 'Rahul Mehta', phone: '+919876543212', createdAt: new Date().toISOString() },
  { id: uid(), role: 'parent', fullName: 'Sara Khan', phone: '+919876543213', createdAt: new Date().toISOString() },
  { id: uid(), role: 'parent', fullName: 'Tom Fischer', phone: '+919876543214', createdAt: new Date().toISOString() },
];

const children: Child[] = [
  { id: uid(), name: 'Aarav', sectionId: sections[0].id, createdAt: new Date().toISOString() },
  { id: uid(), name: 'Diya', sectionId: sections[0].id, createdAt: new Date().toISOString() },
  { id: uid(), name: 'Kabir', sectionId: sections[1].id, createdAt: new Date().toISOString() },
  { id: uid(), name: 'Zoya', sectionId: sections[2].id, createdAt: new Date().toISOString() },
  { id: uid(), name: 'Imran', sectionId: sections[1].id, createdAt: new Date().toISOString() },
  { id: uid(), name: 'Leo', sectionId: sections[0].id, createdAt: new Date().toISOString() },
  { id: uid(), name: 'Nina', sectionId: sections[2].id, createdAt: new Date().toISOString() },
];

const parentChildLinks: ParentChildLink[] = [
  { parentId: profiles[1].id, childId: children[0].id },   // Priya -> Aarav (Env-1)
  { parentId: profiles[1].id, childId: children[1].id },   // Priya -> Diya (Env-1)
  { parentId: profiles[2].id, childId: children[2].id },   // Rahul -> Kabir (Elementary)
  { parentId: profiles[3].id, childId: children[3].id },   // Sara -> Zoya (Env-2)
  { parentId: profiles[3].id, childId: children[4].id },   // Sara -> Imran (Elementary)
  { parentId: profiles[4].id, childId: children[5].id },   // Tom -> Leo (Env-1)
];

const menus: Menu[] = [
  { id: uid(), sectionId: null, name: 'Global Snack Menu', createdAt: new Date().toISOString() },
];

const menuItems: MenuItem[] = [
  { id: uid(), menuId: menus[0].id, name: 'Fruit Salad', position: 1, createdAt: new Date().toISOString() },
  { id: uid(), menuId: menus[0].id, name: 'Cheese Sandwich', position: 2, createdAt: new Date().toISOString() },
  { id: uid(), menuId: menus[0].id, name: 'Muffins', position: 3, createdAt: new Date().toISOString() },
  { id: uid(), menuId: menus[0].id, name: 'Popcorn', position: 4, createdAt: new Date().toISOString() },
  { id: uid(), menuId: menus[0].id, name: 'Veggie Sticks', position: 5, createdAt: new Date().toISOString() },
  { id: uid(), menuId: menus[0].id, name: 'Yogurt Cups', position: 6, createdAt: new Date().toISOString() },
  { id: uid(), menuId: menus[0].id, name: 'Granola Bars', position: 7, createdAt: new Date().toISOString() },
  { id: uid(), menuId: menus[0].id, name: 'Idli/Dosa', position: 8, createdAt: new Date().toISOString() },
  { id: uid(), menuId: menus[0].id, name: 'Sandwiches', position: 9, createdAt: new Date().toISOString() },
  { id: uid(), menuId: menus[0].id, name: 'Fresh Juice', position: 10, createdAt: new Date().toISOString() },
];

const slots: Slot[] = [];
const holidays: Holiday[] = [
  { id: uid(), academicYear: '2026-2027', date: '2026-10-02', name: 'Gandhi Jayanti', createdAt: new Date().toISOString() },
  { id: uid(), academicYear: '2026-2027', date: '2026-11-14', name: "Children's Day", createdAt: new Date().toISOString() },
  { id: uid(), academicYear: '2026-2027', date: '2026-12-25', name: 'Christmas', createdAt: new Date().toISOString() },
];

const blackoutDays: BlackoutDay[] = [];

const swapRequests: SwapRequest[] = [];

const notifications: Notification[] = [];

const reminderSettings: ReminderSettings = {
  id: 1,
  daysBeforeMonthStart: 5,
  graceDaysIntoMonth: 3,
  preSlotReminderDays: 3,
};

const schedules: Schedule[] = [];

// Auto-seed current month schedules on first access
function seedCurrentMonthSchedules() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  for (const section of sections.filter(s => !s.archived)) {
    if (!schedules.some(sch => sch.sectionId === section.id && sch.year === year && sch.month === month)) {
      generateScheduleFor(section.id, year, month);
    }
  }
}

function generateScheduleFor(sectionId: string, year: number, month: number) {
  const scheduleId = uid();
  schedules.push({ id: scheduleId, sectionId, year, month, generatedAt: new Date().toISOString() });

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);
  const holidayDates = new Set(holidays.filter(h => h.academicYear === `${year}-${year+1}`).map(h => h.date));
  const blackoutDates = new Set(
    blackoutDays
      .filter(b => b.sectionId === null || b.sectionId === sectionId)
      .map(b => b.date)
  );

  let d = new Date(monthStart);
  while (d <= monthEnd) {
    const dow = d.getDay();
    const iso = d.toISOString().slice(0, 10);
    if (dow !== 0 && dow !== 6 && !holidayDates.has(iso) && !blackoutDates.has(iso)) {
      slots.push({
        id: uid(),
        scheduleId,
        sectionId,
        date: iso,
        status: 'open',
        childId: null,
        parentId: null,
        menuItemId: null,
        signedUpAt: null,
        createdAt: new Date().toISOString(),
      });
    }
    d.setDate(d.getDate() + 1);
  }
}

// Seed schedules on module load (lazy — called from init)
let seeded = false;
export function ensureSeeded() {
  if (!seeded) { seedCurrentMonthSchedules(); seeded = true; }
}

// ---- Find helpers ----
export function findParentChildLinks(pid: string) {
  return parentChildLinks.filter(l => l.parentId === pid);
}

export function findChildById(id: string) {
  return children.find(c => c.id === id);
}

export function findSectionById(id: string) {
  return sections.find(s => s.id === id);
}

export function findProfileByPhone(phone: string) {
  return profiles.find(p => p.phone === phone);
}

export function findMenuBySectionId(sectionId: string | null) {
  return menus.find(m => m.sectionId === sectionId);
}

export function findMenuItemsByMenuId(menuId: string) {
  return menuItems.filter(mi => mi.menuId === menuId).sort((a, b) => a.position - b.position);
}

export function findSlotById(id: string) {
  return slots.find(s => s.id === id);
}

export function findSlotsByScheduleId(scheduleId: string) {
  return slots.filter(s => s.scheduleId === scheduleId);
}

export function findSwapById(id: string) {
  return swapRequests.find(s => s.id === id);
}

export function findSwapByTarget(toSlotId: string) {
  return swapRequests.find(s => s.toSlotId === toSlotId && s.status === 'pending');
}

// ---- Mutable state (exported for test access) ----
export const store = {
  sections,
  profiles,
  children,
  parentChildLinks,
  menus,
  menuItems,
  slots,
  holidays,
  blackoutDays,
  swapRequests,
  notifications,
  reminderSettings,
  schedules,
  ensureSeeded,
  generateScheduleFor,
};
