"use client";

import { useState } from "react";
import {
  Banner,
  BrandHeader,
  Card,
  RosterSlot,
  SectionTitle,
  StatCard,
  Tabs,
} from "@/components/design-system";

type DemoSlot = {
  date: string;
  childName?: string;
  parentId?: string;
  menuItem?: string;
};

const parents = [
  { id: "priya", name: "Priya Nair", sections: ["Env-1"] },
  { id: "rahul", name: "Rahul Mehta", sections: ["Elementary"] },
  { id: "sara", name: "Sara Khan", sections: ["Elementary", "Env-2"] },
];

const menu = [
  "Banana Muffins",
  "Fruit Skewers",
  "Cheese & Crackers",
  "Veggie Sticks & Hummus",
  "Mini Sandwiches",
];

const sections: {
  id: string;
  slots: DemoSlot[];
  defaulters: string[];
}[] = [
  {
    id: "Env-1",
    slots: [
      { date: "2026-09-01", childName: "Aarav", parentId: "priya", menuItem: menu[0] },
      { date: "2026-09-02" },
      { date: "2026-09-03", childName: "Leo", parentId: "tom", menuItem: menu[3] },
      { date: "2026-09-04" },
    ],
    defaulters: ["Rahul Mehta", "Meera Iyer"],
  },
  {
    id: "Elementary",
    slots: [
      { date: "2026-09-01" },
      { date: "2026-09-02", childName: "Kabir", parentId: "rahul", menuItem: menu[4] },
      { date: "2026-09-03" },
      { date: "2026-09-04", childName: "Imran", parentId: "sara", menuItem: menu[2] },
    ],
    defaulters: ["Priya Nair"],
  },
  {
    id: "Env-2",
    slots: [
      { date: "2026-09-01", childName: "Zoya", parentId: "sara", menuItem: menu[1] },
      { date: "2026-09-02" },
      { date: "2026-09-03" },
      { date: "2026-09-04", childName: "Nina", parentId: "meera", menuItem: menu[2] },
    ],
    defaulters: ["Rahul Mehta"],
  },
];

const adminTabs = [
  { id: "overview", label: "Overview" },
  { id: "defaulters", label: "Defaulters" },
  { id: "menu", label: "Menu" },
  { id: "roster", label: "Roster" },
  { id: "blackouts", label: "Blackout days" },
];

