"use client";

import { useState, useTransition } from "react";
import { addChildManual, linkParentToChild, importRosterCsv } from "@/lib/admin-actions";

export default function RosterForms({
  sections,
  children,
}: {
  sections: { id: string; name: string }[];
  children: { id: string; name: string; sectionId: string; sectionName: string | null }[];
}) {
  const [pending, startTransition] = useTransition();
  const [childName, setChildName] = useState("");
  const [childSection, setChildSection] = useState(sections[0]?.id ?? "");
  const [linkPhone, setLinkPhone] = useState("");
  const [linkChildId, setLinkChildId] = useState(children[0]?.id ?? "");
  const [csvLog, setCsvLog] = useState<string[] | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result);
      const lines = text.trim().split("\n");
      const [header, ...rows] = lines;
      const cols = header.split(",").map((c) => c.trim().toLowerCase());
      const childIdx = cols.indexOf("child_name");
      const sectionIdx = cols.indexOf("section_name");
      const phoneIdx = cols.indexOf("parent_phone");
      if (childIdx === -1 || sectionIdx === -1 || phoneIdx === -1) {
        setCsvLog(["CSV must have headers: child_name, section_name, parent_phone"]);
        return;
      }
      const parsed = rows
        .filter(Boolean)
        .map((line) => {
          const cells = line.split(",").map((c) => c.trim());
          return {
            child_name: cells[childIdx],
            section_name: cells[sectionIdx],
            parent_phone: cells[phoneIdx],
          };
        });
      startTransition(async () => {
        const res = await importRosterCsv(parsed);
        if (res.success && res.data) {
          setCsvLog(res.data.log ?? ["Import complete."]);
        } else {
          setCsvLog([(res as { error: string }).error]);
        }
      });
    };
    reader.readAsText(file);
  }

  return (
    <>
      <div className="sr-card">
        <div className="sr-section-title" style={{ marginBottom: 10 }}>CSV import</div>
        <p className="sr-muted" style={{ marginBottom: 10 }}>
          Columns: child_name, section_name, parent_phone. Parents must have
          logged in at least once (via OTP) for the link to resolve.
        </p>
        <input type="file" accept=".csv" onChange={handleCsvUpload} className="sr-input" />
        {csvLog && (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {csvLog.map((l, i) => (
              <li key={i} className="sr-muted" style={{ fontSize: "12px" }}>{l}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="sr-card">
        <div className="sr-section-title" style={{ marginBottom: 10 }}>Add child manually</div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(() => { addChildManual(childName, childSection); });
            setChildName("");
          }}
        >
          <input
            required
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder="Child's name"
            className="sr-input"
            style={{ marginBottom: 8 }}
          />
          <select
            value={childSection}
            onChange={(e) => setChildSection(e.target.value)}
            className="sr-select"
            style={{ marginBottom: 8 }}
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={pending}
            className="sr-btn sr-btn-primary sr-btn-block"
          >
            Add child
          </button>
        </form>
      </div>

      <div className="sr-card">
        <div className="sr-section-title" style={{ marginBottom: 10 }}>Link parent to child</div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setLinkError(null);
            startTransition(async () => {
              const res = await linkParentToChild(linkPhone, linkChildId);
              if (res?.error) setLinkError(res.error);
            });
            setLinkPhone("");
          }}
        >
          <input
            required
            value={linkPhone}
            onChange={(e) => setLinkPhone(e.target.value)}
            placeholder="Parent phone (+91XXXXXXXXXX)"
            className="sr-input"
            style={{ marginBottom: 8 }}
          />
          <select
            value={linkChildId}
            onChange={(e) => setLinkChildId(e.target.value)}
            className="sr-select"
            style={{ marginBottom: 8 }}
          >
            {children.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.sectionName ?? "?"})</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={pending}
            className="sr-btn sr-btn-primary sr-btn-block"
          >
            Link
          </button>
          {linkError && (
            <p style={{ color: "var(--coral)", fontSize: "13px", marginTop: 6 }}>{linkError}</p>
          )}
        </form>
      </div>

      <div className="sr-card">
        <div className="sr-section-title" style={{ marginBottom: 10 }}>
          All children ({children.length})
        </div>
        {Object.entries(
          children.reduce(
            (groups: Record<string, typeof children>, c) => {
              const key = c.sectionName || "No section";
              (groups[key] = groups[key] || []).push(c);
              return groups;
            },
            {}
          )
        ).map(([section, sectionChildren]) => (
          <div key={section}>
            <div className="sr-section-title-light">{section}</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: "200px", overflowY: "auto" }}>
              {sectionChildren.map((c) => (
                <li
                  key={c.id}
                  className="sr-defaulter"
                  style={{ borderBottom: "1px solid var(--line)" }}
                >
                  <span>{c.name}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
