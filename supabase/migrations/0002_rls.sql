-- Row Level Security
-- Model: admins (profiles.role = 'admin') can do everything.
-- Parents can read everything read-only across sections, but can only
-- write slots/children/menus for their own linked children/sections.

create or replace function is_admin()
returns boolean language sql stable as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function my_section_ids()
returns setof uuid language sql stable as $$
  select distinct c.section_id
  from parent_children pc
  join children c on c.id = pc.child_id
  where pc.parent_id = auth.uid();
$$;

-- ---------- profiles ----------
alter table profiles enable row level security;
create policy "profiles: self or admin read" on profiles for select
  using (id = auth.uid() or is_admin());
create policy "profiles: self update" on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles: admin write" on profiles for all
  using (is_admin()) with check (is_admin());

-- ---------- sections ----------
alter table sections enable row level security;
create policy "sections: read all authenticated" on sections for select
  using (auth.uid() is not null);
create policy "sections: admin write" on sections for all
  using (is_admin()) with check (is_admin());

-- ---------- holidays / blackout_days ----------
alter table holidays enable row level security;
create policy "holidays: read all authenticated" on holidays for select
  using (auth.uid() is not null);
create policy "holidays: admin write" on holidays for all
  using (is_admin()) with check (is_admin());

alter table blackout_days enable row level security;
create policy "blackouts: read all authenticated" on blackout_days for select
  using (auth.uid() is not null);
create policy "blackouts: admin write" on blackout_days for all
  using (is_admin()) with check (is_admin());

-- ---------- menus / menu_items ----------
alter table menus enable row level security;
create policy "menus: read all authenticated" on menus for select
  using (auth.uid() is not null);
create policy "menus: admin write" on menus for all
  using (is_admin()) with check (is_admin());

alter table menu_items enable row level security;
create policy "menu_items: read all authenticated" on menu_items for select
  using (auth.uid() is not null);
create policy "menu_items: admin write" on menu_items for all
  using (is_admin()) with check (is_admin());

-- ---------- children ----------
-- Parents get read access to ALL children (rosters are visible read-only
-- per PRD 6.2), but names only — contact info (phone) lives in profiles
-- which is locked to self/admin above, so this doesn't leak phone numbers.
alter table children enable row level security;
create policy "children: read all authenticated" on children for select
  using (auth.uid() is not null);
create policy "children: admin write" on children for all
  using (is_admin()) with check (is_admin());

-- ---------- parent_children ----------
alter table parent_children enable row level security;
create policy "parent_children: self or admin read" on parent_children for select
  using (parent_id = auth.uid() or is_admin());
create policy "parent_children: admin write" on parent_children for all
  using (is_admin()) with check (is_admin());

-- ---------- schedules ----------
alter table schedules enable row level security;
create policy "schedules: read all authenticated" on schedules for select
  using (auth.uid() is not null);
create policy "schedules: admin write" on schedules for all
  using (is_admin()) with check (is_admin());

-- ---------- slots ----------
alter table slots enable row level security;
-- Everyone can read all slots across all sections (full visibility, PRD 6.2)
create policy "slots: read all authenticated" on slots for select
  using (auth.uid() is not null);
-- Parents can only sign up / edit / cancel slots in a section their child belongs to
create policy "slots: parent write own section" on slots for update
  using (
    is_admin()
    or section_id in (select my_section_ids())
  )
  with check (
    is_admin()
    or (
      section_id in (select my_section_ids())
      -- parent_id must be themself or null (opening a slot back up)
      and (parent_id = auth.uid() or parent_id is null)
    )
  );
create policy "slots: admin insert/delete" on slots for insert
  with check (is_admin());
create policy "slots: admin delete" on slots for delete
  using (is_admin());

-- ---------- swap_requests ----------
alter table swap_requests enable row level security;
create policy "swaps: involved parties or admin read" on swap_requests for select
  using (requester_parent_id = auth.uid() or target_parent_id = auth.uid() or is_admin());
create policy "swaps: requester creates" on swap_requests for insert
  with check (requester_parent_id = auth.uid());
create policy "swaps: target or requester updates" on swap_requests for update
  using (requester_parent_id = auth.uid() or target_parent_id = auth.uid() or is_admin())
  with check (requester_parent_id = auth.uid() or target_parent_id = auth.uid() or is_admin());

-- ---------- reminder_settings ----------
alter table reminder_settings enable row level security;
create policy "reminder_settings: read all authenticated" on reminder_settings for select
  using (auth.uid() is not null);
create policy "reminder_settings: admin write" on reminder_settings for all
  using (is_admin()) with check (is_admin());

-- ---------- notifications_log ----------
alter table notifications_log enable row level security;
create policy "notifications: self or admin read" on notifications_log for select
  using (parent_id = auth.uid() or is_admin());
create policy "notifications: admin write" on notifications_log for all
  using (is_admin()) with check (is_admin());

-- Auto-create a profile row when a new auth user signs up (role defaults to 'parent')
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, phone, full_name)
  values (new.id, new.phone, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
