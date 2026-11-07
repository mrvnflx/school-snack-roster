import Link from "next/link";
import type { ReactNode } from "react";

export function BrandHeader({ actions }: { actions?: ReactNode }) {
  return (
    <header className="sr-top">
      <div className="sr-brand">
        <span className="sr-brand-dot" aria-hidden="true" />
        <h1>Snack Roster</h1>
      </div>
      {actions}
    </header>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <section className="sr-card">{children}</section>;
}

export function Banner({
  children,
  tone,
}: {
  children: ReactNode;
  tone?: "success";
}) {
  return (
    <div className={`sr-banner${tone === "success" ? " ok" : ""}`}>
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="sr-section-title">{children}</h2>;
}

export type TabItem = {
  id: string;
  label: string;
  href?: string;
};

export function Tabs({
  items,
  selectedId,
  onSelect,
  ariaLabel,
}: {
  items: TabItem[];
  selectedId: string;
  onSelect?: (id: string) => void;
  ariaLabel: string;
}) {
  return (
    <nav className="sr-tabs" aria-label={ariaLabel}>
      {items.map((item) =>
        item.href ? (
          <Link
            key={item.id}
            href={item.href}
            className={`sr-tab${item.id === selectedId ? " active" : ""}`}
            aria-current={item.id === selectedId ? "page" : undefined}
          >
            {item.label}
          </Link>
        ) : (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect?.(item.id)}
            className={`sr-tab${item.id === selectedId ? " active" : ""}`}
            aria-pressed={item.id === selectedId}
          >
            {item.label}
          </button>
        )
      )}
    </nav>
  );
}

export function StatCard({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="sr-stat">
      <div className="sr-stat-num">{value}</div>
      <div className="sr-stat-lbl">{label}</div>
    </div>
  );
}

export function RosterSlot({
  date,
  status,
  childName,
  menuItem,
  isMine = false,
  actions,
  children,
}: {
  date: string;
  status: "open" | "filled";
  childName?: string;
  menuItem?: string;
  isMine?: boolean;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  const dateValue = new Date(`${date}T00:00:00`);
  const weekday = dateValue.toLocaleDateString("en-US", { weekday: "short" });
  const shortDate = dateValue.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="sr-slot">
      <span className="sr-slot-date">
        {weekday}
        <br />
        {shortDate}
      </span>
      <div className="sr-slot-info">
        {status === "filled" ? (
          <span className="sr-slot-info-name">{childName ?? "Signed up"}</span>
        ) : (
          <span className="sr-muted">Open slot</span>
        )}
        {status === "filled" && menuItem && (
          <span className="sr-slot-info-item">{menuItem}</span>
        )}
        {isMine && status === "filled" && (
          <span className="sr-chip sr-chip-mine">You</span>
        )}
      </div>
      <div className="sr-slot-actions">
        {actions ??
          (status === "filled" ? (
            <span className="sr-chip sr-chip-filled">Filled</span>
          ) : (
            <span className="sr-chip sr-chip-open">Open</span>
          ))}
      </div>
      {children && (
        <div style={{ gridColumn: "1 / -1" }}>
          {children}
        </div>
      )}
    </div>
  );
}
