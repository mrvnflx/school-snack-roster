-- Auto-generates (or re-syncs) a month schedule for a section:
-- weekday dates only, excluding holidays and blackout days (global or section-specific).
-- Safe to call again later in the month — it only inserts missing dates,
-- never removes/overwrites existing slots (so it won't wipe sign-ups).
create or replace function generate_month_schedule(p_section_id uuid, p_year int, p_month int)
returns uuid language plpgsql security definer as $$
declare
  v_schedule_id uuid;
  v_date date;
  v_month_start date := make_date(p_year, p_month, 1);
  v_month_end date := (make_date(p_year, p_month, 1) + interval '1 month - 1 day')::date;
begin
  insert into schedules (section_id, year, month)
  values (p_section_id, p_year, p_month)
  on conflict (section_id, year, month) do update set generated_at = now()
  returning id into v_schedule_id;

  if v_schedule_id is null then
    select id into v_schedule_id from schedules
    where section_id = p_section_id and year = p_year and month = p_month;
  end if;

  v_date := v_month_start;
  while v_date <= v_month_end loop
    -- weekdays only (1=Mon .. 5=Fri; Postgres dow: 0=Sun..6=Sat)
    if extract(dow from v_date) between 1 and 5
      and not exists (select 1 from holidays h where h.date = v_date)
      and not exists (
        select 1 from blackout_days b
        where b.date = v_date and (b.section_id is null or b.section_id = p_section_id)
      )
    then
      insert into slots (schedule_id, section_id, date, status)
      values (v_schedule_id, p_section_id, v_date, 'open')
      on conflict (schedule_id, date) do nothing;
    end if;
    v_date := v_date + 1;
  end loop;

  return v_schedule_id;
end;
$$;

-- Convenience: run generate_month_schedule for every active section for a given year/month.
create or replace function generate_month_schedule_all_sections(p_year int, p_month int)
returns void language plpgsql security definer as $$
declare
  r record;
begin
  for r in select id from sections where archived = false loop
    perform generate_month_schedule(r.id, p_year, p_month);
  end loop;
end;
$$;

-- Resolves the active menu (section override, else global) for a section.
create or replace function active_menu_id(p_section_id uuid)
returns uuid language sql stable as $$
  select coalesce(
    (select id from menus where section_id = p_section_id),
    (select id from menus where section_id is null)
  );
$$;

-- Returns true if a given parent still owes a sign-up for a section in a given month
-- (i.e. no slot in that schedule has parent_id = the parent).
create or replace function parent_has_signed_up(p_parent_id uuid, p_section_id uuid, p_year int, p_month int)
returns boolean language sql stable as $$
  select exists (
    select 1 from slots s
    join schedules sc on sc.id = s.schedule_id
    where sc.section_id = p_section_id and sc.year = p_year and sc.month = p_month
      and s.parent_id = p_parent_id
  );
$$;
