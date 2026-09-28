"use client";

import { useState, useTransition } from "react";
import { createSection, addHoliday, addBlackoutDay } from "@/lib/admin-actions";

export default function SetupForms({
  sections,
  holidays,
  blackouts,
}: {
  sections: { id: string; name: string }[];
  holidays: { id: string; date: string; name: string }[];
  blackouts: { id: string; date: string; reason: string; sectionId: string | null }[],
}) {
  const [pending, startTransition] = useTransition();
  const [sectionName, setSectionName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [holidayName, setHolidayName] = useState("");
  const [blackoutDate, setBlackoutDate] = useState("");
  const [blackoutReason, setBlackoutReason] = useState("");
  const [blackoutSection, setBlackoutSection] = useState("");
  const currentAcademicYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-semibold mb-2">Sections</h2>
        <ul className="text-sm space-y-1 mb-2">
          {sections.map((s) => (
            <li key={s.id} className="border-b py-1">
              {s.name}
            </li>
          ))}
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(() => { createSection(sectionName); });
            setSectionName("");
          }}
          className="flex gap-2"
        >
          <input
            required
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            placeholder="New section name"
            className="flex-1 border rounded px-2 py-1 text-sm"
          />
          <button disabled={pending} className="bg-green-800 text-white rounded px-3 text-sm">
            Add
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Holiday calendar</h2>
        <ul className="text-sm space-y-1 mb-2 max-h-40 overflow-auto">
          {holidays.map((h) => (
            <li key={h.id} className="border-b py-1">
              {h.date} — {h.name}
            </li>
          ))}
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(() => { addHoliday(currentAcademicYear, holidayDate, holidayName); });
            setHolidayDate("");
            setHolidayName("");
          }}
          className="space-y-2"
        >
          <input
            required
            type="date"
            value={holidayDate}
            onChange={(e) => setHolidayDate(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm"
          />
          <input
            required
            value={holidayName}
            onChange={(e) => setHolidayName(e.target.value)}
            placeholder="Holiday name"
            className="w-full border rounded px-2 py-1 text-sm"
          />
          <button disabled={pending} className="w-full bg-green-800 text-white rounded py-1.5 text-sm">
            Add holiday
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Ad-hoc blackout days</h2>
        <ul className="text-sm space-y-1 mb-2 max-h-40 overflow-auto">
          {blackouts.map((b) => (
            <li key={b.id} className="border-b py-1">
              {b.date} — {b.reason} {b.sectionId ? "" : "(all sections)"}
            </li>
          ))}
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(() => {
              addBlackoutDay(blackoutDate, blackoutReason, blackoutSection || null);
            });
            setBlackoutDate("");
            setBlackoutReason("");
          }}
          className="space-y-2"
        >
          <input
            required
            type="date"
            value={blackoutDate}
            onChange={(e) => setBlackoutDate(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm"
          />
          <input
            required
            value={blackoutReason}
            onChange={(e) => setBlackoutReason(e.target.value)}
            placeholder="Reason (e.g. Sports Day)"
            className="w-full border rounded px-2 py-1 text-sm"
          />
          <select
            value={blackoutSection}
            onChange={(e) => setBlackoutSection(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm"
          >
            <option value="">All sections</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} only
              </option>
            ))}
          </select>
          <button disabled={pending} className="w-full bg-green-800 text-white rounded py-1.5 text-sm">
            Add blackout day
          </button>
        </form>
      </section>
    </div>
  );
}
