"use client";

import { useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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

function LoginContent({ isInMemoryMode }: LoginFormProps) {
  const searchParams = useSearchParams();
  const sent = searchParams.get("sent");
  const sentEmail = searchParams.get("email") || "";
  const errorMessage = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSelectDemo(demoEmail: string) {
    setEmail(demoEmail);
    setSelectedDemo(demoEmail);
    setLoading(true);
    setTimeout(() => {
      formRef.current?.submit();
    }, 50);
  }

  if (sent === "true") {
    return (
      <>
        <BrandHeader />
        <div className="sr-card" style={{ textAlign: "center", padding: "32px 20px" }}>
          <div style={{ fontSize: "40px", marginBottom: 12 }}>✉️</div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--chalk-green-dark)", marginBottom: 8 }}>
            Check Your Inbox!
          </h1>
          <p className="sr-muted" style={{ fontSize: "14px", marginBottom: 20 }}>
            We've sent a magic sign-in link to <strong style={{ color: "var(--text)" }}>{sentEmail}</strong>.
            <br />Check your email (or your anon email forwarder) and click the link to sign in.
          </p>
          <div style={{ background: "#F6F8F6", borderRadius: "10px", padding: "12px", marginBottom: 20, border: "1px solid #E2E8E0", fontSize: "13px", color: "var(--muted)" }}>
            Tip: If testing locally without a live Resend API key, check your terminal console for the direct magic link URL.
          </div>
          <a
            href="/login"
            className="sr-btn sr-btn-primary"
            style={{ display: "inline-block", textDecoration: "none" }}
          >
            ← Use a Different Email
          </a>
        </div>
      </>
    );
  }

  return (
    <>
      <BrandHeader />

      <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--chalk-green-dark)", marginBottom: 6 }}>
        Passwordless Sign In via Resend
      </h1>
      <p className="sr-muted" style={{ marginBottom: 20, fontSize: "14px" }}>
        Enter your email or select a demo persona below to receive a secure magic link.
      </p>

      {errorMessage && (
        <div style={{ background: "#FDF2F2", border: "1px solid #F8B4B4", color: "#9B2C2C", padding: "12px 16px", borderRadius: "10px", marginBottom: 20, fontSize: "14px" }}>
          ⚠️ {decodeURIComponent(errorMessage)}
        </div>
      )}

      {/* Demo Accounts Quick Picker */}
      <div className="sr-card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--chalk-green-dark)", marginBottom: 12 }}>
          Quick Demo Personas (Sends Magic Link)
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {DEMO_ACCOUNTS.map((acc) => {
            const isSelected = email === acc.email;
            return (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleSelectDemo(acc.email)}
                disabled={loading}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: isSelected ? "2px solid var(--chalk-green)" : "1px solid var(--border)",
                  background: isSelected ? "#F4F8F3" : "#FAFAFA",
                  cursor: loading ? "wait" : "pointer",
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
        <form ref={formRef} action="/login/form" method="POST" onSubmit={() => setLoading(true)}>
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
              ✨ Resend Magic Link Authentication
            </div>
            <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0, lineHeight: 1.4 }}>
              Clicking sign in will send a secure magic link to your email inbox via Resend.
            </p>
          </div>

          <div className="sr-row">
            <button
              type="submit"
              disabled={loading || !email}
              className="sr-btn sr-btn-primary sr-btn-block"
            >
              {loading ? "Sending Magic Link..." : "✨ Send Magic Link & Sign In"}
            </button>
          </div>
        </form>
      </div>

      <p className="sr-muted" style={{ fontSize: "12px", textAlign: "center", marginTop: 16 }}>
        Powered by Resend.com — Independent Email Authentication (No Supabase Required).
      </p>
    </>
  );
}

export default function LoginForm(props: LoginFormProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent {...props} />
    </Suspense>
  );
}
