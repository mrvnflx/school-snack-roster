
import type { AuthRepo, SectionsRepo, HolidaysRepo, BlackoutsRepo, MenusRepo, ChildrenRepo, SlotsRepo, SwapsRepo, NotificationsRepo, SchedulesRepo, ReminderSettingsRepo, ProfilesRepo } from './contracts';
import { useInMemoryDb } from './config';

// In-memory
import { inMemorySections } from './in-memory-sections';
import { inMemoryHolidays } from './in-memory-holidays';
import { inMemoryBlackouts } from './in-memory-blackouts';
import { inMemoryMenus } from './in-memory-menus';
import { inMemoryChildren } from './in-memory-children';
import { inMemorySlots } from './in-memory-slots';
import { inMemorySwaps } from './in-memory-swaps';
import { inMemoryNotifications } from './in-memory-notifications';
import { inMemorySchedules } from './in-memory-schedules';
import { inMemoryProfiles } from './in-memory-profiles';
import { inMemoryServerAuth } from './in-memory-server-auth';

// Supabase
import { supabaseSections } from './supabase-sections';
import { supabaseHolidays } from './supabase-holidays';
import { supabaseBlackouts } from './supabase-blackouts';
import { supabaseMenus } from './supabase-menus';
import { supabaseChildren } from './supabase-children';
import { supabaseSlots } from './supabase-slots';
import { supabaseSwaps } from './supabase-swaps';
import { supabaseNotifications } from './supabase-notifications';
import { supabaseSchedules } from './supabase-schedules';
import { supabaseProfiles } from './supabase-profiles';
import { supabaseAuth } from './supabase-auth';

export interface Db {
  auth: AuthRepo;
  sections: SectionsRepo;
  holidays: HolidaysRepo;
  blackouts: BlackoutsRepo;
  menus: MenusRepo;
  children: ChildrenRepo;
  slots: SlotsRepo;
  swaps: SwapsRepo;
  notifications: NotificationsRepo;
  schedules: SchedulesRepo;
  profiles: ProfilesRepo;
  reminderSettings: ReminderSettingsRepo;
}

export function createDb(): Db {
  if (useInMemoryDb()) {
    return {
      auth: inMemoryServerAuth,
      sections: inMemorySections,
      holidays: inMemoryHolidays,
      blackouts: inMemoryBlackouts,
      menus: inMemoryMenus,
      children: inMemoryChildren,
      slots: inMemorySlots,
      swaps: inMemorySwaps,
      notifications: inMemoryNotifications,
      schedules: inMemorySchedules,
      profiles: inMemoryProfiles,
      reminderSettings: { get: async () => null } as ReminderSettingsRepo, // stub — in-memory doesn't persist reminder settings
    };
  }

  return {
    auth: supabaseAuth,
    sections: supabaseSections,
    holidays: supabaseHolidays,
    blackouts: supabaseBlackouts,
    menus: supabaseMenus,
    children: supabaseChildren,
    slots: supabaseSlots,
    swaps: supabaseSwaps,
    notifications: supabaseNotifications,
    schedules: supabaseSchedules,
    profiles: supabaseProfiles,
    reminderSettings: { get: async () => null } as ReminderSettingsRepo,
  };
}

/** Fresh DB instance per request. Works for both in-memory and Supabase modes. */
export function getDb(): Db {
  return createDb();
}

// Prefer per-request fresh instance to avoid stale state
// For in-memory mode, call createDb() directly; for supabase, the singleton is fine
// since Supabase clients are request-scoped via createClient()

export const inMemoryDb = createDb; // For in-memory mode: call fresh each request
