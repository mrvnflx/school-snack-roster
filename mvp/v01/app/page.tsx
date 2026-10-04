import { redirect } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";

export default async function Home() {
  const db = getDb();
  const user = await db.auth.getUser();
  if (!user) redirect("/login");

  const profile = await db.profiles.getById(user.id);
  const sections = await db.sections.list(false);

  return (
    <>
      <div className="sr-top">
        <div className="sr-brand">
          <span className="sr-brand-dot" />
          <h1>Snack Roster</h1>
        </div>
        {profile?.role === "admin" && (
          <Link href="/admin" className="sr-btn-ghost">Admin</Link>
        )}
      </div>

      <p className="sr-muted" style={{ marginBottom: 14 }}>
        {profile?.fullName || user.phone} — pick a section to view its calendar.
      </p>

      <div className="sr-card">
        <div className="sr-section-title" style={{ marginBottom: 10 }}>
          Sections — September 2026
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {sections?.map((s) => (
            <li key={s.id}>
              <Link
                href={`/section/${s.id}`}
                className="sr-slot"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="sr-slot-info">
                  <span className="sr-slot-info-name" style={{ display: "block", marginBottom: 2 }}>{s.name}</span>
                  <span className="sr-muted">View calendar</span>
                </span>
                <span className="sr-btn sr-btn-primary sr-btn-sm" style={{ marginLeft: "auto" }}>
                  Open
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {!sections?.length && (
        <div className="sr-empty">No sections set up yet.</div>
      )}
    </>
  );
}
