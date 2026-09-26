# PRD: Snack Roster Automation App (v1.0)

## 1. Background

Each classroom section (e.g. "Env-1", "Elementary", "Env-2") currently runs a manual, paper-based monthly snack sign-up:
- Admin prints a blank calendar grid per section per month, with weekdays as slots and weekends/holidays blacked out.
- A fixed menu of ~10 snack items is posted alongside the calendar; each parent picks one item for their assigned date.
- Parents write their child's name into a date slot in person at the school noticeboard.
- Admin manually chases parents who haven't signed up, often into week 2–3 of the month.
- Parents have no reminder system and can forget their date.

## 2. Problem Statement

The process is manual, section-by-section, and month-by-month, creating recurring admin overhead and inconsistent parent participation. There is no persistent record, no reminder mechanism, and no easy way to handle last-minute changes (swaps).

## 3. Goals

- Eliminate manual schedule drafting each month.
- Remove admin's manual reminder burden.
- Reduce missed/forgotten sign-ups via automated reminders.
- Give parents self-service tools: sign up, view roster, swap slots.
- Keep it frictionless — no app install, accessible via a URL (PWA).

### Non-Goals (for v1)
- Payment/billing for snacks.
- Nutrition tracking or allergy management (flag as future consideration).
- Cross-school / multi-campus support.

## 4. Users & Roles

| Role | Description |
|---|---|
| **Admin** | School staff who configure sections, calendars, holidays, menus, and rosters. |
| **Parent** | Registers via phone + OTP, signs up their assigned child for slots within their child's section. |

## 5. Core Concepts

- **Section**: a class/group (e.g. Env-1, Elementary, Env-2), each with its own independent calendar and roster.
- **Month Schedule**: an auto-generated calendar per section per month — weekdays only, holidays/blackout days excluded.
- **Slot**: one weekday date within a section's schedule. **One child per slot** (matches current paper model).
- **Menu**: a list of ~10 snack items. Admin can define one **default/global menu** (today's model) or override it with a **section-specific menu** — sections without an override inherit the global one.
- **Academic-Year Holiday Calendar**: a full-year holiday list set up once (e.g. every June), looked up automatically when each month's schedule is generated.
- **Ad-hoc Blackout Day**: a one-off non-holiday date (e.g. sports day, PTM) added anytime, which also blocks sign-ups for that date.
- **Sign-up**: a parent claiming a slot for one child + selecting a menu item.
- **Swap**: a parent-to-parent request to exchange slots.
- **Household**: a parent may have multiple children — either in different sections (needing independent sign-ups per section) or in the same section (needing only one signed-up slot among them per month, not one each).

## 6. Functional Requirements

### 6.1 Admin
- Create/manage **sections** (add, rename, archive).
- Set up the **academic-year holiday calendar** once per year (e.g. every June) — applies across all sections and is auto-referenced every month when schedules are generated.
- Add **ad-hoc blackout days** at any time (miscellaneous one-off closures), independent of the annual calendar.
- Auto-generate each month's schedule per section (weekdays only, holidays + ad-hoc blackout days excluded) — replacing manual drafting.
- Maintain the **menu**: edit the global default menu, and optionally define a **section-specific override menu** for any section (falls back to global if not set).
- Maintain the **roster** (child name ↔ parent contact ↔ section assignment), via **either CSV bulk import or in-app manual add/edit**. Admin assigns children to sections (not self-service).
- View sign-up status per section/month — see filled vs. open slots at a glance.
- View a **defaulter list**: parents (per section) flagged after the nagging window lapses (see 6.3) — a simple view for manual follow-up, no further automated escalation in v1.
- Configure **automated reminder rules** (see 6.3).
- View swap requests if needed (visibility, not approval — swaps are parent-initiated per section 6.2).

### 6.2 Parent
- **Register/login** via phone number + OTP.
- View calendar(s) for each of their child(ren)'s section(s), for current/upcoming month.
- **Full visibility across all sections'** rosters (read-only for other sections).
- **Sign up** for an open slot in a child's section: pick a date + pick one menu item (from that section's active menu — global or override).
- **Edit or cancel** their own sign-up (date or menu item) up to **3 days before** the slot.
- **Request a swap** with any other parent who has a signed-up slot (not just open slots), up to **3 days before** the slot — sends a request to that parent.
- **Accept/decline** incoming swap requests.
- **Multi-child handling**: sign-up obligation is tracked at the **parent + section** level, not per-child.
  - A parent with children in **different sections** has an independent obligation per section (must sign up at least once, in each section, per month).
  - A parent with **multiple children in the same section** still has just one obligation for that section (one sign-up satisfies it, regardless of which/how many of their kids in that section it's for); they may optionally sign up more than once if they choose.
- Receive notifications (see 6.3).

### 6.3 Notifications / Reminders
- **Sign-up nagging cadence** (per section, per parent-household not yet signed up for the month):
  - **Daily** reminders starting **5 days before the start of the month**, up to month start.
  - **Continue daily** for **3 days into the new month** for any **parent + section** pair still not signed up ("defaulters").
  - After that 3-day grace window, stop nagging and **add that parent+section to the admin's defaulter list** — a plain visible list, no further automated escalation.
- **Pre-slot reminders**: reminder ahead of a parent's signed-up date (aligned with the 3-day edit/swap cutoff).
- **Swap notifications**: on request received, accepted, declined.
- **Unfilled slots close to date**: no automated intervention in v1 — slot is simply left open/skipped. (Flagged as future scope — see Section 8.)

## 7. Non-Functional Requirements
- **PWA**: installable, mobile-first, accessible via a single URL, no app-store dependency.
- Lightweight — should load and function well on average parent mobile devices/networks.
- Data privacy: phone numbers and child names are sensitive; access should be scoped (parents see other sections' rosters read-only, not contact info).

## 8. Resolved Decisions Log

| # | Topic | Decision |
|---|---|---|
| 1 | Reminder cadence | Daily reminders starting 5 days before month start; continue daily for 3 days after month start; then add to a plain admin-visible defaulter list — no further automated escalation. |
| 2 | Swap edit window | Same 3-day-before cutoff applies to swaps as to regular sign-up edits/cancellations. |
| 3 | Unfilled slots | Left skipped/open in v1 — no auto-assignment or free-for-all. Future scope for creative handling. |
| 4 | Menu scope | Supports both: one global default menu (today's model) and optional section-specific override menus. |
| 5 | Holiday calendar | Set up once per academic year (e.g. every June) for the full year; looked up automatically each month. Ad-hoc one-off blackout days also supported. |
| 6 | Multi-child parents | Sign-up obligation tracked at **parent + section** level (not per-child): independent obligation per section; multiple kids in the same section share one obligation. |
| 7 | Roster import | Both CSV bulk import and in-app manual add/edit supported. |

## 9. Open Questions for Refinement

None outstanding — flag new ones here as they arise during review.

## 10. Success Metrics (draft)
- % reduction in admin time spent on schedule setup/reminders.
- % of slots filled without manual admin nudge.
- Missed sign-up rate (empty slots close to date) vs. paper-based baseline.
- Parent adoption rate (registered parents / total parents).

---
*Final v1.0 — locked and approved for detailed spec/wireframes and development planning.*
