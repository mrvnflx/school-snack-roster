"use client";

import { useState, useTransition } from "react";
import { createSection } from "@/lib/admin-actions";

export default function SectionsForms({
  sections,
}: {
  sections: { id: string; name: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const [sectionName, setSectionName] = useState("");

  return (
    <div className="sr-card">
      <div className="sr-section-title" style={{ marginBottom: 10 }}>Sections</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {sections.map((s) => (
          <li
            key={s.id}
            className="sr-defaulter"
            style={{ borderBottom: "1px solid var(--line)" }}
          >
            {s.name}
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(() => {
            createSection(sectionName);
          });
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
  );
}
