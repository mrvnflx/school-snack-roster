"use client";

import { useState } from "react";
import { BrandHeader } from "@/components/design-system";

type LoginFormProps = {
  isInMemoryMode: boolean;
};

const DEMO_ACCOUNTS = [
  { name: "Admin User", email: "admin@example.com", role: "admin", desc: "Full access (admin dashboard, menus, schedules)" },
  { name: "Priya Nair", email: "priya@example.com", role: "parent", desc: "Parent of Aarav & Diya (Env-1)" },
  { name: "Rahul Mehta", email: "rahul@example.com", role: "parent", desc: "Parent of Kabir (Elementary)" },
  { name: "Sara Khan", email: "sara@example.com", role: "parent", desc: "Parent of Zoya & Imran" },
  { name: "Tom Fischer", email: "tom@example.com", role: "parent", desc: "Parent of Leo (Env-1)" },
];

export default function LoginForm({ isInMemoryMode }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSelectDemo(demoEmail: string) {
    setEmail(demoEmail);
    setSelectedDemo(demoEmail);
  }

  return (
    <>
      <BrandHeader />

      <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--chalk-green-dark)", marginBottom: 6 }}>
        Passwordless Sign In
      </h1>
      <p className="sr-muted" style={{ marginBottom: 20, fontSize: "14px" }}>
        Sign in instantly with mock email magic link or choose a demo persona below.
      </p>

      {/* Demo Accounts Quick Picker */}
      <div className="sr-card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--chalk-green-dark)", marginBottom: 12 }}>
          Quick Demo Personas
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {DEMO_ACCOUNTS.map((acc) => {
            const isSelected = email === acc.email;
            return (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleSelectDemo(acc.email)}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: isSelected ? "2px solid var(--chalk-green)" : "1px solid var(--border)",
                  background: isSelected ? "#F4F8F3" : "#FAFAFA",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.15s ease",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text)" }}>
                    {acc.role === "admin" ? "🛡️ " : "👤 "} {acc.name}
                    <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--muted)", marginLeft: 8 }}>
                      ({acc.email})
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: 2 }}>
                    {acc.desc}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    background: acc.role === "admin" ? "#E8F0FE" : "#E7F0E5",
                    color: acc.role === "admin" ? "#1A73E8" : "#31502B",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  {acc.role}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Email Login Form */}
      <div className="sr-card">
        <form action="/login/form" method="POST" onSubmit={() => setLoading(true)}>
          <label className="sr-label-small" htmlFor="email-input">
            Email Address
          </label>
          <input
            id="email-input"
            type="email"
            name="email"
            required
            placeholder="name@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setSelectedDemo(null);
            }}
            className="sr-input"
            style={{ marginBottom: 14 }}
          />

          <div style={{ background: "#F6F8F6", borderRadius: "10px", padding: "12px", marginBottom: 16, border: "1px solid #E2E8E0" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--chalk-green-dark)", marginBottom: 4 }}>
              ✨ Mock Magic Link Simulation
            </div>
            <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0, lineHeight: 1.4 }}>
              In mock mode, clicking sign in immediately authorizes your session without needing an actual email inbox click.
            </p>
          </div>

          <div className="sr-row">
            <button
              type="submit"
              disabled={loading || !email}
              className="sr-btn sr-btn-primary sr-btn-block"
            >
              {loading ? "Authorizing session..." : "✨ Send Magic Link & Sign In"}
            </button>
          </div>
        </form>
      </div>

      <p
        className="sr-muted"
        style={
          isInMemoryMode
            ? {
                fontSize: "12px",
                textAlign: "center",
                marginTop: 16,
                background: "#E7F0E5",
                border: "1px solid #C8DCC4",
                borderRadius: "12px",
                padding: "10px 12px",
                color: "#31502B",
                fontWeight: 500,
              }
            : {
                fontSize: "12px",
                textAlign: "center",
                marginTop: 16,
              }
        }
      >
        {isInMemoryMode
          ? "Development In-Memory Mode — instant mock email authentication."
          : "Production mode — Supabase Auth email magic link enabled."}
      </p>
    </>
  );
}
