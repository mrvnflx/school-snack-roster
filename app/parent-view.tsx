"use client";

import { useState } from "react";
import SlotRow, { type SlotRowSlot, type Child } from "./section/[id]/slot-row";

type MenuOption = { id: string; name: string };

type SectionData = {
  id: string;
  name: string;
  slots: SlotRowSlot[];
  menuItems: MenuOption[];
  myChildren: Child[];
  hasSignedUp: boolean;
  isMySection: boolean;
  defaulters: { parent: string; section: string }[];
};

function monthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default function ParentView({
  sections,
  currentUserId,
  year,
  month,
}: {
  sections: SectionData[];
  currentUserId: string;
  year: number;
  month: number;
}) {
  // Default to the first section the parent has children in, else the first section
  const defaultSectionId =
    sections.find((s) => s.isMySection)?.id ?? sections[0]?.id ?? "";

  const [activeSectionId, setActiveSectionId] = useState(defaultSectionId);

  const activeSection = sections.find((s) => s.id === activeSectionId);
  if (!activeSection) return null;

  const monthStr = monthLabel(year, month);

  return (
    <>
      {/* Section tabs */}
      <div className="tabs">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveSectionId(s.id)}
            className={`tab${s.id === activeSectionId ? " active" : ""}`}
          >
            {s.name}
            {!s.isMySection && <span style={{ marginLeft: 4 }}>👁</span>}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 10 }}>
          {activeSection.name} — {monthStr}
        </div>

        {activeSection.isMySection && (
          <>
            {activeSection.hasSignedUp ? (
              <div className="banner ok">
                You're all set for {activeSection.name} this month ✓
              </div>
            ) : (
              <div className="banner">
                You haven't signed up for {activeSection.name} yet this month — pick an open date below.
              </div>
            )}
          </>
        )}
        {!activeSection.isMySection && (
          <div className="banner">
            Read-only view — your child isn't in this section.
          </div>
        )}

        {!activeSection.slots.length ? (
          <div className="empty">No schedule generated for this month yet.</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {activeSection.slots.map((slot) => (
              <SlotRow
                key={slot.id}
                slot={slot}
                myChildren={activeSection.myChildren}
                menuItems={activeSection.menuItems}
                currentUserId={currentUserId}
                allSlots={activeSection.slots}
                isMySection={activeSection.isMySection}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Defaulters list for the active section, shown below the calendar */}
      <div className="card">
        <div className="section-title">Defaulters this month</div>
        {activeSection.defaulters.length === 0 ? (
          <div className="empty">No defaulters this month — everyone in {activeSection.name} is signed up.</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {activeSection.defaulters.map((d, i) => (
              <li key={i} className="defaulter">
                <span>{d.parent}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
