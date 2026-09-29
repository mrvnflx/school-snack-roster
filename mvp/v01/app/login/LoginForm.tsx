"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type LoginFormProps = {
  isInMemoryMode: boolean;
};

export default function LoginForm({ isInMemoryMode }: LoginFormProps) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"phone" | "code">("phone");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const tidy = phone.replace(/[\s-]/g, "");
    if (!/^\+?\d{10,15}$/.test(tidy)) {
      setLoading(false);
      return setError("Enter a valid phone number (e.g. +919876543210).");
    }

    setStage("code");
    setLoading(false);
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (code.length < 4) {
      setLoading(false);
      return setError("Enter the code you received.");
    }

    // In-memory mode: accept any non-empty code and redirect.
    setLoading(false);
    router.push("/");
    router.refresh();
  }

  return (
    <main className="sr-app" style={{ padding: "14px 14px 40px" }}>
      <div className="sr-top">
        <div className="sr-brand">
          <span className="sr-brand-dot" />
          <h1>Snack Roster</h1>
        </div>
      </div>

      <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--chalk-green-dark)", marginBottom: 16 }}>
        Sign in
      </h1>

      <div className="sr-card">
        {stage === "phone" && (
          <form onSubmit={sendCode}>
            <label className="sr-label-small">Phone number</label>
            <input
              type="tel"
              required
              placeholder="+91XXXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="sr-input"
            />
            <div className="sr-row">
              <button
                type="submit"
                disabled={loading}
                className="sr-btn sr-btn-primary sr-btn-block"
              >
                {loading ? "Sending…" : "Send code"}
              </button>
            </div>
          </form>
        )}

        {stage === "code" && (
          <form onSubmit={verifyCode}>
            <p className="sr-muted" style={{ marginBottom: 10 }}>
              Enter the code sent to {phone}.
            </p>
            <input
              type="text"
              required
              inputMode="numeric"
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="sr-input"
            />
            <div className="sr-row">
              <button
                type="submit"
                disabled={loading}
                className="sr-btn sr-btn-primary sr-btn-block"
              >
                {loading ? "Verifying…" : "Verify & Log in"}
              </button>
            </div>
          </form>
        )}

        {error && (
          <p style={{ color: "var(--coral)", fontSize: "13px", marginTop: 8 }}>
            {error}
          </p>
        )}
      </div>

      <p
        className="sr-muted"
        style={{
          fontSize: "12px",
          textAlign: "center",
          marginTop: 14,
          background: isInMemoryMode ? "#E7F0E5" : "transparent",
          border: isInMemoryMode ? "1px solid #C8DCC4" : "none",
          borderRadius: "12px",
          padding: isInMemoryMode ? "10px 12px" : 0,
          color: isInMemoryMode ? "#31502B" : "var(--ink-soft)",
          fontWeight: isInMemoryMode ? 500 : 400,
        }}
      >
        {isInMemoryMode
          ? "Development mode — any code is accepted."
          : "MVP note: no SMS provider is wired up yet. Configure a Test Phone Number in Supabase Auth settings to log in during development."}
      </p>
    </main>
  );
}
