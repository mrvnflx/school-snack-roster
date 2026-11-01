"use client";

import { useState, useTransition } from "react";
import { addHoliday, addBlackoutDay } from "@/lib/admin-actions";

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
  const [holidayDate, setHolidayDate] = useState("");
  const [holidayName, setHolidayName] = useState("");
  const [blackoutDate, setBlackoutDate] = useState("");
  const [blackoutReason, setBlackoutReason] = useState("");
  const [blackoutSection, setBlackoutSection] = useState("");
  const currentAcademicYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

  return (
    <>
      <div className="card">
        <div className="section-title" style={{ marginBottom: 10 }}>Holiday calendar</div>
        <p className="muted" style={{ fontSize: "12px", marginBottom: 8 }}>
          Academic year: {currentAcademicYear}
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: "160px", overflowY: "auto" }}>
          {holidays.map((h) => (
            <li key={h.id} className="defaulter" style={{ borderBottom: "1px solid var(--line)" }}>
              {h.date} — {h.name}
            </li>
          ))}
          {holidays.length === 0 && <li className="muted">No holidays added yet.</li>}
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(() => {
              addHoliday(currentAcademicYear, holidayDate, holidayName);
            });
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
            className="input"
            style={{ marginBottom: 8 }}
          />
          <input
            required
            value={holidayName}
            onChange={(e) => setHolidayName(e.target.value)}
            placeholder="Holiday name"
            className="input"
            style={{ marginBottom: 8 }}
          />
          <button
            type="submit"
            disabled={pending}
            className="btn btn-primary btn-block"
          >
            Add holiday
          </button>
        </form>
      </div>

      <div className="card">
        <div className="section-title" style={{ marginBottom: 10 }}>Ad-hoc blackout days</div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: "160px", overflowY: "auto" }}>
          {blackouts.map((b) => (
            <li key={b.id} className="defaulter" style={{ borderBottom: "1px solid var(--line)" }}>
              <span>{b.date}</span>
              <span className="muted">— {b.reason} {b.sectionId ? "" : "(all sections)"}</span>
            </li>
          ))}
          {blackouts.length === 0 && <li className="muted">No blackout days added yet.</li>}
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
            className="input"
            style={{ marginBottom: 8 }}
          />
          <input
            required
            value={blackoutReason}
            onChange={(e) => setBlackoutReason(e.target.value)}
            placeholder="Reason (e.g. Sports Day)"
            className="input"
            style={{ marginBottom: 8 }}
          />
          <select
            value={blackoutSection}
            onChange={(e) => setBlackoutSection(e.target.value)}
            className="select"
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
            className="btn btn-primary btn-block"
          >
            Add blackout day
          </button>
        </form>
        <p className="banner" style={{ marginTop: 10 }}>
          Blackout days close sign-ups for that date across all sections, on top of the academic-year holiday calendar.
        </p>
      </div>
    </>
  );
}
