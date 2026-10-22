
export type UserRole = 'admin' | 'parent';
export type SlotStatus = 'open' | 'filled' | 'skipped';
export type SwapStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export interface Profile {
  id: string;
  role: UserRole;
  fullName: string | null;
  phone: string | null;
  createdAt: string;
}

export interface Section {
  id: string;
  name: string;
  archived: boolean;
  createdAt: string;
}

export interface Holiday {
  id: string;
  academicYear: string;
  date: string;
  name: string;
  createdAt: string;
}

export interface BlackoutDay {
  id: string;
  date: string;
  reason: string | null;
  sectionId: string | null; // null = all sections
  createdAt: string;
}

export interface Menu {
  id: string;
  sectionId: string | null; // null = global default
  name: string;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  menuId: string;
  name: string;
  position: number;
  createdAt: string;
}

export interface Child {
  id: string;
  name: string;
  sectionId: string;
  createdAt: string;
}

export interface Slot {
  id: string;
  scheduleId: string;
  sectionId: string;
  date: string;
  status: SlotStatus;
  childId: string | null;
  parentId: string | null;
  menuItemId: string | null;
  signedUpAt: string | null;
  createdAt: string;
}

export interface SlotWithDetails extends Slot {
  childName: string | null;
  menuItemName: string | null;
}

export interface SwapRequest {
  id: string;
  fromSlotId: string;
  toSlotId: string;
  requesterParentId: string;
  targetParentId: string;
  status: SwapStatus;
  createdAt: string;
  resolvedAt: string | null;
}

export interface Notification {
  id: string;
  parentId: string;
  sectionId: string | null;
  type: string;
  payload: Record<string, unknown>;
  sent: boolean;
  createdAt: string;
}

export interface Schedule {
  id: string;
  sectionId: string;
  year: number;
  month: number;
  generatedAt: string;
}

export interface ReminderSettings {
  id: number;
  daysBeforeMonthStart: number;
  graceDaysIntoMonth: number;
  preSlotReminderDays: number;
}

export interface ParentChildLink {
  parentId: string;
  childId: string;
}

/** Shape returned by menus repository — a menu with its items */
export interface MenuWithItems {
  menu: Menu;
  items: MenuItem[];
}

/** Shape returned by children repository — child + section name */
export interface ChildWithSection {
  child: Child;
  sectionName: string | null;
  parentId: string | null;
}

/** Result type for operations that can fail */
export type DbResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
