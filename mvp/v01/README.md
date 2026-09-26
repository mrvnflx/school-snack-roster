# Snack Roster — MVP

Next.js (App Router) + Supabase. Mobile-first PWA-ready layout.

## What's built (Phase 1–5 of the plan)
- Full DB schema + RLS policies (`supabase/migrations/`)
- Auto-schedule generation (weekdays only, holidays/blackouts excluded)
- Admin: sections, holiday calendar, ad-hoc blackouts, roster (CSV + manual),
  fill-status dashboard, defaulter list
- Parent: phone-OTP login, cross-section read-only visibility, sign up /
  edit / cancel (3-day cutoff), swap requests
- Reminder engine as a Postgres function, logs to `notifications_log`
  (**stubbed** — no real SMS/push sent yet, see below)
- Menu admin UI: edit the global menu and per-section overrides
- PWA: manifest + service worker, installable to home screen, basic
  offline app-shell caching (network-first)

## Not yet built
- Real SMS/push delivery (currently just logs to a table)
- Push notifications (the manifest/SW support install + offline caching,
  not push — that needs a push subscription flow + VAPID keys, a
  reasonable follow-up once real SMS is wired up)

## 1. Set up Supabase
1. Create a project at supabase.com.
2. In the SQL editor, run the files in `supabase/migrations/` **in order**
   (0001 → 0004), then optionally `supabase/seed.sql` for demo data.
3. **Auth → Providers → Phone**: enable phone auth.
   - For local dev without Twilio: **Auth → Settings → Test OTP** — add a
     test phone number with a fixed code (e.g. `+15555550100` / `123456`)
     so you can log in without sending real SMS.
   - For production: connect Twilio (or another provider) in the same
     screen — no app code changes needed, this is Supabase-native.
4. Make yourself an admin: after your first login (creates a `profiles`
   row automatically), run in SQL editor:
   ```sql
   update profiles set role = 'admin' where phone = '+15555550100';
   ```
5. (Optional) Enable `pg_cron` (Database → Extensions) and run the
   `cron.schedule(...)` snippet at the bottom of `0004_reminders.sql` to
   run the reminder engine daily.

## 2. Run locally
```bash
cp .env.local.example .env.local   # fill in your Supabase URL + anon key
npm install
npm run dev
```

## 3. Deploy
Push to a GitHub repo, import into Vercel, add the two env vars from
`.env.local.example` in Vercel's project settings. No other config needed.

## Swapping in real SMS later
Two independent things currently stubbed, both swappable without touching
app code much:
1. **Login OTP** — configure a real provider in Supabase Auth settings.
2. **Reminders** — `notifications_log` rows are written but `sent` stays
   `false`. Add a small worker (Edge Function or cron job) that reads
   unsent rows and calls your SMS/WhatsApp provider, then flips `sent`.
