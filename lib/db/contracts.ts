
import type {
  Section, Holiday, BlackoutDay, MenuWithItems, ChildWithSection,
  Slot, SlotWithDetails, SwapRequest, Notification, Schedule,
  ReminderSettings, Profile, DbResult
} from './types';

/** Sections: list, get, create, archive */
export interface SectionsRepo {
  list(archived?: boolean): Promise<Section[]>;
  getById(id: string): Promise<Section | null>;
  create(name: string): Promise<DbResult<void>>;
  archive(id: string): Promise<DbResult<void>>;
}

/** Holidays: list, create */
export interface HolidaysRepo {
  list(): Promise<Holiday[]>;
  create(academicYear: string, date: string, name: string): Promise<DbResult<void>>;
}

/** Blackout days: list, create, remove */
export interface BlackoutsRepo {
  list(): Promise<BlackoutDay[]>;
  create(date: string, reason: string | null, sectionId: string | null): Promise<DbResult<void>>;
  remove(id: string): Promise<DbResult<void>>;
}

/** Menus: list all with items, get active menu for section, ensure menu exists,
    add/remove items, delete section override */
export interface MenusRepo {
  listAll(): Promise<MenuWithItems[]>;
  getActiveMenuForSection(sectionId: string): Promise<MenuWithItems | null>;
  ensureMenu(sectionId: string | null): Promise<DbResult<string>>; // returns menu id
  addMenuItem(menuId: string, name: string, position: number): Promise<DbResult<void>>;
  deleteMenuItem(itemId: string): Promise<DbResult<void>>;
  deleteSectionMenuOverride(menuId: string): Promise<DbResult<void>>;
}

/** Children: list with section names and parent id, create, link parent, CSV import */
export interface ChildrenRepo {
  listWithSection(): Promise<ChildWithSection[]>;
  create(name: string, sectionId: string): Promise<DbResult<void>>;
  linkParent(parentPhone: string, childId: string): Promise<DbResult<void>>;
  importRosterCsv(
    rows: { child_name: string; section_name: string; parent_phone: string }[]
  ): Promise<DbResult<{ log: string[] }>>;
}

/** Slots: CRUD, sign-up, cancel, swap slots */
export interface SlotsRepo {
  getById(id: string): Promise<Slot | null>;
  listBySchedule(scheduleId: string): Promise<SlotWithDetails[]>;
  /** Return slots for a section+month, with child/menu details */
  listBySectionAndMonth(sectionId: string, year: number, month: number): Promise<SlotWithDetails[]>;
  signUp(slotId: string, childId: string, parentId: string, menuItemId: string): Promise<DbResult<void>>;
  cancel(slotId: string, parentId: string): Promise<DbResult<void>>;
  swapSlots(fromSlotId: string, toSlotId: string): Promise<void>;
}

/** Swap requests: create, get, resolve */
export interface SwapsRepo {
  create(fromSlotId: string, toSlotId: string, requesterParentId: string, targetParentId: string): Promise<DbResult<void>>;
  getById(id: string): Promise<SwapRequest | null>;
  resolve(id: string, accept: boolean, userId: string): Promise<DbResult<void>>;
}

/** Notifications: log only (MVP stub) */
export interface NotificationsRepo {
  log(parentId: string, sectionId: string | null, type: string, payload: Record<string, unknown>): Promise<void>;
}

/** Schedules: get by section+year+month, generate, list by section */
export interface SchedulesRepo {
  getBySectionYearMonth(sectionId: string, year: number, month: number): Promise<Schedule | null>;
  generateForSection(sectionId: string, year: number, month: number): Promise<DbResult<void>>;
  listBySection(sectionId: string): Promise<Schedule[]>;
}

/** Reminder settings: singleton read */
export interface ReminderSettingsRepo {
  get(): Promise<ReminderSettings | null>;
}

/** Profiles: get by id/phone, list all, create, update role */
export interface ProfilesRepo {
  getById(id: string): Promise<Profile | null>;
  getByPhone(phone: string): Promise<Profile | null>;
  listAll(): Promise<Profile[]>;
  create(id: string, phone: string, fullName?: string): Promise<void>;
  updateRole(id: string, role: 'admin' | 'parent'): Promise<void>;
}

/** Auth: get current user (from Supabase or mock cookie) */
export interface AuthRepo {
  /** Returns null if not authenticated */
  getUser(): Promise<{ id: string; phone?: string; role?: string; fullName?: string } | null>;
}
