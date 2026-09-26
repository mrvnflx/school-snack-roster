-- Generates today's reminder notifications (as notifications_log rows —
-- MVP stub, no real SMS/push send yet). Intended to run once daily via
-- pg_cron (see README for the `cron.schedule(...)` snippet) or an external
-- scheduler hitting a small wrapper endpoint.
create or replace function generate_daily_reminders()
returns void language plpgsql security definer as $$
declare
  v_settings record;
  v_today date := current_date;
  v_this_year int := extract(year from current_date);
  v_this_month int := extract(month from current_date);
  v_next_month_date date := (date_trunc('month', current_date) + interval '1 month')::date;
  v_next_year int := extract(year from v_next_month_date);
  v_next_month int := extract(month from v_next_month_date);
  v_days_into_month int := extract(day from current_date) - 1;
  v_days_to_month_end int := (date_trunc('month', current_date) + interval '1 month - 1 day')::date - current_date;
  r record;
begin
  select * into v_settings from reminder_settings where id = 1;

  -- ---- Sign-up nagging: NEXT month, starting N days before month start ----
  if v_days_to_month_end <= v_settings.days_before_month_start then
    for r in
      select distinct pc.parent_id, c.section_id
      from parent_children pc
      join children c on c.id = pc.child_id
      join sections s on s.id = c.section_id and s.archived = false
      where not parent_has_signed_up(pc.parent_id, c.section_id, v_next_year, v_next_month)
    loop
      insert into notifications_log (parent_id, section_id, type, payload)
      values (r.parent_id, r.section_id, 'signup_nag',
        jsonb_build_object('year', v_next_year, 'month', v_next_month, 'phase', 'pre_month'));
    end loop;
  end if;

  -- ---- Sign-up nagging: THIS month, within the grace window ----
  if v_days_into_month < v_settings.grace_days_into_month then
    for r in
      select distinct pc.parent_id, c.section_id
      from parent_children pc
      join children c on c.id = pc.child_id
      join sections s on s.id = c.section_id and s.archived = false
      where not parent_has_signed_up(pc.parent_id, c.section_id, v_this_year, v_this_month)
    loop
      insert into notifications_log (parent_id, section_id, type, payload)
      values (r.parent_id, r.section_id, 'signup_nag',
        jsonb_build_object('year', v_this_year, 'month', v_this_month, 'phase', 'grace_window'));
    end loop;
  end if;
  -- After the grace window lapses, nagging simply stops — the admin
  -- dashboard's defaulter list (computed on read) picks up from there.

  -- ---- Pre-slot reminders ----
  for r in
    select s.parent_id, s.section_id, s.id as slot_id, s.date
    from slots s
    where s.status = 'filled'
      and s.date = v_today + v_settings.pre_slot_reminder_days
  loop
    insert into notifications_log (parent_id, section_id, type, payload)
    values (r.parent_id, r.section_id, 'pre_slot_reminder',
      jsonb_build_object('slot_id', r.slot_id, 'date', r.date));
  end loop;
end;
$$;

-- To schedule this daily via Supabase's built-in pg_cron (needs the
-- pg_cron extension enabled once in the Supabase dashboard):
--
--   select cron.schedule(
--     'daily-reminders',
--     '0 8 * * *',  -- 8am UTC daily — adjust to your timezone
--     $$select generate_daily_reminders();$$
--   );
