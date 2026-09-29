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
  blackouts: { id: string; date: string; reason: string; sectionId: string | null }[];
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
    <>
      <div className="sr-card">
        <div className="sr-section-title" style={{ marginBottom: 10 }}>Sections</div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {sections.map((s) => (
            <li key={s.id} className="sr-defaulter" style={{ borderBottom: "1px solid var(--line)" }}>
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
          style={{ marginTop: 10 }}
        >
          <div className="sr-row">
            <input
              required
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              placeholder="New section name"
              className="sr-input"
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              disabled={pending}
              className="sr-btn sr-btn-primary sr-btn-sm"
            >
              Add
            </button>
          </div>
        </form>
      </div>

      <div className="sr-card">
        <div className="sr-section-title" style={{ marginBottom: 10 }}>Holiday calendar</div>
        <p className="sr-muted" style={{ fontSize: "12px", marginBottom: 8 }}>
          Academic year: {currentAcademicYear}
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: "160px", overflowY: "auto" }}>
          {holidays.map((h) => (
            <li key={h.id} className="sr-defaulter" style={{ borderBottom: "1px solid var(--line)" }}>
              {h.date} — {h.name}
            </li>
          ))}
          {holidays.length === 0 && <li className="sr-muted">No holidays added yet.</li>}
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(() => { addHoliday(currentAcademicYear, holidayDate, holidayName); });
            setHolidayDate("");
            setHolidayName("");
          }}
          style={{ marginTop: 10 }}
        >
          <input
            required
            type="date"
            value={holidayDate}
            onChange={(e) => setHolidayDate(e.target.value)}
            className="sr-input"
            style={{ marginBottom: 8 }}
          />
          <input
            required
            value={holidayName}
            onChange={(e) => setHolidayName(e.target.value)}
            placeholder="Holiday name"
            className="sr-input"
            style={{ marginBottom: 8 }}
          />
          <button
            type="submit"
            disabled={pending}
            className="sr-btn sr-btn-primary sr-btn-block"
          >
            Add holiday
          </button>
        </form>
      </div>

      <div className="sr-card">
        <div className="sr-section-title" style={{ marginBottom: 10 }}>Ad-hoc blackout days</div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: "160px", overflowY: "auto" }}>
          {blackouts.map((b) => (
            <li key={b.id} className="sr-defaulter" style={{ borderBottom: "1px solid var(--line)" }}>
              <span>{b.date}</span>
              <span className="sr-muted">— {b.reason} {b.sectionId ? "" : "(all sections)"}</span>
            </li>
          ))}
          {blackouts.length === 0 && <li className="sr-muted">No blackout days added yet.</li>}
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
          style={{ marginTop: 10 }}
        >
          <input
            required
            type="date"
            value={blackoutDate}
            onChange={(e) => setBlackoutDate(e.target.value)}
            className="sr-input"
            style={{ marginBottom: 8 }}
          />
          <input
            required
            value={blackoutReason}
            onChange={(e) => setBlackoutReason(e.target.value)}
            placeholder="Reason (e.g. Sports Day)"
            className="sr-input"
            style={{ marginBottom: 8 }}
          />
          <select
            value={blackoutSection}
            onChange={(e) => setBlackoutSection(e.target.value)}
            className="sr-select"
            style={{ marginBottom: 8 }}
          >
            <option value="">All sections</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.name} only</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={pending}
            className="sr-btn sr-btn-primary sr-btn-block"
          >
            Add blackout day
          </button>
        </form>
        <p className="sr-banner" style={{ marginTop: 10 }}>
          Blackout days close sign-ups for that date across all sections, on top of the academic-year holiday calendar.
        </p>
      </div>
    </>
  );
}
