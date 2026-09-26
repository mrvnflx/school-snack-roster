-- Demo seed data. Run after migrations, in a fresh Supabase project.
-- Note: admin/parent auth users must be created via Supabase Auth (phone OTP)
-- separately — this seed only covers non-auth business data.

insert into sections (name) values ('Env-1'), ('Env-2'), ('Elementary');

-- Global default menu
insert into menus (section_id, name) values (null, 'Global Snack Menu');
insert into menu_items (menu_id, name, position)
select id, item, row_number() over ()
from menus, unnest(array[
  'Fruit Salad', 'Cheese Sandwich', 'Muffins', 'Popcorn', 'Veggie Sticks',
  'Yogurt Cups', 'Granola Bars', 'Idli/Dosa', 'Sandwiches', 'Fresh Juice'
]) as item
where menus.section_id is null;

-- Sample academic-year holiday calendar (edit dates/names as needed)
insert into holidays (academic_year, date, name) values
  ('2026-2027', '2026-10-02', 'Gandhi Jayanti'),
  ('2026-2027', '2026-11-14', 'Children''s Day (school holiday)'),
  ('2026-2027', '2026-12-25', 'Christmas');

-- Generate schedules for the current demo sections for the next 2 months
select generate_month_schedule(id, 2026, 9) from sections;
select generate_month_schedule(id, 2026, 10) from sections;