export default function PrototypeDemo() {
  const [role, setRole] = useState<"parent" | "admin">("parent");
  const [parentId, setParentId] = useState(parents[0].id);
  const [activeSectionId, setActiveSectionId] = useState(sections[0].id);
  const [activeAdminTab, setActiveAdminTab] = useState("overview");
  const [claimedSlots, setClaimedSlots] = useState<string[]>([]);
  const [cancelledSlots, setCancelledSlots] = useState<string[]>([]);

  const selectedParent = parents.find((parent) => parent.id === parentId)!;
  const activeSection =
    sections.find((section) => section.id === activeSectionId) ?? sections[0];
  const isMySection = selectedParent.sections.includes(activeSection.id);
  const hasSignedUp =
    activeSection.slots.some(
      (slot) =>
        slot.parentId === parentId &&
        !cancelledSlots.includes(`${activeSection.id}:${slot.date}`)
    ) ||
    activeSection.slots.some((slot) =>
      claimedSlots.includes(`${activeSection.id}:${slot.date}`)
    );

  function toggleSlot(slotKey: string, isExistingSignup: boolean) {
    if (isExistingSignup) {
      setCancelledSlots((current) =>
        current.includes(slotKey)
          ? current.filter((key) => key !== slotKey)
          : [...current, slotKey]
      );
      return;
    }

    setClaimedSlots((current) =>
      current.includes(slotKey)
        ? current.filter((key) => key !== slotKey)
        : [...current, slotKey]
    );
  }

  return (
    <>
      <BrandHeader
        actions={
          <div className="sr-role-toggle" role="group" aria-label="Demo role">
            {(["parent", "admin"] as const).map((demoRole) => (
              <button
                key={demoRole}
                type="button"
                className={role === demoRole ? "active" : ""}
                aria-pressed={role === demoRole}
                onClick={() => setRole(demoRole)}
              >
                {demoRole === "parent" ? "Parent" : "Admin"}
              </button>
            ))}
          </div>
        }
      />

      <Banner>
        Demo mode — sample data only. Changes here don&apos;t affect the live roster.
      </Banner>

      {role === "parent" ? (
        <>
          <div className="sr-demo-parent-controls">
            <Card>
              <label htmlFor="demo-parent" className="sr-label-small">
                Signed in as
              </label>
              <select
                id="demo-parent"
                className="sr-select"
                value={parentId}
                onChange={(event) => {
                  const nextParentId = event.target.value;
                  const nextParent = parents.find(
                    (parent) => parent.id === nextParentId
                  )!;
                  setParentId(nextParentId);
                  setActiveSectionId(nextParent.sections[0] ?? sections[0].id);
                  setClaimedSlots([]);
                  setCancelledSlots([]);
                }}
              >
                {parents.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.name}
                  </option>
                ))}
              </select>
            </Card>
          </div>

          <Tabs
            ariaLabel="Demo sections"
            items={sections.map((section) => ({
              id: section.id,
              label: `${section.id}${
                selectedParent.sections.includes(section.id) ? "" : " 👁"
              }`,
            }))}
            selectedId={activeSection.id}
            onSelect={setActiveSectionId}
          />

          <div className="sr-parent-grid">
            <Card>
              <SectionTitle>{activeSection.id} — September 2026</SectionTitle>
              {isMySection ? (
                hasSignedUp ? (
                  <Banner tone="success">
                    You&apos;re all set for {activeSection.id} this month.
                  </Banner>
                ) : (
                  <Banner>
                    You haven&apos;t signed up for {activeSection.id} yet — choose an open date.
                  </Banner>
                )
              ) : (
                <Banner>
                  Read-only view — your child isn&apos;t in this section.
                </Banner>
              )}
              <ul className="sr-list">
                {activeSection.slots.map((slot) => {
                  const key = `${activeSection.id}:${slot.date}`;
                  const claimed = claimedSlots.includes(key);
                  const cancelled = cancelledSlots.includes(key);
                  const isExistingSignup =
                    slot.parentId === parentId && !cancelled;
                  const isMine = isExistingSignup || claimed;
                  const isFilled =
                    (Boolean(slot.parentId) && !cancelled) || claimed;
                  const demoActions =
                    isMySection && isMine ? (
                      <button
                        type="button"
                        className="sr-btn sr-btn-secondary sr-btn-sm"
                        onClick={() => toggleSlot(key, isExistingSignup)}
                      >
                        Cancel
                      </button>
                    ) : isMySection && !isFilled ? (
                      <button
                        type="button"
                        className="sr-btn sr-btn-primary sr-btn-sm"
                        onClick={() => toggleSlot(key, false)}
                      >
                        Sign up
                      </button>
                    ) : undefined;

                  return (
                    <li key={key}>
                      <RosterSlot
                        date={slot.date}
                        status={isFilled ? "filled" : "open"}
                        childName={claimed ? "Aarav" : cancelled ? undefined : slot.childName}
                        menuItem={claimed ? menu[0] : cancelled ? undefined : slot.menuItem}
                        isMine={isMine}
                        actions={demoActions}
                      />
                    </li>
                  );
                })}
              </ul>
            </Card>

            <Card>
              <SectionTitle>Defaulters this month</SectionTitle>
              {activeSection.defaulters.length ? (
                <ul className="sr-list">
                  {activeSection.defaulters.map((name) => (
                    <li className="sr-defaulter" key={name}>
                      {name}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="sr-empty">Everyone is signed up.</div>
              )}
            </Card>
          </div>
        </>
      ) : (
        <>
          <Tabs
            ariaLabel="Demo admin sections"
            items={adminTabs}
            selectedId={activeAdminTab}
            onSelect={setActiveAdminTab}
          />
          {activeAdminTab === "overview" && (
            <div className="sr-admin-section-grid">
              <Card>
                <SectionTitle>Schedule auto-generated for September 2026</SectionTitle>
                <div className="sr-stat-row">
                  <StatCard value="12/22" label="Env-1" />
                  <StatCard value="16/22" label="Elementary" />
                  <StatCard value="9/22" label="Env-2" />
                </div>
                <p className="sr-muted">Weekdays only. Holidays and blackout days excluded.</p>
              </Card>
              {sections.map((section) => (
                <Card key={section.id}>
                  <SectionTitle>{section.id}</SectionTitle>
                  <p className="sr-muted">
                    {section.slots.filter((slot) => slot.parentId).length} of 22 slots filled
                  </p>
                </Card>
              ))}
            </div>
          )}
          {activeAdminTab === "defaulters" && (
            <Card>
              <SectionTitle>Not yet signed up this month</SectionTitle>
              {sections.flatMap((section) =>
                section.defaulters.map((name) => (
                  <div className="sr-defaulter" key={`${section.id}:${name}`}>
                    <span>{name}</span>
                    <span className="sr-chip sr-chip-open">{section.id}</span>
                  </div>
                ))
              )}
            </Card>
          )}
          {activeAdminTab === "menu" && (
            <Card>
              <SectionTitle>Global default menu</SectionTitle>
              {menu.map((item) => (
                <div className="sr-menu-item" key={item}>{item}</div>
              ))}
            </Card>
          )}
          {activeAdminTab === "roster" && (
            <Card>
              <SectionTitle>Roster preview</SectionTitle>
              {parents.map((parent) => (
                <div className="sr-menu-item" key={parent.id}>
                  <span>{parent.name}</span>
                  <span className="sr-muted">{parent.sections.join(", ")}</span>
                </div>
              ))}
            </Card>
          )}
          {activeAdminTab === "blackouts" && (
            <Card>
              <SectionTitle>Blackout days</SectionTitle>
              <div className="sr-empty">No blackout days added yet.</div>
            </Card>
          )}
        </>
      )}
    </>
  );
}
