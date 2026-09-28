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
      <ul className="text-sm space-y-1 mb-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between border-b py-1">
            {item.name}
            <button
              onClick={() => startTransition(() => { deleteMenuItem(item.id); })}
              className="text-xs text-red-600"
            >
              Remove
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="text-xs text-gray-400">No items yet.</li>}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(() => { addMenuItem(menuId, name, items.length + 1); });
          setName("");
        }}
        className="flex gap-2"
      >
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New item"
          className="flex-1 border rounded px-2 py-1 text-sm"
        />
        <button disabled={pending} className="bg-green-800 text-white rounded px-3 text-sm">
          Add
        </button>
      </form>
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
    <div className="space-y-8">
      <section>
        <h2 className="font-semibold mb-2">Global default menu</h2>
        <p className="text-xs text-gray-500 mb-2">
          Used by any section without its own override.
        </p>
        {globalMenu ? (
          <ItemList menuId={globalMenu.id} items={globalMenu.items} />
        ) : (
          <button
            disabled={pending}
            onClick={() => startTransition(() => { ensureMenu(null); })}
            className="text-sm bg-green-800 text-white rounded px-3 py-1.5"
          >
            Create global menu
          </button>
        )}
      </section>

      <section>
        <h2 className="font-semibold mb-2">Section overrides</h2>
        {sectionMenus.map((m) => (
          <div key={m.id} className="mb-4 border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">
                {sections.find((s) => s.id === m.sectionId)?.name ?? "?"}
              </p>
              <button
                onClick={() => startTransition(() => { deleteSectionMenuOverride(m.id); })}
                className="text-xs text-red-600"
              >
                Revert to global
              </button>
            </div>
            <ItemList menuId={m.id} items={m.items} />
          </div>
        ))}

        {sectionsWithoutOverride.length > 0 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              startTransition(() => { ensureMenu(overrideSection); });}
            }
            className="flex gap-2"
          >
            <select
              value={overrideSection}
              onChange={(e) => setOverrideSection(e.target.value)}
              className="flex-1 border rounded px-2 py-1 text-sm"
            >
              {sectionsWithoutOverride.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <button disabled={pending} className="bg-green-800 text-white rounded px-3 text-sm">
              Add override
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
