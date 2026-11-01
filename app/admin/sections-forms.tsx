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
    <div className="card">
      <div className="section-title" style={{ marginBottom: 10 }}>Sections</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {sections.map((s) => (
          <li
            key={s.id}
            className="defaulter"
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
        <div className="row">
          <input
            required
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            placeholder="New section name"
            className="input"
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            disabled={pending}
            className="btn btn-primary btn-sm"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
