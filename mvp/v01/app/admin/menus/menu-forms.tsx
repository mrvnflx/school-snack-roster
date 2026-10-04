"use client";

import { useState, useTransition } from "react";
import {
  ensureMenu,
  addMenuItem,
  deleteMenuItem,
  deleteSectionMenuOverride,
} from "@/lib/admin-actions";

type MenuItem = { id: string; name: string; position: number };
type Menu = { id: string; sectionId: string | null; name: string; items: MenuItem[] };

function ItemList({ menuId, items }: { menuId: string; items: MenuItem[] }) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");

  return (
    <div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((item) => (
          <li key={item.id} className="sr-menu-item">
            <span>{item.name}</span>
            <button
              onClick={() => startTransition(() => { deleteMenuItem(item.id); })}
              className="sr-btn sr-btn-coral sr-btn-sm"
            >
              Remove
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="sr-muted">No items yet.</li>}
      </ul>
      <div className="sr-row">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New item"
          className="sr-input"
          style={{ flex: 1 }}
        />
        <button
          disabled={pending}
          className="sr-btn sr-btn-primary sr-btn-sm"
          onClick={(e) => {
            e.preventDefault();
            startTransition(() => { addMenuItem(menuId, name, items.length + 1); });
            setName("");
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default function MenuForms({
  sections,
  globalMenu,
  sectionMenus,
}: {
  sections: { id: string; name: string }[];
  globalMenu: Menu | null;
  sectionMenus: Menu[];
}) {
  const [pending, startTransition] = useTransition();
  const [overrideSection, setOverrideSection] = useState(sections[0]?.id ?? "");

  const sectionsWithOverride = new Set(
    sectionMenus.filter((m) => m.sectionId !== null).map((m) => m.sectionId!)
  );
  const sectionsWithoutOverride = sections.filter((s) => !sectionsWithOverride.has(s.id));

  return (
    <>
      <div className="sr-card">
        <div className="sr-section-title" style={{ marginBottom: 10 }}>Global default menu</div>
        <p className="sr-muted" style={{ marginBottom: 10 }}>
          Used by any section without its own override.
        </p>
        {globalMenu ? (
          <ItemList menuId={globalMenu.id} items={globalMenu.items} />
        ) : (
          <button
            disabled={pending}
            onClick={() => startTransition(() => { ensureMenu(null); })}
            className="sr-btn sr-btn-primary"
          >
            Create global menu
          </button>
        )}
        <p className="sr-banner" style={{ marginTop: 10 }}>
          Sections without a custom menu automatically inherit this global list.
        </p>
      </div>

      {sectionMenus.map((m) => (
        <div className="sr-card" key={m.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div className="sr-section-title" style={{ marginBottom: 0 }}>
              {sections.find((s) => s.id === m.sectionId)?.name ?? "?"}
            </div>
            <button
              onClick={() => startTransition(() => { deleteSectionMenuOverride(m.id); })}
              className="sr-btn sr-btn-ghost sr-btn-sm"
              style={{ color: "var(--coral)" }}
            >
              Revert to global
            </button>
          </div>
          <ItemList menuId={m.id} items={m.items} />
        </div>
      ))}

      {sectionsWithoutOverride.length > 0 && (
        <div className="sr-card">
          <div className="sr-section-title" style={{ marginBottom: 10 }}>Add section override</div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              startTransition(() => { ensureMenu(overrideSection); });
            }}
          >
            <div className="sr-row">
              <select
                value={overrideSection}
                onChange={(e) => setOverrideSection(e.target.value)}
                className="sr-select"
                style={{ flex: 1 }}
              >
                {sectionsWithoutOverride.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={pending}
                className="sr-btn sr-btn-primary sr-btn-sm"
              >
                Add override
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
