-- Snack Roster MVP — core schema
-- Run via: supabase db push  (or paste into Supabase SQL editor)

create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create type user_role as enum ('admin', 'parent');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'parent',
  full_name text,
  phone text unique, -- E.164 format, matches auth.users.phone when using phone OTP
  created_at timestamptz not null default now()
);

-- ============================================================
-- SECTIONS
-- ============================================================
create table sections (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- HOLIDAY CALENDAR (academic-year, applies to all sections)
-- ============================================================
create table holidays (
  id uuid primary key default uuid_generate_v4(),
  academic_year text not null, -- e.g. '2026-2027'
  date date not null,
  name text not null,
  created_at timestamptz not null default now(),
  unique (date)
);

-- ============================================================
-- AD-HOC BLACKOUT DAYS (one-off, applies to all sections unless section_id set)
-- ============================================================
create table blackout_days (
  id uuid primary key default uuid_generate_v4(),
  date date not null,
  reason text,
  section_id uuid references sections(id) on delete cascade, -- null = applies to all sections
  created_at timestamptz not null default now()
);

-- ============================================================
-- MENUS (global default + optional per-section override)
-- ============================================================
create table menus (
  id uuid primary key default uuid_generate_v4(),
  section_id uuid references sections(id) on delete cascade, -- null = global default menu
  name text not null default 'Default Menu',
  created_at timestamptz not null default now(),
  unique (section_id) -- at most one override menu per section, one global (section_id null)
);

create table menu_items (
  id uuid primary key default uuid_generate_v4(),
  menu_id uuid not null references menus(id) on delete cascade,
  name text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- CHILDREN & PARENT LINKS
-- ============================================================
create table children (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  section_id uuid not null references sections(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table parent_children (
  parent_id uuid not null references profiles(id) on delete cascade,
  child_id uuid not null references children(id) on delete cascade,
  primary key (parent_id, child_id)
);

-- ============================================================
-- MONTH SCHEDULES & SLOTS
-- ============================================================
create table schedules (
  id uuid primary key default uuid_generate_v4(),
  section_id uuid not null references sections(id) on delete cascade,
  year int not null,
  month int not null check (month between 1 and 12),
  generated_at timestamptz not null default now(),
  unique (section_id, year, month)
);

create type slot_status as enum ('open', 'filled', 'skipped');

create table slots (
  id uuid primary key default uuid_generate_v4(),
  schedule_id uuid not null references schedules(id) on delete cascade,
  section_id uuid not null references sections(id) on delete cascade, -- denormalized for RLS/query convenience
  date date not null,
  status slot_status not null default 'open',
  child_id uuid references children(id) on delete set null,
  parent_id uuid references profiles(id) on delete set null,
  menu_item_id uuid references menu_items(id) on delete set null,
  signed_up_at timestamptz,
  created_at timestamptz not null default now(),
  unique (schedule_id, date)
);

-- ============================================================
-- SWAP REQUESTS
-- ============================================================
create type swap_status as enum ('pending', 'accepted', 'declined', 'cancelled');

create table swap_requests (
  id uuid primary key default uuid_generate_v4(),
  from_slot_id uuid not null references slots(id) on delete cascade, -- requester's slot
  to_slot_id uuid not null references slots(id) on delete cascade,   -- target's slot
  requester_parent_id uuid not null references profiles(id) on delete cascade,
  target_parent_id uuid not null references profiles(id) on delete cascade,
  status swap_status not null default 'pending',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- ============================================================
-- REMINDER SETTINGS (admin-configurable cadence)
-- ============================================================
create table reminder_settings (
  id int primary key default 1,
  days_before_month_start int not null default 5,
  grace_days_into_month int not null default 3,
  pre_slot_reminder_days int not null default 3,
  check (id = 1) -- singleton row
);
insert into reminder_settings (id) values (1);

-- ============================================================
-- NOTIFICATIONS LOG (stubbed delivery — MVP just logs)
-- ============================================================
create type notification_type as enum (
  'signup_nag', 'pre_slot_reminder', 'swap_requested', 'swap_accepted', 'swap_declined'
);

create table notifications_log (
  id uuid primary key default uuid_generate_v4(),
  parent_id uuid not null references profiles(id) on delete cascade,
  section_id uuid references sections(id) on delete set null,
  type notification_type not null,
  payload jsonb not null default '{}',
  sent boolean not null default false, -- true once a real provider is wired up
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_children_section on children(section_id);
create index idx_slots_section_date on slots(section_id, date);
create index idx_slots_parent on slots(parent_id);
create index idx_schedules_section_month on schedules(section_id, year, month);
create index idx_notifications_parent on notifications_log(parent_id);
create index idx_swap_target_parent on swap_requests(target_parent_id);
