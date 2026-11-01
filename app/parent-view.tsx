"use client";

import { useState } from "react";
import SlotRow, { type SlotRowSlot, type Child } from "./section/[id]/slot-row";
import { Banner, Card, SectionTitle, Tabs } from "@/components/design-system";

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
      <Tabs
        ariaLabel="Sections"
        items={sections.map((section) => ({
          id: section.id,
          label: `${section.name}${section.isMySection ? "" : " 👁"}`,
        }))}
        selectedId={activeSectionId}
        onSelect={setActiveSectionId}
      />

      <div className="sr-parent-grid">
        <Card>
          <SectionTitle>
            {activeSection.name} — {monthStr}
          </SectionTitle>

          {activeSection.isMySection && (
            <>
              {activeSection.hasSignedUp ? (
                <Banner tone="success">
                  You&apos;re all set for {activeSection.name} this month ✓
                </Banner>
              ) : (
                <Banner>
                  You haven&apos;t signed up for {activeSection.name} yet this month — pick an open date below.
                </Banner>
              )}
            </>
          )}
          {!activeSection.isMySection && (
            <Banner>
              Read-only view — your child isn&apos;t in this section.
            </Banner>
          )}

          {!activeSection.slots.length ? (
            <div className="sr-empty">No schedule generated for this month yet.</div>
          ) : (
            <ul className="sr-list">
              {activeSection.slots.map((slot) => (
                <li key={slot.id}>
                  <SlotRow
                    slot={slot}
                    myChildren={activeSection.myChildren}
                    menuItems={activeSection.menuItems}
                    currentUserId={currentUserId}
                    allSlots={activeSection.slots}
                    isMySection={activeSection.isMySection}
                  />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <SectionTitle>Defaulters this month</SectionTitle>
          {activeSection.defaulters.length === 0 ? (
            <div className="sr-empty">No defaulters this month — everyone in {activeSection.name} is signed up.</div>
          ) : (
            <ul className="sr-list">
              {activeSection.defaulters.map((d, i) => (
                <li key={i} className="sr-defaulter">
                  <span>{d.parent}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
